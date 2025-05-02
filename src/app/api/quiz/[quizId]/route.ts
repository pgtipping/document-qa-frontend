import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getCompletion } from "@/lib/llm-service";

// Simple interface for quiz question properties we need
interface QuizQuestionType {
  id: string;
  questionText: string;
  answerType: string;
  options: any;
  correctAnswer: string;
  points: number;
}

// GET: Retrieve quiz by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const quizId = params.quizId;

    // Retrieve quiz
    // @ts-ignore - Prisma type issue in deployment
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: true,
        document: {
          select: {
            id: true,
            filename: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if user has access to this quiz
    // Allow access if user created the quiz OR if quiz is public
    if (quiz.userId !== userId && !quiz.isPublic) {
      return NextResponse.json(
        { error: "You don't have access to this quiz" },
        { status: 403 }
      );
    }

    // Format the questions for client-side use
    // @ts-ignore - Handling JSON parsing safely
    const formattedQuestions = quiz.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      answerType: question.answerType,
      points: question.points,
      options: question.options ? JSON.parse(question.options as string) : null,
    }));

    // Return quiz with questions
    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      document: {
        id: quiz.document.id,
        filename: quiz.document.filename,
      },
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Error retrieving quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const quizId = params.quizId;
    const body = await request.json();
    const { answers, timeTaken } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid answers format. Expected array of answers." },
        { status: 400 }
      );
    }

    // Check if quiz exists
    // @ts-ignore - Prisma type issue in deployment
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Initialize grading variables
    let totalPoints = 0;
    let earnedPoints = 0;

    // @ts-ignore - We know the structure matches QuizQuestionType
    const questionMap = new Map<string, QuizQuestionType>(
      quiz.questions.map((q) => [q.id, q])
    );

    // Create quiz result
    // @ts-ignore - Prisma type issue in deployment
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId,
        userId,
        score: 0, // Will update after grading
        totalPoints: 0, // Will update after grading
        earnedPoints: 0, // Will update after grading
        timeTaken,
      },
    });

    // Process each answer
    const responsePromises = answers.map(
      async (answer: { questionId: string; userAnswer: string }) => {
        const { questionId, userAnswer } = answer;
        const question = questionMap.get(questionId);

        if (!question) {
          throw new Error(`Question with ID ${questionId} not found in quiz`);
        }

        // Add to total points
        totalPoints += question.points;

        // Check if answer is correct
        let isCorrect = false;

        // For multiple-choice and true/false, do exact matching
        if (
          question.answerType === "multiple_choice" ||
          question.answerType === "true_false"
        ) {
          isCorrect = userAnswer === question.correctAnswer;
          if (isCorrect) {
            earnedPoints += question.points;
          }
        }
        // For short answers, use LLM to evaluate
        else if (question.answerType === "short_answer") {
          const evaluationPrompt = `
          Question: ${question.questionText}
          Correct answer: ${question.correctAnswer}
          User's answer: ${userAnswer}
          
          Evaluate if the user's answer is correct when compared to the correct answer.
          Consider semantic equivalence, not just exact matching.
          Only respond with "CORRECT" or "INCORRECT".
        `;

          const evaluation = await getCompletion(evaluationPrompt);
          isCorrect = evaluation
            ? evaluation.trim().toUpperCase().includes("CORRECT")
            : false;
          if (isCorrect) {
            earnedPoints += question.points;
          }
        }

        // Save the response
        // @ts-ignore - Prisma type issue in deployment
        return prisma.quizResponse.create({
          data: {
            resultId: quizResult.id,
            questionId,
            userAnswer,
            isCorrect,
          },
        });
      }
    );

    // Wait for all responses to be processed
    await Promise.all(responsePromises);

    // Calculate score as percentage
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Generate feedback based on score
    let feedback;
    if (score >= 90) {
      feedback = "Excellent! You have a strong understanding of the material.";
    } else if (score >= 70) {
      feedback = "Good work! You have a good grasp of most concepts.";
    } else if (score >= 50) {
      feedback = "You're making progress, but there's room for improvement.";
    } else {
      feedback =
        "You might want to review the material again to strengthen your understanding.";
    }

    // Update the quiz result with final score and feedback
    // @ts-ignore - Prisma type issue in deployment
    const updatedResult = await prisma.quizResult.update({
      where: {
        id: quizResult.id,
      },
      data: {
        score,
        totalPoints,
        earnedPoints,
        feedback,
      },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    // Return the result with detailed feedback
    return NextResponse.json({
      resultId: updatedResult.id,
      score: updatedResult.score,
      earnedPoints: updatedResult.earnedPoints,
      totalPoints: updatedResult.totalPoints,
      feedback: updatedResult.feedback,
      timeTaken: updatedResult.timeTaken,
    });
  } catch (error) {
    console.error("Error submitting quiz answers:", error);
    return NextResponse.json(
      {
        error: "Failed to submit quiz answers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
