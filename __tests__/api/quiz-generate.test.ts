import { NextResponse } from "next/server";
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

// Import the actual module (which will use our mocks)
const { POST } = jest.requireActual("@/app/api/quiz/generate/route");

// Create mock request function
const createMockRequest = (body: Record<string, unknown>): Request => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request;
};

describe("Quiz Generation API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();

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

    // Setup mock document content
    (documentProcessing.getDocumentTextContent as jest.Mock).mockResolvedValue(
      "This is the document content for testing."
    );

    // Setup mock LLM responses
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

    // Mock performance API
    global.performance = {
      now: jest
        .fn()
        .mockReturnValueOnce(0) // Start time
        .mockReturnValueOnce(5000), // End time (5 seconds later)
    } as unknown as Performance;
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
      processingTime: 5, // 5 seconds
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
    expect(llmService.getCompletion).toHaveBeenCalledWith(
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
    // Mock invalid JSON response from LLM
    (llmService.getCompletion as jest.Mock)
      .mockResolvedValueOnce("Test Quiz Title")
      .mockResolvedValueOnce("Not a valid JSON"); // Invalid JSON for questions

    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Failed to generate valid quiz questions",
    });
  });

  it("should handle database errors when creating quiz", async () => {
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

    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Failed to generate quiz",
      details: "Database connection error",
    });
  });

  it("should handle null response from LLM service", async () => {
    // Mock null response from LLM
    (llmService.getCompletion as jest.Mock)
      .mockResolvedValueOnce("Test Quiz Title")
      .mockResolvedValueOnce(null); // Null for questions

    // Create mock request
    const request = createMockRequest({
      documentId: "doc123",
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Failed to generate valid quiz questions",
    });
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
    expect(llmService.getCompletion).toHaveBeenCalledWith(
      expect.stringContaining("generate 5 quiz questions") // Default quiz size
    );
  });
});
