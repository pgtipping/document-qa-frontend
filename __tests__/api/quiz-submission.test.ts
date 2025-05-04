import { NextResponse, NextRequest } from "next/server";
import * as auth from "@/lib/auth";
import * as llmService from "@/lib/llm-service";

// Mock prisma client
const prisma = {
  quiz: {
    findUnique: jest.fn(),
  },
  quizResult: {
    create: jest.fn(),
    update: jest.fn(),
  },
  quizResponse: {
    create: jest.fn(),
  },
};

// Mock quiz data
const mockQuiz = {
  id: "quiz123",
  title: "Test Quiz",
  description: "Test quiz description",
  difficulty: "medium",
  userId: "user123",
  questions: [
    {
      id: "q1",
      questionText: "What is the capital of France?",
      answerType: "multiple_choice",
      options: JSON.stringify(["London", "Berlin", "Paris", "Madrid"]),
      correctAnswer: "Paris",
      explanation: "Paris is the capital of France.",
      points: 10,
    },
    {
      id: "q2",
      questionText: "The earth is flat.",
      answerType: "true_false",
      options: JSON.stringify(["True", "False"]),
      correctAnswer: "False",
      explanation: "The earth is spherical.",
      points: 5,
    },
    {
      id: "q3",
      questionText: "Explain the water cycle.",
      answerType: "short_answer",
      options: null,
      correctAnswer:
        "The water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into rain or snow, and falls again to the surface.",
      explanation:
        "The water cycle is the continuous movement of water within the Earth and atmosphere.",
      points: 15,
    },
  ],
};

// Mock result after creation
const mockInitialQuizResult = {
  id: "result123",
  quizId: "quiz123",
  userId: "user123",
  score: 0,
  totalPoints: 0,
  earnedPoints: 0,
  timeTaken: 300,
};

// Mock responses after creation
const mockQuizResponses = [
  {
    id: "resp1",
    resultId: "result123",
    questionId: "q1",
    userAnswer: "Paris",
    isCorrect: true,
    question: mockQuiz.questions[0],
  },
  {
    id: "resp2",
    resultId: "result123",
    questionId: "q2",
    userAnswer: "False",
    isCorrect: true,
    question: mockQuiz.questions[1],
  },
  {
    id: "resp3",
    resultId: "result123",
    questionId: "q3",
    userAnswer: "Water evaporates, forms clouds, then falls as rain.",
    isCorrect: true,
    question: mockQuiz.questions[2],
  },
];

// Mock updated result after grading
const mockUpdatedQuizResult = {
  id: "result123",
  quizId: "quiz123",
  userId: "user123",
  score: 100,
  totalPoints: 30,
  earnedPoints: 30,
  timeTaken: 300,
  feedback: "Excellent! You have a strong understanding of the material.",
  responses: mockQuizResponses,
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

jest.mock("@/lib/llm-service", () => ({
  getCompletion: jest.fn(),
}));

// Import the route handlers
// Use dynamic import to ensure mocks are fully set up first
let POST: (
  request: NextRequest,
  context: { params: { quizId: string } }
) => Promise<NextResponse>;

beforeAll(async () => {
  const routeModule = await import("@/app/api/quiz/[quizId]/route");
  POST = routeModule.POST;
});

// Create mock request function
const createMockRequest = (body: Record<string, unknown>): NextRequest => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
};

// Response creation data interface
interface QuizResponseCreateData {
  data: {
    resultId: string;
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
  };
}

describe("Quiz Submission API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();

    // Setup mock authenticated user session
    (auth.getAuthSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });

    // Setup mock quiz
    (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);

    // Setup mock quiz result creation
    (prisma.quizResult.create as jest.Mock).mockResolvedValue(
      mockInitialQuizResult
    );

    // Setup mock quiz response creation
    (prisma.quizResponse.create as jest.Mock).mockImplementation(
      ({ data }: QuizResponseCreateData) => {
        // Find the matching mock response
        const mockResponse = mockQuizResponses.find(
          (resp) => resp.questionId === data.questionId
        );
        return Promise.resolve(mockResponse);
      }
    );

    // Setup mock quiz result update
    (prisma.quizResult.update as jest.Mock).mockResolvedValue(
      mockUpdatedQuizResult
    );

    // Setup mock LLM for short answer evaluation
    (llmService.getCompletion as jest.Mock).mockResolvedValue("CORRECT");
  });

  it("should successfully submit and grade quiz answers", async () => {
    // Create mock request
    const request = createMockRequest({
      answers: [
        { questionId: "q1", userAnswer: "Paris" },
        { questionId: "q2", userAnswer: "False" },
        {
          questionId: "q3",
          userAnswer: "Water evaporates, forms clouds, then falls as rain.",
        },
      ],
      timeTaken: 300,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      resultId: "result123",
      score: 100,
      earnedPoints: 30,
      totalPoints: 30,
      feedback: "Excellent! You have a strong understanding of the material.",
      timeTaken: 300,
    });

    // Verify authentication was checked
    expect(auth.getAuthSession).toHaveBeenCalled();

    // Verify quiz was fetched
    expect(prisma.quiz.findUnique).toHaveBeenCalledWith({
      where: {
        id: "quiz123",
      },
      include: {
        questions: true,
      },
    });

    // Verify quiz result was created
    expect(prisma.quizResult.create).toHaveBeenCalledWith({
      data: {
        quizId: "quiz123",
        userId: "user123",
        score: 0,
        totalPoints: 0,
        earnedPoints: 0,
        timeTaken: 300,
      },
    });

    // Verify responses were created
    expect(prisma.quizResponse.create).toHaveBeenCalledTimes(3);

    // Verify LLM was called for short answer evaluation
    expect(llmService.getCompletion).toHaveBeenCalledWith(
      expect.stringContaining("Evaluate if the user's answer is correct")
    );

    // Verify result was updated with final score
    expect(prisma.quizResult.update).toHaveBeenCalledWith({
      where: {
        id: "result123",
      },
      data: expect.objectContaining({
        score: expect.any(Number),
        totalPoints: expect.any(Number),
        earnedPoints: expect.any(Number),
        feedback: expect.any(String),
      }),
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
    });
  });

  it("should return 401 if user is not authenticated", async () => {
    // Mock unauthenticated session
    (auth.getAuthSession as jest.Mock).mockResolvedValue({
      user: null,
    });

    // Create mock request
    const request = createMockRequest({
      answers: [{ questionId: "q1", userAnswer: "Paris" }],
      timeTaken: 100,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if answers format is invalid", async () => {
    // Create mock request with invalid answers format
    const request = createMockRequest({
      answers: "not an array", // Invalid format
      timeTaken: 100,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({
      error: "Invalid answers format. Expected array of answers.",
    });
  });

  it("should return 404 if quiz is not found", async () => {
    // Mock quiz not found
    (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(null);

    // Create mock request
    const request = createMockRequest({
      answers: [{ questionId: "q1", userAnswer: "Paris" }],
      timeTaken: 100,
    });

    // Mock params object
    const params = { quizId: "nonexistent" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: "Quiz not found" });
  });

  it("should handle LLM evaluation for short answers", async () => {
    // Setup a specific LLM response for this test
    (llmService.getCompletion as jest.Mock).mockResolvedValue("INCORRECT");

    // Create mock request with a wrong short answer
    const request = createMockRequest({
      answers: [
        { questionId: "q3", userAnswer: "Water falls from the sky" }, // Incomplete answer
      ],
      timeTaken: 100,
    });

    // Customize the mock response for this specific answer
    (prisma.quizResponse.create as jest.Mock).mockResolvedValueOnce({
      id: "resp3",
      resultId: "result123",
      questionId: "q3",
      userAnswer: "Water falls from the sky",
      isCorrect: false, // Marked as incorrect
      question: mockQuiz.questions[2],
    });

    // Customize the updated result for this specific test
    (prisma.quizResult.update as jest.Mock).mockResolvedValueOnce({
      ...mockUpdatedQuizResult,
      score: 0,
      earnedPoints: 0,
      totalPoints: 15,
      feedback:
        "You might want to review the material again to strengthen your understanding.",
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify LLM was called for evaluation
    expect(llmService.getCompletion).toHaveBeenCalledWith(
      expect.stringContaining("Evaluate if the user's answer is correct")
    );

    // Verify response shows lower score
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.score).toBe(0);
    expect(data.earnedPoints).toBe(0);
    expect(data.totalPoints).toBe(15);
  });

  it("should handle database errors during submission", async () => {
    // Mock database error during quiz result creation
    (prisma.quizResult.create as jest.Mock).mockRejectedValue(
      new Error("Database connection error")
    );

    // Create mock request
    const request = createMockRequest({
      answers: [{ questionId: "q1", userAnswer: "Paris" }],
      timeTaken: 100,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Failed to submit quiz answers",
      details: "Database connection error",
    });
  });
});
