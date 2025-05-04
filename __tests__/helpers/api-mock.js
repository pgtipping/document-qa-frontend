/**
 * API mocking helpers for testing
 */
import { NextRequest, NextResponse } from "next/server";
/**
 * Create a mock NextRequest object for testing API routes
 */
export const createMockNextRequest = (options = {}) => {
    const { method = "GET", url = "https://example.com/api/test", headers = {}, cookies = {}, body = null, searchParams = {}, } = options;
    // Create URL with search params
    const urlWithParams = new URL(url);
    Object.entries(searchParams).forEach(([key, value]) => {
        urlWithParams.searchParams.append(key, value);
    });
    // Convert body to proper format
    let bodyInit = null;
    if (body !== null) {
        bodyInit = JSON.stringify(body);
    }
    // Create request init with method and headers
    const requestOptions = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: bodyInit,
    };
    // Create the NextRequest instance
    const request = new NextRequest(urlWithParams.toString(), requestOptions);
    // Add cookies (hacky because NextRequest doesn't expose a way to set cookies directly)
    Object.defineProperty(request, "cookies", {
        get: () => ({
            getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
            get: (name) => cookies[name] || null,
            has: (name) => name in cookies,
        }),
    });
    return request;
};
/**
 * Create a mock NextResponse object for testing API routes
 */
export const createMockNextResponse = (options = {}) => {
    const { status = 200, statusText = "OK", headers = {}, body = null, } = options;
    // Convert body to proper format
    const bodyText = body !== null ? JSON.stringify(body) : "";
    // Create response init with status and headers
    const init = {
        status,
        statusText,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    };
    // Create the NextResponse instance
    return new NextResponse(bodyText, init);
};
/**
 * Helper to mock Prisma client for API tests
 */
export const createMockPrismaClient = () => {
    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
        document: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
        quiz: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
        quizQuestion: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            createMany: jest.fn(),
        },
        quizResult: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
        quizResponse: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            createMany: jest.fn(),
        },
        // Add a transaction method
        $transaction: jest.fn().mockImplementation((callback) => {
            if (typeof callback === "function") {
                return callback(mockPrisma);
            }
            return Promise.all(callback);
        }),
    };
    return mockPrisma;
};
/**
 * Helper to mock LLM service for API tests
 */
export const createMockLLMService = () => {
    return {
        generateQuiz: jest.fn(),
        evaluateAnswer: jest.fn(),
        summarizeDocument: jest.fn(),
        extractKeyPoints: jest.fn(),
        generateFeedback: jest.fn(),
    };
};
/**
 * Helper to mock document processing service for API tests
 */
export const createMockDocumentService = () => {
    return {
        getDocumentContent: jest.fn(),
        extractText: jest.fn(),
        validateDocument: jest.fn(),
        getDocumentMetadata: jest.fn(),
    };
};
