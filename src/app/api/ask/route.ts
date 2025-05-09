import { NextRequest, NextResponse } from "next/server";
import { performance } from "perf_hooks"; // Import performance for timing
import prisma from "@/lib/prisma"; // Import Prisma client instance
import { Prisma } from "@prisma/client"; // Import Prisma namespace for types like JsonNull
// Removed unused Prisma import comment as Prisma is now used
import { getDocumentTextContent } from "@/lib/document-processing"; // Keep for now, might be needed if re-processing is triggered
import {
  getCompletion,
  splitIntoChunks, // Re-add missing import needed for 'model' mode
  // getRelevantChunks, // No longer needed here
  generateEmbedding, // Import embedding function
  buildPromptWithContextLimit,
} from "@/lib/llm-service";
import { getPineconeIndex } from "@/lib/pinecone-client"; // Import Pinecone index getter
import { getAuthSession } from "@/lib/auth"; // Import session helper
// Remove unused import: import { type ScoredPineconeRecord } from "@pinecone-database/pinecone";
// Removed Filter import as it's not exported; type will be inferred or use a generic type if needed.

// Define type for the result of the document query
interface DocumentInfo {
  id: string;
  s3Key: string;
  filename: string;
}

// --- Configuration ---
// Base template can still be defined here or imported if shared
const PROMPT_TEMPLATE_BASE = `Based on the following context, please answer the question. If the answer is not present in the context, say "I cannot find the answer in the provided documents."\n\nContext:\n{CONTEXT}\n\nQuestion: {QUESTION}\n\nAnswer:`;
const PROMPT_TEMPLATE_GENERATE_QUESTION = `Based on the following context, generate one insightful question that can be answered using the provided text. Focus on key information or concepts presented.\n\nContext:\n{CONTEXT}\n\nGenerated Question:`;

// --- API Route Handler ---
export async function POST(request: NextRequest) {
  const startTime = performance.now(); // Start timing the request
  let embeddingTime: number | null = null;
  let vectorSearchTime: number | null = null;
  let llmCompletionTime: number | null = null;
  let docProcessingTimeModelMode: number | null = null;
  // Removed unused variable: let llmQuestionGenTimeModelMode: number | null = null;

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
      // Define a type for the where clause to allow optional 'id'
      type DocumentWhereClause = {
        userId: string;
        status: "active";
        id?: { in: string[] }; // Make id optional
      };

      // Define the base where clause with the specific type
      const whereClause: DocumentWhereClause = {
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

    // --- Detailed Logging Removed ---
    // console.log(...) // Removed document finding log
    // --- End Detailed Logging ---

    if (!documentsToProcess || documentsToProcess.length === 0) {
      const message =
        Array.isArray(documentIds) && documentIds.length > 0
          ? "None of the selected documents were found or are active."
          : "No active documents found for this user to provide context.";
      // console.log(`[Ask API Debug] ${message}`); // Removed log
      return NextResponse.json(
        { answer: message },
        { status: 200 } // Not an error, just no context available
      );
    }

    const s3KeysToProcess = documentsToProcess.map(
      (doc: DocumentInfo) => doc.s3Key
    ); // Add type to doc
    console.log(
      `Processing ${s3KeysToProcess.length} documents for user ${userId}:`,
      documentsToProcess.map((d: DocumentInfo) => d.filename) // Add type to d
    );
    // --- End Prisma Integration ---

    // --- Determine the final question (user's or generated) ---
    let finalQuestion = userQuestion;
    let generatedQuestionForResponse: string | undefined = undefined;

    if (mode === "model") {
      // If mode is 'model', we need *some* context to generate a question.
      // Fetching *all* content just to generate a question might be too slow/expensive.
      // Strategy: Use the first document's content or a subset for question generation.
      // For simplicity now, let's just use the first document found.
      // A better approach might involve fetching titles/summaries or using a smaller context.
      console.log("Mode is 'model', attempting to generate question...");
      if (documentsToProcess && documentsToProcess.length > 0) {
        const firstDocKey = documentsToProcess[0].s3Key;
        console.log(
          // Restore console.log call
          `Using first document (${documentsToProcess[0].filename}) for question generation context.`
        );
        const docProcStartTime = performance.now();
        const questionGenContent = await getDocumentTextContent(firstDocKey);
        docProcessingTimeModelMode =
          (performance.now() - docProcStartTime) / 1000; // seconds

        if (questionGenContent) {
          const questionGenChunks = splitIntoChunks(
            questionGenContent,
            1000,
            100
          ); // Smaller chunks for question gen
          const questionGenPrompt = buildPromptWithContextLimit(
            questionGenChunks.slice(0, 5), // Limit context for question gen
            "",
            PROMPT_TEMPLATE_GENERATE_QUESTION
          );
          // Removed unused variable: const llmQGStartTime = performance.now();
          const generatedQ = await getCompletion(questionGenPrompt);
          // Removed assignment to unused variable: llmQuestionGenTimeModelMode = (performance.now() - llmQGStartTime) / 1000; // seconds

          if (generatedQ) {
            finalQuestion = generatedQ.trim();
            generatedQuestionForResponse = finalQuestion; // Store for response payload
            console.log(`Generated question: "${finalQuestion}"`);
          } else {
            console.error(
              "Failed to generate question from LLM for 'model' mode."
            );
            // Fallback: Ask a generic question or return error? For now, return error.
            return NextResponse.json(
              { error: "Failed to generate a question for Q&A mode." },
              { status: 503 }
            );
          }
        } else {
          console.error(
            "Failed to get content for question generation in 'model' mode."
          );
          return NextResponse.json(
            { error: "Failed to get context for question generation." },
            { status: 500 }
          );
        }
      } else {
        // This case is already handled above, but added for clarity
        console.error(
          "No documents available to generate question in 'model' mode."
        );
        return NextResponse.json(
          { error: "No documents available for question generation." },
          { status: 400 }
        );
      }
    }
    // --- End Q&A Mode Logic / Determine Final Question ---

    if (!finalQuestion) {
      // Should not happen if mode is 'user' due to earlier check, but safety first
      console.error("No final question available to proceed.");
      return NextResponse.json(
        { error: "Internal error: Question not available." },
        { status: 500 }
      );
    }

    // --- Vector Search for Relevant Context ---
    // Define a specific type for the Pinecone filter
    interface PineconeQueryFilter {
      userId: string;
      documentId?: { $in: string[] };
    }
    let relevantChunks: string[] = [];
    try {
      console.log(`Generating embedding for question: "${finalQuestion}"`);
      const embeddingStartTime = performance.now();
      const questionEmbedding = await generateEmbedding(finalQuestion);
      embeddingTime = (performance.now() - embeddingStartTime) / 1000; // seconds

      if (!questionEmbedding) {
        throw new Error("Failed to generate embedding for the question.");
      }

      console.log("Querying Pinecone index...");
      const pineconeIndex = await getPineconeIndex();

      // Construct filter based on user and selected documents
      const queryFilter: PineconeQueryFilter = { userId: userId }; // Use the specific interface
      if (Array.isArray(documentIds) && documentIds.length > 0) {
        // Filter results to only include chunks from the selected document IDs
        queryFilter.documentId = { $in: documentIds };
        console.log(`Applying Pinecone filter for document IDs:`, documentIds);
      } else {
        console.log(
          `No document ID filter applied, searching all user's indexed chunks.`
        );
      }

      const vectorSearchStartTime = performance.now();
      const queryResponse = await pineconeIndex.query({
        vector: questionEmbedding,
        topK: 10, // Retrieve more chunks initially
        filter: queryFilter,
        includeMetadata: true, // Crucial to get the text back
      });
      vectorSearchTime = (performance.now() - vectorSearchStartTime) / 1000; // seconds

      console.log(
        `Pinecone query returned ${queryResponse.matches?.length ?? 0} matches.`
      );

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        // Extract the text from metadata
        relevantChunks = queryResponse.matches
          .map((match) => {
            // Type guard for metadata and text property
            if (
              match.metadata &&
              typeof match.metadata === "object" &&
              "text" in match.metadata &&
              typeof match.metadata.text === "string"
            ) {
              return match.metadata.text;
            }
            console.warn(`Match ${match.id} missing text metadata.`);
            return null;
          })
          .filter((text): text is string => text !== null); // Filter out nulls

        console.log(
          `Extracted text from ${relevantChunks.length} Pinecone matches.`
        );
      } else {
        console.log("No relevant chunks found via vector search.");
      }
    } catch (vectorSearchError) {
      console.error("Error during vector search:", vectorSearchError);
      // Decide how to handle: fallback to keyword? Return error? For now, return error.
      return NextResponse.json(
        { error: "Failed to retrieve relevant context via vector search." },
        { status: 500 }
      );
    }
    // --- End Vector Search ---

    // --- Build Prompt and Get Completion ---
    // Removed redundant 'model' mode question generation block here.
    // The finalQuestion is already determined before vector search.

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
    const llmCompletionStartTime = performance.now();
    const answer = await getCompletion(finalAnswerPrompt);
    llmCompletionTime = (performance.now() - llmCompletionStartTime) / 1000; // seconds

    if (answer === null) {
      // Log failure before returning? Maybe not, keep logs for successful requests.
      return NextResponse.json(
        { error: "Failed to get answer from LLM providers after retries." },
        { status: 503 }
      ); // Service Unavailable
    }

    // 6. Return the answer
    console.log("Received answer from LLM service.");
    // 6. Return the answer (and the generated question if applicable)
    // Removed duplicate console.log
    const responsePayload: { answer: string; generatedQuestion?: string } = {
      answer,
    };
    // Use the stored generated question if mode was 'model'
    if (mode === "model" && generatedQuestionForResponse) {
      responsePayload.generatedQuestion = generatedQuestionForResponse;
    }

    // --- Performance Logging ---
    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // seconds

    try {
      await prisma.performanceLog.create({
        data: {
          userId: userId,
          mode: mode,
          question: finalQuestion, // Log the final question used
          documentIds: documentsToProcess.map((doc: DocumentInfo) => doc.id), // Add type to doc
          embeddingTime: embeddingTime,
          vectorSearchTime: vectorSearchTime,
          llmCompletionTime: llmCompletionTime,
          docProcessingTime: docProcessingTimeModelMode, // Only relevant for model mode currently
          // llmQuestionGenTime field does not exist in the schema, removing assignment
          totalTime: totalTime,
          // Placeholders for detailed breakdowns - need implementation in services
          llmTimingBreakdown: Prisma.JsonNull,
          docTimingBreakdown: Prisma.JsonNull,
          docMetricsJson: Prisma.JsonNull,
        },
      });
      console.log(
        `Performance log saved for user ${userId}. Total time: ${totalTime.toFixed(
          2
        )}s`
      );
    } catch (logError) {
      console.error("Failed to save performance log:", logError);
      // Do not fail the request if logging fails, just log the error
    }
    // --- End Performance Logging ---

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
