import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// Helper function to extract request details
function getRequestDetails(request: Request) {
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers.entries());
  const query = Object.fromEntries(url.searchParams.entries());

  return {
    url: request.url,
    method: request.method,
    headers,
    query,
  };
}

// A faulty API route to test Sentry's error monitoring
export async function GET(request: Request) {
  return Sentry.startSpan(
    {
      name: "Test API Error",
      op: "http.server",
    },
    async () => {
      try {
        const requestDetails = request ? getRequestDetails(request) : null;
        // Removed unused requestId declaration here; it's declared and used in the catch block

        // Set detailed context
        Sentry.setContext("test", {
          endpoint: "/api/sentry-example-api",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          request: requestDetails,
        });

        // Add request breadcrumb
        Sentry.addBreadcrumb({
          category: "request",
          message: "API request received",
          level: "info",
          data: {
            url: requestDetails?.url,
            method: requestDetails?.method,
            headers: requestDetails?.headers,
          },
        });

        // Add test breadcrumb
        Sentry.addBreadcrumb({
          category: "test",
          message: "About to throw test error",
          level: "info",
        });

        // Throw the test error
        throw new Error("Sentry Example API Route Error");
      } catch (error) {
        // Get request ID if available
        const requestId = request?.headers.get("x-request-id") || "unknown";

        // Capture the error with additional context
        Sentry.captureException(error, {
          tags: {
            errorType: "API_TEST_ERROR",
            endpoint: "/api/sentry-example-api",
            requestId,
          },
          extra: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            request: request ? getRequestDetails(request) : null,
          },
        });

        // Return a proper error response
        return NextResponse.json(
          {
            error: "Test Error",
            message: "This is an example error for Sentry testing",
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }
  );
}
