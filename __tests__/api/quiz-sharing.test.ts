import { NextResponse, NextRequest } from "next/server";
import * as auth from "@/lib/auth";
import crypto from "crypto";

// Mock the crypto module
jest.mock("crypto", () => ({
  randomBytes: jest.fn(),
}));

// Mock prisma client
const prisma = {
  quizResult: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

// Mock quiz result data
const mockQuizResult = {
  id: "result123",
  quizId: "quiz123",
  userId: "user123",
  score: 85,
  isShared: false,
  shareUrl: null,
};

// Mock the updated result after sharing is enabled
const mockSharedResult = {
  id: "result123",
  quizId: "quiz123",
  userId: "user123",
  score: 85,
  isShared: true,
  shareUrl: "mock-share-code",
};

// Mock the updated result after sharing is disabled
const mockPrivateResult = {
  id: "result123",
  quizId: "quiz123",
  userId: "user123",
  score: 85,
  isShared: false,
  shareUrl: null,
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
let POST: (
  request: NextRequest,
  context: { params: { quizId: string } }
) => Promise<NextResponse>;

beforeAll(async () => {
  const routeModule = await import("@/app/api/quiz/[quizId]/results/route");
  POST = routeModule.POST;
});

// Create mock request function
const createMockRequest = (body: Record<string, unknown>): NextRequest => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
};

describe("Quiz Sharing API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();

    // Setup mock authenticated user session
    (auth.getAuthSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });

    // Setup mock quiz result
    (prisma.quizResult.findUnique as jest.Mock).mockResolvedValue(
      mockQuizResult
    );

    // Setup mock share code generation
    (crypto.randomBytes as jest.Mock).mockReturnValue({
      toString: jest.fn().mockReturnValue("mock-share-code"),
    });
  });

  it("should enable sharing for a quiz result", async () => {
    // Setup update to return shared result
    (prisma.quizResult.update as jest.Mock).mockResolvedValue(mockSharedResult);

    // Create mock request
    const request = createMockRequest({
      resultId: "result123",
      isShared: true,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      id: "result123",
      isShared: true,
      shareUrl: "mock-share-code",
    });

    // Verify quiz result was checked
    expect(prisma.quizResult.findUnique).toHaveBeenCalledWith({
      where: {
        id: "result123",
      },
    });

    // Verify crypto was called to generate share URL
    expect(crypto.randomBytes).toHaveBeenCalledWith(16);

    // Verify quiz result was updated
    expect(prisma.quizResult.update).toHaveBeenCalledWith({
      where: {
        id: "result123",
      },
      data: {
        isShared: true,
        shareUrl: "mock-share-code",
      },
    });
  });

  it("should disable sharing for a quiz result", async () => {
    // Setup update to return private result
    (prisma.quizResult.update as jest.Mock).mockResolvedValue(
      mockPrivateResult
    );

    // Create mock request
    const request = createMockRequest({
      resultId: "result123",
      isShared: false,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      id: "result123",
      isShared: false,
      shareUrl: null,
    });

    // Verify quiz result was updated
    expect(prisma.quizResult.update).toHaveBeenCalledWith({
      where: {
        id: "result123",
      },
      data: {
        isShared: false,
        shareUrl: null,
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
      resultId: "result123",
      isShared: true,
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

  it("should return 400 if resultId is missing", async () => {
    // Create mock request with missing resultId
    const request = createMockRequest({
      isShared: true,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "Result ID is required" });
  });

  it("should return 404 if result is not found", async () => {
    // Mock result not found
    (prisma.quizResult.findUnique as jest.Mock).mockResolvedValue(null);

    // Create mock request
    const request = createMockRequest({
      resultId: "nonexistent",
      isShared: true,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: "Result not found" });
  });

  it("should return 403 if user doesn't own the result", async () => {
    // Create a result owned by a different user
    const otherUserResult = {
      ...mockQuizResult,
      userId: "other-user",
    };
    (prisma.quizResult.findUnique as jest.Mock).mockResolvedValue(
      otherUserResult
    );

    // Create mock request
    const request = createMockRequest({
      resultId: "result123",
      isShared: true,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toEqual({ error: "Unauthorized to modify this result" });
  });

  it("should handle database errors gracefully", async () => {
    // Mock database error
    (prisma.quizResult.update as jest.Mock).mockRejectedValue(
      new Error("Database connection error")
    );

    // Create mock request
    const request = createMockRequest({
      resultId: "result123",
      isShared: true,
    });

    // Mock params object
    const params = { quizId: "quiz123" };

    // Call the endpoint
    const response = await POST(request, { params });

    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to update sharing settings");
    expect(data.details).toBe("Database connection error");
  });
});
