import { NextResponse } from "next/server";
import * as auth from "@/lib/auth";
// Mock prisma client
const prisma = {
    quizResult: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    quiz: {
        findUnique: jest.fn(),
    },
};
// Mock the correct relationship structure between responses and questions
const mockResponses = [
    {
        id: "resp1",
        questionId: "q1",
        userAnswer: "Paris",
        isCorrect: true,
        question: {
            id: "q1",
            questionText: "What is the capital of France?",
            answerType: "multiple_choice",
            options: JSON.stringify(["London", "Berlin", "Paris", "Madrid"]),
            correctAnswer: "Paris",
            explanation: "Paris is the capital of France.",
        },
    },
    {
        id: "resp2",
        questionId: "q2",
        userAnswer: "False",
        isCorrect: true,
        question: {
            id: "q2",
            questionText: "The earth is flat.",
            answerType: "true_false",
            options: JSON.stringify(["True", "False"]),
            correctAnswer: "False",
            explanation: "The Earth is an oblate spheroid.",
        },
    },
];
// Update the mockQuizResult to include the responses
const mockQuizResult = {
    id: "result123",
    quizId: "quiz123",
    userId: "user123",
    score: 85,
    totalPoints: 30,
    earnedPoints: 25.5,
    timeTaken: 300,
    feedback: "Good work! You have a good grasp of most concepts.",
    completedAt: new Date("2025-05-01T12:00:00Z"),
    isShared: true,
    shareUrl: "abcdef123456",
    responses: mockResponses,
    quiz: {
        id: "quiz123",
        title: "Test Quiz",
        description: "Test quiz description",
        document: {
            filename: "test-document.pdf",
        },
    },
    user: {
        name: "Test User",
        email: "test@example.com",
    },
};
// Mock quiz results for listing endpoint
const mockQuizResults = [
    {
        id: "result123",
        score: 85,
        earnedPoints: 25.5,
        totalPoints: 30,
        completedAt: new Date("2025-05-01T12:00:00Z"),
        user: {
            name: "Test User",
            email: "test@example.com",
        },
        isShared: true,
    },
    {
        id: "result456",
        score: 60,
        earnedPoints: 18,
        totalPoints: 30,
        completedAt: new Date("2025-05-02T14:30:00Z"),
        user: {
            name: "Another User",
            email: "another@example.com",
        },
        isShared: false,
    },
];
// Mock quiz
const mockQuiz = {
    id: "quiz123",
    title: "Test Quiz",
    userId: "user123",
};
// Mock modules
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn((data, init) => ({
            status: init?.status || 200,
            json: async () => data,
        })),
    },
}));
jest.mock("@/lib/auth", () => ({
    getAuthSession: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: prisma,
}));
// Import the route handlers
// Use dynamic import to ensure mocks are fully set up first
let GET;
beforeAll(async () => {
    const routeModule = await import("@/app/api/quiz/[quizId]/results/route");
    GET = routeModule.GET;
});
// Create mock request function
const createMockRequest = (searchParams = {}) => {
    // Create a mock URL with the provided search parameters
    const url = new URL("https://example.com");
    Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    return {
        nextUrl: url,
    };
};
describe("Quiz Results API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        NextResponse.json.mockClear();
        // Setup mock authenticated user session
        auth.getAuthSession.mockResolvedValue({
            user: { id: "user123" },
        });
        // Setup mock quiz result for individual retrieval
        prisma.quizResult.findUnique.mockResolvedValue(mockQuizResult);
        // Setup mock quiz results for listing
        prisma.quizResult.findMany.mockResolvedValue(mockQuizResults);
        // Setup mock quiz
        prisma.quiz.findUnique.mockResolvedValue(mockQuiz);
    });
    describe("GET - Single Result", () => {
        it("should retrieve a specific quiz result when authenticated and authorized", async () => {
            // Create mock request with resultId parameter
            const request = createMockRequest({ resultId: "result123" });
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(200);
            const data = await response.json();
            // Check important fields
            expect(data.id).toBe("result123");
            expect(data.score).toBe(85);
            expect(data.quiz.title).toBe("Test Quiz");
            expect(data.responses.length).toBe(2);
            expect(data.responses[0].questionText).toBe("What is the capital of France?");
            // Verify result was fetched with correct parameters
            expect(prisma.quizResult.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "result123",
                },
                include: expect.objectContaining({
                    quiz: expect.any(Object),
                    responses: expect.any(Object),
                    user: expect.any(Object),
                }),
            });
        });
        it("should retrieve a shared quiz result with valid share code without authentication", async () => {
            // Set up unauthenticated session
            auth.getAuthSession.mockResolvedValue({
                user: null,
            });
            // Create mock request with resultId and shareCode parameters
            const request = createMockRequest({
                resultId: "result123",
                shareCode: "abcdef123456", // Matching the shareUrl from mockQuizResult
            });
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.id).toBe("result123");
        });
        it("should return 404 if result is not found", async () => {
            // Mock result not found
            prisma.quizResult.findUnique.mockResolvedValue(null);
            // Create mock request
            const request = createMockRequest({ resultId: "nonexistent" });
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toEqual({ error: "Result not found" });
        });
        it("should return 403 if user is not authorized to access the result", async () => {
            // Mock different user ID
            auth.getAuthSession.mockResolvedValue({
                user: { id: "different-user" },
            });
            // Modify mock result to be not shared
            const nonSharedResult = {
                ...mockQuizResult,
                isShared: false,
                userId: "owner-user", // Different from the authenticated user
            };
            prisma.quizResult.findUnique.mockResolvedValue(nonSharedResult);
            // Create mock request
            const request = createMockRequest({ resultId: "result123" });
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(403);
            const data = await response.json();
            expect(data).toEqual({ error: "Unauthorized to access this result" });
        });
    });
    describe("GET - Result Listing", () => {
        it("should list all results for a quiz when user is the quiz creator", async () => {
            // Create mock request with no resultId (to trigger listing)
            const request = createMockRequest();
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.results).toHaveLength(2);
            expect(data.results[0].id).toBe("result123");
            expect(data.results[1].id).toBe("result456");
            // Verify quiz was checked first
            expect(prisma.quiz.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "quiz123",
                },
                select: {
                    userId: true,
                },
            });
            // Verify results were fetched
            expect(prisma.quizResult.findMany).toHaveBeenCalledWith({
                where: {
                    quizId: "quiz123",
                },
                include: expect.objectContaining({
                    user: expect.any(Object),
                }),
                orderBy: {
                    completedAt: "desc",
                },
            });
        });
        it("should return 401 if user is not authenticated for result listing", async () => {
            // Mock unauthenticated session
            auth.getAuthSession.mockResolvedValue({
                user: null,
            });
            // Create mock request
            const request = createMockRequest();
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data).toEqual({ error: "Unauthorized" });
        });
        it("should return 404 if quiz is not found for result listing", async () => {
            // Mock quiz not found
            prisma.quiz.findUnique.mockResolvedValue(null);
            // Create mock request
            const request = createMockRequest();
            // Mock params object
            const params = { quizId: "nonexistent" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toEqual({ error: "Quiz not found" });
        });
        it("should return 403 if user is not the quiz creator for result listing", async () => {
            // Mock different user ID
            auth.getAuthSession.mockResolvedValue({
                user: { id: "different-user" },
            });
            // Create mock request
            const request = createMockRequest();
            // Mock params object
            const params = { quizId: "quiz123" };
            // Call the endpoint
            const response = await GET(request, { params });
            // Verify response
            expect(response.status).toBe(403);
            const data = await response.json();
            expect(data).toEqual({ error: "Unauthorized to access quiz results" });
        });
    });
    it("should handle database errors gracefully", async () => {
        // Mock database error
        prisma.quizResult.findUnique.mockRejectedValue(new Error("Database connection error"));
        // Create mock request
        const request = createMockRequest({ resultId: "result123" });
        // Mock params object
        const params = { quizId: "quiz123" };
        // Call the endpoint
        const response = await GET(request, { params });
        // Verify response
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("Failed to retrieve quiz results");
        expect(data.details).toBe("Database connection error");
    });
});
