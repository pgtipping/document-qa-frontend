import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    return NextResponse.json({ authenticated: true });
  });
}
