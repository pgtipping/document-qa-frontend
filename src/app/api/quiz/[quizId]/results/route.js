import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
// GET: Retrieve results for a quiz
export async function GET(request, { params }) {
    try {
        const quizId = params.quizId;
        const searchParams = request.nextUrl.searchParams;
        const resultId = searchParams.get("resultId");
        const shareCode = searchParams.get("shareCode");
        // If specific result ID is provided, retrieve only that result
        if (resultId) {
            const result = await prisma.quizResult.findUnique({
                where: {
                    id: resultId,
                },
                include: {
                    quiz: {
                        include: {
                            document: {
                                select: {
                                    filename: true,
                                },
                            },
                        },
                    },
                    responses: {
                        include: {
                            question: true,
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            if (!result) {
                return NextResponse.json({ error: "Result not found" }, { status: 404 });
            }
            // Check authorization
            const session = await getAuthSession();
            const isShared = result.isShared && shareCode === result.shareUrl;
            // Allow access if:
            // 1. Result is shared and correct share code is provided, OR
            // 2. User is authenticated and owns the result
            if (!isShared &&
                (!session?.user?.id || session.user.id !== result.userId)) {
                return NextResponse.json({ error: "Unauthorized to access this result" }, { status: 403 });
            }
            // Format the response data
            const formattedResponses = result.responses.map((response) => ({
                id: response.id,
                questionText: response.question.questionText,
                answerType: response.question.answerType,
                options: response.question.options
                    ? JSON.parse(response.question.options)
                    : null,
                correctAnswer: response.question.correctAnswer,
                userAnswer: response.userAnswer,
                isCorrect: response.isCorrect,
                explanation: response.question.explanation,
            }));
            return NextResponse.json({
                id: result.id,
                score: result.score,
                earnedPoints: result.earnedPoints,
                totalPoints: result.totalPoints,
                feedback: result.feedback,
                timeTaken: result.timeTaken,
                completedAt: result.completedAt,
                quiz: {
                    id: result.quiz.id,
                    title: result.quiz.title,
                    description: result.quiz.description,
                    document: {
                        filename: result.quiz.document.filename,
                    },
                },
                user: result.user,
                responses: formattedResponses,
                isShared: result.isShared,
                shareUrl: result.isShared ? result.shareUrl : null,
            });
        }
        // Otherwise, retrieve all results for the quiz (with authorization check)
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
            select: {
                userId: true,
            },
        });
        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }
        // Only allow quiz creator to see all results
        if (quiz.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized to access quiz results" }, { status: 403 });
        }
        // Fetch all results for this quiz
        const results = await prisma.quizResult.findMany({
            where: {
                quizId: quizId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                completedAt: "desc",
            },
        });
        return NextResponse.json({
            results: results.map((result) => ({
                id: result.id,
                score: result.score,
                earnedPoints: result.earnedPoints,
                totalPoints: result.totalPoints,
                completedAt: result.completedAt,
                user: result.user,
                isShared: result.isShared,
            })),
        });
    }
    catch (error) {
        console.error("Error retrieving quiz results:", error);
        return NextResponse.json({
            error: "Failed to retrieve quiz results",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
// POST: Update sharing settings for a quiz result
export async function POST(request, { params }) {
    try {
        // Authentication check
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        const quizId = params.quizId;
        const body = await request.json();
        const { resultId, isShared } = body;
        if (!resultId) {
            return NextResponse.json({ error: "Result ID is required" }, { status: 400 });
        }
        // Find the result
        const result = await prisma.quizResult.findUnique({
            where: {
                id: resultId,
            },
        });
        if (!result) {
            return NextResponse.json({ error: "Result not found" }, { status: 404 });
        }
        // Check if user owns the result
        if (result.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized to modify this result" }, { status: 403 });
        }
        // Generate a unique share URL if sharing is enabled
        let shareUrl = null;
        if (isShared) {
            shareUrl = crypto.randomBytes(16).toString("hex");
        }
        // Update the result
        const updatedResult = await prisma.quizResult.update({
            where: {
                id: resultId,
            },
            data: {
                isShared,
                shareUrl,
            },
        });
        return NextResponse.json({
            id: updatedResult.id,
            isShared: updatedResult.isShared,
            shareUrl: updatedResult.shareUrl,
        });
    }
    catch (error) {
        console.error("Error updating quiz result sharing:", error);
        return NextResponse.json({
            error: "Failed to update sharing settings",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
