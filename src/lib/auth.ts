import { NextRequest } from "next/server";

// Simple admin authentication check
export function isAdmin(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    console.warn("ADMIN_KEY not set in environment variables");
    return false;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];
  return token === adminKey;
}

// Admin authentication middleware
export async function withAdminAuth(
  req: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  if (!isAdmin(req)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Admin access required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return handler();
}
