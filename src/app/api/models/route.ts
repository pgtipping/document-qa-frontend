import { NextRequest, NextResponse } from "next/server";
import getConfig from "next/config";

export async function GET(_req: NextRequest) {
  // Prefix unused parameter with _
  try {
    // Get server runtime config to access environment variables
    const { serverRuntimeConfig } = getConfig();
    const apiUrl = serverRuntimeConfig.API_URL;

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
