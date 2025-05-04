import { NextResponse, NextRequest } from "next/server";
import * as auth from "@/lib/auth";
import * as documentProcessing from "@/lib/document-processing";
import * as llmService from "@/lib/llm-service";

// Mock prisma client
const prisma = {
  document: {
    findFirst: jest.fn(),
  },
  quiz: {
    create: jest.fn(),
  },
};

// Sample quiz question data
const mockQuizQuestions = [
  {
    questionText: "What is the capital of France?",
    answerType: "multiple_choice",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital of France.",
  },
  {
    questionText: "The earth is flat.",
    answerType: "true_false",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "The earth is spherical.",
  },
];

// Mock modules before import
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

jest.mock("@/lib/document-processing", () => ({
  getDocumentTextContent: jest.fn(),
}));

jest.mock("@/lib/llm-service", () => ({
  getCompletion: jest.fn(),
}));

// Bypass dynamic import to avoid test issues with module initialization
jest.mock("@/app/api/quiz/generate/route", () => {
  // Capture function dependencies for testing
  const actualRoute = jest.requireActual("@/app/api/quiz/generate/route");
  return {
    ...actualRoute,
  };
});

// Mock the performance API
const mockPerformanceNow = jest.fn();
global.performance = {
  now: mockPerformanceNow,
} as unknown as Performance;

// Import the POST function using dynamic imports and type assertions
// This avoids the linter error while still maintaining the same functionality
type RouteHandler = (request: NextRequest) => Promise<NextResponse>;
const apiModule = jest.requireActual("@/app/api/quiz/generate/route") as {
  POST: RouteHandler;
};
const { POST } = apiModule;

// Create mock request function
const createMockRequest = (body: Record<string, unknown>): NextRequest => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
};

describe("Quiz Generation API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();

    // Reset performance.now mock for each test
    mockPerformanceNow.mockReset();
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(5000);

    // Setup mock authenticated user session
    (auth.getAuthSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });

    // Setup mock document
    (prisma.document.findFirst as jest.Mock).mockResolvedValue({
      id: "doc123",
      s3Key: "document.pdf",
      userId: "user123",
      filename: "test-document.pdf",
      status: "active",
    });

    // Setup mock document content - make sure it's long enough to pass validation
    (documentProcessing.getDocumentTextContent as jest.Mock).mockResolvedValue(
      "This is the document content for testing with sufficient length to pass validation. This is a longer text that should be more than 100 characters to pass the validation in the quiz generation API. This text should be sufficient."
    );

    // Setup mock LLM responses - clear previous mock implementation first
    (llmService.getCompletion as jest.Mock).mockReset();
    // Default happy path implementation
    (llmService.getCompletion as jest.Mock)
      .mockResolvedValueOnce("Test Quiz Title") // For title generation
      .mockResolvedValueOnce(JSON.stringify(mockQuizQuestions)); // For question generation

    // Setup mock quiz creation
    (prisma.quiz.create as jest.Mock).mockResolvedValue({
      id: "quiz123",
      title: "Test Quiz Title",
      description: "Quiz generated from test-document.pdf",
      difficulty: "medium",
      userId: "user123",
      documentId: "doc123",
      questions: mockQuizQuestions.map((q, i) => ({
        id: `question${i}`,
        ...q,
      })),
    });
  });

  it("should generate a quiz successfully", async () => {
    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
      quizSize: 5,
      difficulty: "medium",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      id: "quiz123",
      title: "Test Quiz Title",
      questionCount: 2,
      difficulty: "medium",
      processingTime: expect.any(Number), // Accept any number for processing time
    });

    // Verify getAuthSession was called
    expect(auth.getAuthSession).toHaveBeenCalled();

    // Verify document ownership check
    expect(prisma.document.findFirst).toHaveBeenCalledWith({
      where: {
        id: "doc123",
        userId: "user123",
        status: "active",
      },
    });

    // Verify document content extraction
    expect(documentProcessing.getDocumentTextContent).toHaveBeenCalledWith(
      "document.pdf"
    );

    // Verify title generation
    expect(llmService.getCompletion).toHaveBeenCalledWith(
      expect.stringContaining("Create a short but descriptive title")
    );

    // Verify question generation
    expect(llmService.getCompletion).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("generate 5 quiz questions")
    );

    // Verify quiz creation
    expect(prisma.quiz.create).toHaveBeenCalledWith({
      data: {
        title: "Test Quiz Title",
        description: expect.stringContaining("Quiz generated from"),
        difficulty: "medium",
        userId: "user123",
        documentId: "doc123",
        questions: {
          create: expect.arrayContaining([
            expect.objectContaining({
              questionText: "What is the capital of France?",
              answerType: "multiple_choice",
            }),
            expect.objectContaining({
              questionText: "The earth is flat.",
              answerType: "true_false",
            }),
          ]),
        },
      },
      include: {
        questions: true,
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
      documentId: "doc123",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if documentId is missing", async () => {
    // Create mock request with missing documentId
    const request = createMockRequest({
      quizSize: 5,
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Missing documentId in request body" });
  });

  it("should return 404 if document is not found", async () => {
    // Mock document not found
    (prisma.document.findFirst as jest.Mock).mockResolvedValue(null);

    // Create mock request
    const request = createMockRequest({
      documentId: "nonexistent",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: "Document not found or not authorized" });
  });

  it("should return 400 if document content is too short", async () => {
    // Mock short document content
    (documentProcessing.getDocumentTextContent as jest.Mock).mockResolvedValue(
      "Too short"
    );

    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({
      error: "Document content is too short or could not be extracted",
    });
  });

  it("should handle LLM response parsing errors", async () => {
    // Mock the JSON.parse to throw an error when called
    const originalJSONParse = JSON.parse;
    JSON.parse = jest.fn().mockImplementation(() => {
      throw new Error("Invalid JSON");
    });

    // Make sure title generation succeeds but question generation returns invalid JSON
    (llmService.getCompletion as jest.Mock)
      .mockClear()
      .mockResolvedValueOnce("Test Quiz Title")
      .mockResolvedValueOnce("Not a valid JSON");

    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
    });

    try {
      // Call the endpoint
      const response = await POST(request);

      // Get the response data
      const data = await response.json();

      // Check that the response contains the expected error message
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Failed to generate valid quiz questions");
    } finally {
      // Restore the original JSON.parse implementation
      JSON.parse = originalJSONParse;
    }
  });

  it("should handle database errors when creating quiz", async () => {
    // Ensure LLM responses succeed
    (llmService.getCompletion as jest.Mock)
      .mockClear()
      .mockResolvedValueOnce("Test Quiz Title")
      .mockResolvedValueOnce(JSON.stringify(mockQuizQuestions));

    // Mock database error
    (prisma.quiz.create as jest.Mock).mockRejectedValue(
      new Error("Database connection error")
    );

    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
    });

    // Call the endpoint
    const response = await POST(request);

    // Get the response data
    const data = await response.json();

    // Check that the response contains the expected error properties
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to generate quiz");
    expect(data).toHaveProperty("details");
    expect(data.details).toBe("Database connection error");
  });

  it("should handle null response from LLM service", async () => {
    // Reset mock and ensure title generation succeeds but question generation returns null
    (llmService.getCompletion as jest.Mock)
      .mockClear()
      .mockResolvedValueOnce("Test Quiz Title")
      .mockResolvedValueOnce(null);

    // Mock JSON.parse to simulate an error due to null input
    const originalJSONParse = JSON.parse;
    JSON.parse = jest.fn().mockImplementation(() => {
      throw new Error("Cannot parse null");
    });

    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
    });

    try {
      // Call the endpoint
      const response = await POST(request);

      // Get the response data
      const data = await response.json();

      // Check that the response contains the expected error message
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Failed to generate valid quiz questions");
    } finally {
      // Restore the original JSON.parse implementation
      JSON.parse = originalJSONParse;
    }
  });

  it("should use default values for missing optional parameters", async () => {
    // Create mock request with only required parameters
    const request = createMockRequest({
      documentId: "doc123",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(200);

    // Verify quiz creation with default values
    expect(prisma.quiz.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          difficulty: "medium", // Default difficulty
        }),
      })
    );

    // Verify question generation with default size
    expect(llmService.getCompletion).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("generate 5 quiz questions") // Default quiz size
    );
  });
});
