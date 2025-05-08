import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  // Prefix unused parameter with _
  try {
    // Use direct fallback, not relying on getConfig() which can fail during static export
    // Use a fallback for API_URL or NEXT_PUBLIC_API_URL
    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://inqdoc.synthalyst.com";

    // Forward the request to our backend
    const response = await fetch(`${apiUrl}/api/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Models error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
