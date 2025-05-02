import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getCompletion } from "@/lib/llm-service";

// GET: Retrieve a quiz and its questions
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeAnswers = searchParams.get("includeAnswers") === "true";

    // First check if quiz exists and user has access
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        document: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check authorization (user owns the quiz or quiz is public)
    if (quiz.userId !== userId && !quiz.isPublic) {
      return NextResponse.json(
        { error: "Unauthorized to access this quiz" },
        { status: 403 }
      );
    }

    // Fetch questions with or without correct answers based on parameter
    const questions = await prisma.quizQuestion.findMany({
      where: {
        quizId: quizId,
      },
      select: {
        id: true,
        questionText: true,
        answerType: true,
        options: true,
        ...(includeAnswers ? { correctAnswer: true, explanation: true } : {}),
        points: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Format the options for each question
    const formattedQuestions = questions.map((question) => ({
      ...question,
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
    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));

    // Create quiz result
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
          isCorrect = evaluation.trim().toUpperCase().includes("CORRECT");
          if (isCorrect) {
            earnedPoints += question.points;
          }
        }

        // Save the response
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
