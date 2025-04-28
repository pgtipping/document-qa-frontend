import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        message: "GROQ_API_KEY not found in environment variables.",
      },
      { status: 500 }
    );
  }

  // Log the key value the server sees (mask parts of it for security in logs)
  const keyForLogging =
    apiKey.length > 8
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : apiKey;
  console.log(
    `[test-groq] Attempting to test Groq API key found in env: ${keyForLogging}`
  );

  try {
    const groq = new Groq({ apiKey: apiKey });
    // Attempt a simple, low-cost API call, like listing models
    // Note: As of some SDK versions, listing models might not require auth,
    // but attempting a chat completion is a more reliable auth check.
    // We'll try a minimal chat completion.
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "Test prompt" }],
      model: "llama-3.1-8b-instant", // Use a known model
      max_tokens: 20, // Keep it minimal
    });

    console.log("Groq API key test successful.");
    // If successful, return a simple confirmation
    return NextResponse.json({
      status: "success",
      message: "Groq API call succeeded.",
    });
  } catch (error: unknown) {
    console.error("Groq API key test failed:", error);
    // Attempt to extract status code, default to 500
    let errorStatus = 500;
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      errorStatus = error.status;
    }

    // Return the actual error object (or a structured representation)
    // Note: Directly returning the error might expose too much detail in some cases,
    // but for this direct test, it's what the user requested.
    // We'll wrap it slightly for clarity.
    return NextResponse.json(
      { status: "error", errorDetails: error },
      { status: errorStatus }
    );
  }
}
