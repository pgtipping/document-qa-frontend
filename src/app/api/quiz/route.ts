import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: List all quizzes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const documentId = searchParams.get("documentId") || undefined;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { userId };

    // Add documentId filter if provided
    if (documentId) {
      filter.documentId = documentId;
    }

    // Count total number of quizzes
    const totalQuizzes = await prisma.quiz.count({
      where: filter,
    });

    // Fetch quizzes for the user
    const quizzes = await prisma.quiz.findMany({
      where: filter,
      include: {
        document: {
          select: {
            id: true,
            filename: true,
          },
        },
        questions: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format the response
    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      createdAt: quiz.createdAt,
      isPublic: quiz.isPublic,
      document: quiz.document,
      questionCount: quiz.questions.length,
      resultCount: quiz._count.results,
      questions: quiz.questions,
    }));

    // Calculate pagination data
    const totalPages = Math.ceil(totalQuizzes / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      quizzes: formattedQuizzes,
      pagination: {
        page,
        limit,
        totalQuizzes,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quizzes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
