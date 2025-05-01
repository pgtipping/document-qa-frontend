import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Clone the response
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "X-XSS-Protection": "1; mode=block",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-analytics.com https://*.sentry.io; connect-src 'self' https://*.vercel-analytics.com https://*.sentry.io; img-src 'self' data: blob: https://*.vercel-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self'; object-src 'none';",
  };

  // Set headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Only run middleware on the frontend routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (/api/*)
     * - Static files (/_next/*)
     * - Internal Next.js files (/favicon.ico, /robots.txt, etc.)
     */
    "/((?!api|_next|.*\\..*|sentry-example-page|test-email).*)",
  ],
};
