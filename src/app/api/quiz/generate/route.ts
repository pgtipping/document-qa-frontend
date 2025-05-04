import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getDocumentTextContent } from "@/lib/document-processing";
import { getCompletion } from "@/lib/llm-service";
import { Prisma } from "@prisma/client";

// Define the type for the question object returned from the LLM
interface LLMQuizQuestion {
  questionText: string;
  answerType: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
}

// Constants for quiz generation
const DEFAULT_QUIZ_SIZE = 5; // Default number of questions
const QUIZ_TITLE_PROMPT = `Create a short but descriptive title for a quiz about the following document content. The title should be at most 7 words:`;
const QUIZ_QUESTIONS_PROMPT = `You are an expert education specialist creating a quiz for students to test their knowledge.
Based on the following document content, generate {quizSize} quiz questions with difficulty level: {difficulty}.
Each question should test understanding of key concepts in the document.

Guidelines for difficulty levels:
- Easy: Basic recall and simple comprehension questions
- Medium: Application and analysis questions requiring understanding of concepts
- Hard: Evaluation and synthesis questions requiring deep understanding and connection between concepts

For each question, include:
1. A clear, concise question
2. The question type (multiple_choice, true_false, or short_answer)
3. For multiple_choice: 4 possible answer options labeled A, B, C, D
4. The correct answer
5. A brief explanation of why the answer is correct
6. The difficulty level (easy, medium, hard) - assign a mix of difficulties matching the overall quiz difficulty level

Format your response exactly as JSON with the following structure:
[
  {
    "questionText": "Question text here",
    "answerType": "multiple_choice", 
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explanation of why Option A is correct",
    "difficulty": "medium"
  },
  ...
]

For true_false questions, "options" should be ["True", "False"].
For short_answer questions, "options" should be null.
Ensure all content is factually accurate based only on the document content.
`;

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log("Quiz Generate API: Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const {
      documentId,
      quizSize = DEFAULT_QUIZ_SIZE,
      difficulty = "medium",
    } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId in request body" },
        { status: 400 }
      );
    }

    // Check if document exists and belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: userId,
        status: "active",
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found or not authorized" },
        { status: 404 }
      );
    }

    // Get document content
    const documentContent = await getDocumentTextContent(document.s3Key);
    if (!documentContent || documentContent.length < 100) {
      return NextResponse.json(
        { error: "Document content is too short or could not be extracted" },
        { status: 400 }
      );
    }

    // Generate a title for the quiz based on document content
    const titlePrompt = `${QUIZ_TITLE_PROMPT}\n\nDocument content:\n${documentContent.substring(
      0,
      1500
    )}`;
    const quizTitle = await getCompletion(titlePrompt);

    // Generate quiz questions
    let adjustedPrompt = QUIZ_QUESTIONS_PROMPT.replace(
      "{quizSize}",
      quizSize.toString()
    );
    adjustedPrompt = adjustedPrompt.replace("{difficulty}", difficulty);

    const questionsPrompt = `${adjustedPrompt}\n\nDocument content:\n${documentContent}`;
    const questionsResponse = await getCompletion(questionsPrompt);

    // Parse the JSON response from the LLM
    let questions: LLMQuizQuestion[];
    try {
      if (!questionsResponse) {
        throw new Error("No response received from LLM");
      }
      questions = JSON.parse(questionsResponse);
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
    } catch (error) {
      console.error("Failed to parse LLM response as JSON:", error);
      return NextResponse.json(
        { error: "Failed to generate valid quiz questions" },
        { status: 500 }
      );
    }

    // Create the quiz questions data for Prisma - proper null handling for JSON fields
    const questionsData = questions.map((q: LLMQuizQuestion) => {
      return {
        questionText: q.questionText,
        answerType: q.answerType,
        options: q.options === null ? Prisma.JsonNull : q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null,
        difficulty: q.difficulty || difficulty, // Default to overall quiz difficulty if not specified
      };
    });

    // Create quiz in database
    const quiz = await prisma.quiz.create({
      data: {
        title: quizTitle || `Quiz on ${document.filename}`,
        description: `Quiz generated from ${document.filename}`,
        difficulty: difficulty,
        userId: userId,
        documentId: documentId,
        questions: {
          create: questionsData,
        },
      },
      include: {
        questions: true,
      },
    });

    // Calculate processing time
    const totalTime = (performance.now() - startTime) / 1000; // in seconds

    // Return the created quiz data
    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      questionCount: questions.length,
      difficulty: quiz.difficulty,
      processingTime: totalTime,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error during quiz generation";

    return NextResponse.json(
      { error: "Failed to generate quiz", details: errorMessage },
      { status: 500 }
    );
  }
}
