import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Mock Next.js Response and Request
const mockResponse = {
  json: jest.fn().mockImplementation((data) => ({ ...data })),
  status: 200,
  headers: new Map(),
};

// Store original env
const originalEnv = process.env;

// Mock Next.js NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...mockResponse,
      ...init,
      json: async () => data,
    })),
  },
}));

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  startSpan: jest.fn(),
}));

// Create mock request
const createMockRequest = (headers = {}) => {
  return new Request("https://example.com/api/sentry-example-api", {
    headers: new Headers(headers),
  });
};

describe("Sentry Example API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore env after all tests
    process.env = originalEnv;
  });

  it("should handle errors and capture them in Sentry", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Execute the API route
    const response = await GET();

    // Verify response status and data
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Test Error",
      message: "This is an example error for Sentry testing",
      timestamp: expect.any(String),
    });

    // Verify Sentry context was set correctly
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        endpoint: "/api/sentry-example-api",
        timestamp: expect.any(String),
        environment: expect.any(String),
      })
    );

    // Verify breadcrumb was added
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "test",
      message: "About to throw test error",
      level: "info",
    });

    // Verify error was captured with correct context
    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error("Sentry Example API Route Error"),
      {
        tags: {
          errorType: "API_TEST_ERROR",
          endpoint: "/api/sentry-example-api",
        },
        extra: expect.objectContaining({
          timestamp: expect.any(String),
          environment: expect.any(String),
        }),
      }
    );
  });

  it("should handle missing environment variables", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Clear environment variables
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.SENTRY_DSN;

    // Execute the API route
    const response = await GET();

    // Verify response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({
      error: "Test Error",
      message: "This is an example error for Sentry testing",
      timestamp: expect.any(String),
    });

    // Verify Sentry captured the error with environment info
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({
          environment: "test",
        }),
      })
    );
  });

  it("should include request data in error context", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Create mock request with custom headers
    const mockRequest = createMockRequest({
      "user-agent": "test-agent",
      "x-test-header": "test-value",
    });

    // Execute the API route with the mock request
    const response = await GET(mockRequest);

    // Verify response
    expect(response.status).toBe(500);

    // Verify Sentry context includes request data
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        endpoint: "/api/sentry-example-api",
        request: expect.objectContaining({
          url: "https://example.com/api/sentry-example-api",
          headers: expect.objectContaining({
            "user-agent": "test-agent",
            "x-test-header": "test-value",
          }),
        }),
      })
    );
  });

  it("should handle rate limiting", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Set rate limit env var
    process.env.MAX_REQUESTS_PER_MINUTE = "2";

    // Make multiple requests
    const responses = await Promise.all([
      GET(),
      GET(),
      GET(), // This should be rate limited
    ]);

    // Verify the third request was rate limited
    const lastResponse = responses[2];
    expect(lastResponse.status).toBe(429);
    const data = await lastResponse.json();
    expect(data).toEqual({
      error: "Rate Limit Exceeded",
      message: "Too many requests, please try again later",
    });

    // Verify rate limit error was captured in Sentry
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          errorType: "RATE_LIMIT_EXCEEDED",
          endpoint: "/api/sentry-example-api",
        },
      })
    );
  });

  it("should handle different environment configurations", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Test production environment
    Object.defineProperty(process, "env", {
      value: {
        ...process.env,
        NODE_ENV: "production",
        NEXT_PUBLIC_SENTRY_DSN: "test-dsn",
      },
    });
    let response = await GET();
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        environment: "production",
      })
    );

    // Test development environment
    Object.defineProperty(process, "env", {
      value: { ...process.env, NODE_ENV: "development" },
    });
    response = await GET();
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        environment: "development",
      })
    );

    // Test staging environment
    Object.defineProperty(process, "env", {
      value: { ...process.env, NODE_ENV: "staging" },
    });
    response = await GET();
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        environment: "staging",
      })
    );
  });

  it("should handle performance monitoring configuration", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Configure performance monitoring
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "0.5";

    const response = await GET();

    // Verify span was created with correct sampling rate
    expect(Sentry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test API Error",
      }),
      expect.any(Function)
    );
  });

  it("should capture detailed request data in error context", async () => {
    // Import the mocked route
    const { GET } = require("@/app/api/sentry-example-api/route");

    // Create mock request with detailed information
    const mockRequest = createMockRequest({
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "x-forwarded-for": "192.168.1.1",
      "x-real-ip": "192.168.1.1",
      "x-request-id": "test-request-id",
      referer: "https://example.com/test-page",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      cookie: "session=test-session",
    });

    // Add query parameters
    const url = new URL(mockRequest.url);
    url.searchParams.set("test", "value");
    url.searchParams.set("debug", "true");
    Object.defineProperty(mockRequest, "url", { value: url.toString() });

    // Execute the API route with the mock request
    const response = await GET(mockRequest);

    // Verify response
    expect(response.status).toBe(500);

    // Verify Sentry context includes detailed request data
    expect(Sentry.setContext).toHaveBeenCalledWith(
      "test",
      expect.objectContaining({
        endpoint: "/api/sentry-example-api",
        request: expect.objectContaining({
          url: expect.stringContaining("test=value"),
          headers: expect.objectContaining({
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "x-forwarded-for": "192.168.1.1",
            "x-real-ip": "192.168.1.1",
            "x-request-id": "test-request-id",
            referer: "https://example.com/test-page",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
          }),
          query: {
            test: "value",
            debug: "true",
          },
          method: "GET",
        }),
        timestamp: expect.any(String),
      })
    );

    // Verify error was captured with request context
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          errorType: "API_TEST_ERROR",
          endpoint: "/api/sentry-example-api",
          requestId: "test-request-id",
        },
        extra: expect.objectContaining({
          request: expect.objectContaining({
            headers: expect.any(Object),
            query: expect.any(Object),
          }),
        }),
      })
    );
  });
});
