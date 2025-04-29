import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import Prisma client instance
import { Prisma } from "@prisma/client"; // Import Prisma types directly
import { getDocumentTextContent } from "@/lib/document-processing";
import {
  getCompletion,
  splitIntoChunks,
  getRelevantChunks,
  buildPromptWithContextLimit,
  // MAX_CONTEXT_TOKENS is defined in llm-service
} from "@/lib/llm-service";
import { getAuthSession } from "@/lib/auth"; // Import session helper

// --- Configuration ---
// Base template can still be defined here or imported if shared
const PROMPT_TEMPLATE_BASE = `Based on the following context, please answer the question. If the answer is not present in the context, say "I cannot find the answer in the provided documents."\n\nContext:\n{CONTEXT}\n\nQuestion: {QUESTION}\n\nAnswer:`;
const PROMPT_TEMPLATE_GENERATE_QUESTION = `Based on the following context, generate one insightful question that can be answered using the provided text. Focus on key information or concepts presented.\n\nContext:\n{CONTEXT}\n\nGenerated Question:`;

// --- API Route Handler ---
export async function POST(request: NextRequest) {
  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log("Ask API: Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    // --- End Authentication Check ---

    const body = await request.json();
    // Expect question, optional mode, optional documentIds. userId comes from session
    const {
      question: userQuestion,
      mode = "user",
      documentIds, // Array of specific document IDs to use
    } = body; // Default mode to 'user'

    if (
      mode === "user" &&
      (!userQuestion || typeof userQuestion !== "string")
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid 'question' in request body for 'user' mode",
        },
        { status: 400 }
      );
    }

    console.log(`Received request for user ID: ${userId} in mode: ${mode}`);
    if (mode === "user") {
      console.log(`User question: "${userQuestion}"`);
    }

    // --- Prisma Integration: Fetch documents based on selection or all active ---
    let documentsToProcess;
    try {
      // Define the base where clause with proper typing
      const whereClause: Prisma.DocumentWhereInput = {
        userId: userId, // Always filter by user
        status: "active", // Always fetch active documents
      };

      // If specific document IDs are provided, add them to the clause
      if (Array.isArray(documentIds) && documentIds.length > 0) {
        console.log(
          `Fetching specific documents for user ${userId}:`,
          documentIds
        );
        whereClause.id = {
          in: documentIds,
        };
      } else {
        console.log(
          `No specific documents selected, fetching all active for user ${userId}.`
        );
        // No additional ID filter needed, will fetch all active for the user
      }

      documentsToProcess = await prisma.document.findMany({
        where: whereClause,
        select: {
          id: true, // Select ID for potential logging/debugging
          s3Key: true, // Only select the s3Key
          filename: true, // Keep filename for logging/context
        },
      });
    } catch (dbError) {
      console.error(
        `Database error fetching documents for user ${userId}:`,
        dbError
      );
      return NextResponse.json(
        {
          error: "Failed to retrieve document context",
          details: (dbError as Error).message,
        },
        { status: 500 }
      );
    }

    if (!documentsToProcess || documentsToProcess.length === 0) {
      const message =
        Array.isArray(documentIds) && documentIds.length > 0
          ? "None of the selected documents were found or are active."
          : "No active documents found for this user to provide context.";
      return NextResponse.json(
        { answer: message },
        { status: 200 } // Not an error, just no context available
      );
    }

    const s3KeysToProcess = documentsToProcess.map((doc) => doc.s3Key);
    console.log(
      `Processing ${s3KeysToProcess.length} documents for user ${userId}:`,
      documentsToProcess.map((d) => d.filename)
    );
    // --- End Prisma Integration ---

    // 1. Fetch and extract content for the selected/active documents concurrently
    const contentPromises = s3KeysToProcess.map(
      (
        key: string // Add type for key
      ) =>
        getDocumentTextContent(key).catch((err) => {
          console.error(`Failed to get content for key ${key}:`, err);
          return null; // Return null on error for individual file
        })
    );
    const allContents = (await Promise.all(contentPromises)) as (
      | string
      | null
    )[]; // Type assertion
    const validContents = allContents.filter(
      (content: string | null): content is string => content !== null // Type guard for filter
    );

    if (validContents.length === 0) {
      return NextResponse.json(
        { error: "Failed to process any of the provided documents." },
        { status: 500 }
      );
    }

    // 2. Chunk all valid contents
    let allChunks: string[] = [];
    validContents.forEach((content, index) => {
      console.log(`Chunking document ${index + 1}/${validContents.length}...`);
      const chunks = splitIntoChunks(content); // Use default chunk size/overlap from llm-service
      allChunks = allChunks.concat(chunks);
    });
    console.log(
      `Total chunks generated from ${validContents.length} documents: ${allChunks.length}`
    );

    // 3. Select relevant chunks (using placeholder logic for now)
    // For model-generated questions, we might want a different relevance strategy,
    // but for now, we'll use the same context chunks for both modes.
    // If mode is 'model', we don't have a user question yet for relevance,
    // so we might just take the first few chunks or implement a different strategy.
    // For simplicity here, we'll select chunks based on the *entire* content if mode is 'model'.
    const relevanceQuery =
      mode === "user" ? userQuestion : validContents.join("\n");
    const relevantChunks = getRelevantChunks(allChunks, relevanceQuery); // Use default maxChunks from llm-service
    console.log(
      `Selected ${relevantChunks.length} relevant chunks (using ${
        mode === "user" ? "user question" : "full content"
      } for relevance).`
    );

    let finalQuestion = userQuestion;

    // --- Q&A Mode Logic ---
    if (mode === "model") {
      console.log("Mode is 'model', generating question...");
      // Build prompt to generate a question based on context
      const generateQuestionPrompt = buildPromptWithContextLimit(
        relevantChunks, // Use the same relevant chunks for question generation context
        "", // No user question needed here
        PROMPT_TEMPLATE_GENERATE_QUESTION
      );

      const generatedQuestion = await getCompletion(generateQuestionPrompt);

      if (!generatedQuestion) {
        console.error("Failed to generate question from LLM.");
        return NextResponse.json(
          { error: "Failed to generate a question for Q&A mode." },
          { status: 503 }
        );
      }
      finalQuestion = generatedQuestion.trim();
      console.log(`Generated question: "${finalQuestion}"`);
    }
    // --- End Q&A Mode Logic ---

    if (!finalQuestion) {
      // Should not happen if mode is 'user' due to earlier check, but safety first
      console.error("No final question available to proceed.");
      return NextResponse.json(
        { error: "Internal error: Question not available." },
        { status: 500 }
      );
    }

    // 4. Build the final *answer* prompt, respecting token limits
    const finalAnswerPrompt = buildPromptWithContextLimit(
      relevantChunks,
      finalQuestion, // Use the final question (either user's or generated)
      PROMPT_TEMPLATE_BASE // Pass the answer template
      // MAX_CONTEXT_TOKENS is implicitly used from llm-service defaults
    );

    // Log prompt details (optional, be careful with sensitive data)
    // Token count is logged within buildPromptWithContextLimit now
    console.log("Sending final answer prompt to LLM service...");

    // 5. Get completion (the answer) using the LLM service with fallback
    const answer = await getCompletion(finalAnswerPrompt);

    if (answer === null) {
      return NextResponse.json(
        { error: "Failed to get answer from LLM providers after retries." },
        { status: 503 }
      ); // Service Unavailable
    }

    // 6. Return the answer
    console.log("Received answer from LLM service.");
    // 6. Return the answer (and the generated question if applicable)
    console.log("Received answer from LLM service.");
    const responsePayload: { answer: string; generatedQuestion?: string } = {
      answer,
    };
    if (mode === "model") {
      responsePayload.generatedQuestion = finalQuestion; // Include the generated question in the response
    }
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Ask API error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error processing request";
    // Determine appropriate status code based on error type if possible
    let status = 500;
    // Refined type check to avoid 'any'
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number" // Direct access after 'in' check
    ) {
      status = error.status; // Direct access after check
    }
    return NextResponse.json(
      { error: "Failed to get answer", details: errorMessage },
      { status }
    );
  }
}
