import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Request body:", body); // Log the request body for debugging

    // Forward the request to our backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Backend error response:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });

      if (errorData) {
        return NextResponse.json(
          {
            error:
              errorData.detail || errorData.message || "Failed to get answer",
          },
          { status: response.status }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Ask error:", error);
    return NextResponse.json(
      { error: "Failed to get answer" },
      { status: 500 }
    );
  }
}
