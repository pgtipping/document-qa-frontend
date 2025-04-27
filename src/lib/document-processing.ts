// src/lib/document-processing.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { Readable } from "stream";
import { getCompletion } from "./llm-service"; // Import for LLM fallback

// --- Cache Configuration ---
const contentCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to clean expired cache entries (optional, can be called periodically)
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of contentCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      contentCache.delete(key);
      console.log(`Cache expired and removed for: ${key}`);
    }
  }
}
// Simple interval cleanup (optional)
// setInterval(cleanExpiredCache, CACHE_TTL); // Run cleanup every 5 mins

// --- S3 Configuration ---
// Configure S3 Client (reuse or instantiate as needed)
// Ensure these environment variables are set
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Fetches a document from S3.
 * @param s3Key The full S3 key for the document.
 * @returns A Buffer containing the document content.
 */
async function fetchDocumentFromS3(s3Key: string): Promise<Buffer> {
  console.log(`Fetching document from S3: ${s3Key}`);
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    });
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("S3 response body is empty.");
    }

    // Convert stream to buffer
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    console.log(`Successfully fetched ${buffer.length} bytes for ${s3Key}`);
    return buffer;
  } catch (error) {
    console.error(`Error fetching ${s3Key} from S3:`, error);
    // Consider more specific error handling (e.g., NoSuchKey)
    throw new Error(`Failed to fetch document from S3: ${s3Key}`);
  }
}

/**
 * Extracts text content from a PDF buffer.
 * @param buffer The buffer containing the PDF data.
 * @returns The extracted text content.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log("Extracting text from PDF buffer...");
    const data = await pdf(buffer);
    console.log(`Extracted ${data.text.length} characters from PDF.`);
    return data.text;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF.");
  }
}

/**
 * Extracts text content from a DOCX buffer.
 * @param buffer The buffer containing the DOCX data.
 * @returns The extracted text content.
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    console.log("Extracting text from DOCX buffer...");
    const result = await mammoth.extractRawText({ buffer });
    console.log(`Extracted ${result.value.length} characters from DOCX.`);
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX.");
  }
}

/**
 * Extracts text content from a plain text buffer.
 * Attempts UTF-8 decoding first, then falls back to latin1.
 * @param buffer The buffer containing the text data.
 * @returns The extracted text content.
 */
function extractPlainText(buffer: Buffer): string {
  try {
    console.log("Attempting UTF-8 decoding for plain text...");
    return buffer.toString("utf-8");
  } catch (utf8Error) {
    console.warn("UTF-8 decoding failed, falling back to latin1:", utf8Error);
    try {
      return buffer.toString("latin1");
    } catch (latin1Error) {
      console.error(
        "Error extracting plain text (both UTF-8 and latin1 failed):",
        latin1Error
      );
      throw new Error("Failed to decode plain text file.");
    }
  }
}

/**
 * Attempts to extract text content using an LLM as a fallback.
 * Note: This is a basic implementation. Sending raw buffers isn't ideal.
 * A more robust solution might involve OCR services or multimodal models.
 * @param buffer The buffer containing the file data.
 * @param fileType The file extension (e.g., 'pdf', 'docx').
 * @param originalError Optional error from the direct extraction attempt.
 * @returns The extracted text content from the LLM, or null if failed.
 */
async function extractWithLlm(
  buffer: Buffer,
  fileType: string,
  originalError?: Error
): Promise<string | null> {
  console.warn(`Attempting LLM extraction fallback for file type: ${fileType}`);
  // TODO: Improve prompt engineering. How to represent the buffer?
  // For now, we'll just inform the LLM about the failure and file type.
  // A better approach might involve sending metadata or trying OCR first.
  let prompt = `Failed to directly extract text from a file of type '${fileType}'. `;
  if (originalError) {
    prompt += `The error was: ${originalError.message}. `;
  }
  prompt += `Please analyze the potential content structure or provide a summary if possible.`;
  // We cannot reliably send the buffer content directly in the prompt here.
  // This fallback is limited without multimodal capabilities or OCR integration.
  // We'll call getCompletion with a generic prompt indicating failure.
  // In a real scenario, you might use a specific OCR model/service here.

  try {
    // This call is unlikely to succeed well without a proper input representation
    const llmResult = await getCompletion(prompt);
    if (llmResult) {
      console.log(`LLM fallback extraction provided a result for ${fileType}.`);
      // We return the LLM's response, which might be an explanation or partial data.
      return llmResult;
    } else {
      console.error(
        `LLM fallback extraction failed to produce a result for ${fileType}.`
      );
      return null;
    }
  } catch (llmError) {
    console.error(
      `Error during LLM fallback extraction for ${fileType}:`,
      llmError
    );
    return null;
  }
}

/**
 * Main function to get document content. Fetches from S3 and extracts text.
 * Determines extraction method based on file extension in the S3 key.
 * @param s3Key The full S3 key for the document.
 * @returns The extracted text content.
 */
export async function getDocumentTextContent(s3Key: string): Promise<string> {
  // --- Check Cache ---
  cleanExpiredCache(); // Clean expired entries before checking
  const cachedEntry = contentCache.get(s3Key);
  if (cachedEntry && Date.now() - cachedEntry.timestamp <= CACHE_TTL) {
    console.log(`Cache hit for: ${s3Key}`);
    return cachedEntry.content;
  }
  console.log(`Cache miss or expired for: ${s3Key}`);

  // --- Fetch and Process ---
  const fileExtension = s3Key.split(".").pop()?.toLowerCase();
  if (!fileExtension) {
    throw new Error(`Could not determine file extension from S3 key: ${s3Key}`);
  }

  const buffer = await fetchDocumentFromS3(s3Key);
  let extractedText: string | null = null;
  let extractionMethod = "direct";

  try {
    if (fileExtension === "pdf") {
      extractedText = await extractPdfText(buffer);
    } else if (fileExtension === "docx") {
      extractedText = await extractDocxText(buffer);
    } else if (fileExtension === "txt") {
      extractedText = extractPlainText(buffer);
    } else {
      // Consider attempting plain text extraction as a default for unknown types
      console.warn(
        `Unsupported file extension '${fileExtension}' for direct extraction. Attempting plain text.`
      );
      try {
        extractedText = extractPlainText(buffer);
      } catch (e) {
        throw new Error(
          `Unsupported file type for extraction: ${fileExtension}`
        );
      }
    }

    // Basic check similar to Python backend - potentially trigger LLM fallback
    if (!extractedText || extractedText.trim().length < 100) {
      console.warn(
        `Direct extraction yielded insufficient content (${
          extractedText?.trim().length ?? 0
        } chars) for ${s3Key}. Triggering LLM fallback.`
      );
      extractionMethod = "llm";
      extractedText = await extractWithLlm(buffer, fileExtension);
      // Re-check after LLM fallback
      if (!extractedText || extractedText.trim().length < 100) {
        // Throw error only if LLM fallback also fails to produce sufficient content
        throw new Error(
          "Direct text extraction yielded insufficient content, and LLM fallback also failed or yielded insufficient content."
        );
      }
    }
  } catch (error) {
    console.error(`Direct extraction failed for ${s3Key}:`, error);
    // Attempt LLM fallback extraction as a final attempt after any direct extraction error
    try {
      console.log(
        `Attempting LLM fallback extraction for ${s3Key} after error.`
      );
      extractionMethod = "llm";
      // Pass the original error for context
      extractedText = await extractWithLlm(
        buffer,
        fileExtension,
        error instanceof Error ? error : undefined
      );
      // If LLM fallback returns null or empty after an error, we throw
      if (!extractedText || extractedText.trim().length === 0) {
        console.error(
          `LLM fallback extraction also failed for ${s3Key} after initial error.`
        );
        throw error instanceof Error ? error : new Error(String(error)); // Re-throw original error
      }
      console.log(
        `LLM fallback succeeded after initial extraction error for ${s3Key}.`
      );
    } catch (fallbackError) {
      console.error(
        `LLM fallback extraction also failed for ${s3Key}:`,
        fallbackError
      );
      // Throw the *original* extraction error if LLM fallback fails
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // Final check if text is still null/empty after all attempts
  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error(
      `Failed to extract text content from ${s3Key} using any method (direct or LLM fallback).`
    );
  }

  // --- Update Cache ---
  contentCache.set(s3Key, { content: extractedText, timestamp: Date.now() });
  console.log(`Cached content for: ${s3Key}`);

  console.log(
    `Content extracted for ${s3Key} using ${extractionMethod} method.`
  );
  return extractedText;
}

// TODO: Add placeholder for authorization checks if needed at this level,
// although typically authorization happens in the API route before calling this.
// Example: checkUserPermission(userId, s3Key);
