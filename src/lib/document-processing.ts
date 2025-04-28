// src/lib/document-processing.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import pdf from "pdf-parse"; // Keeping commented out due to ENOENT error
import mammoth from "mammoth";
import { Readable } from "stream";
import { pdfToText } from "pdf-ts"; // Correct named import
// import { getCompletion } from "./llm-service"; // LLM Fallback removed

// --- Constants ---
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MIN_EXTRACTED_CHARS_THRESHOLD = 10; // Minimum characters to consider extraction successful

// --- Cache Configuration ---
const contentCache = new Map<string, { content: string; timestamp: number }>();

// Function to clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of contentCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      contentCache.delete(key);
      console.log(`Cache expired and removed for: ${key}`);
    }
  }
}

// --- S3 Configuration ---
// Validate essential environment variables
const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3BucketName = process.env.S3_BUCKET_NAME;

if (!awsRegion) {
  throw new Error("Missing environment variable: AWS_REGION");
}
if (!awsAccessKeyId) {
  throw new Error("Missing environment variable: AWS_ACCESS_KEY_ID");
}
if (!awsSecretAccessKey) {
  throw new Error("Missing environment variable: AWS_SECRET_ACCESS_KEY");
}
if (!s3BucketName) {
  throw new Error("Missing environment variable: S3_BUCKET_NAME");
}

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

/**
 * Fetches a document from S3.
 */
async function fetchDocumentFromS3(s3Key: string): Promise<Buffer> {
  console.log(`Fetching document from S3: ${s3Key}`);
  try {
    const command = new GetObjectCommand({
      Bucket: s3BucketName, // Use validated variable
      Key: s3Key,
    });
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("S3 response body is empty.");
    }

    // Type assertion might be necessary depending on SDK version, but considered safe here.
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
    // Ensure we throw an actual Error object
    const message = `Failed to fetch document from S3: ${s3Key}`;
    if (error instanceof Error) {
      throw new Error(`${message}. Reason: ${error.message}`);
    } else {
      throw new Error(`${message}. Reason: ${String(error)}`);
    }
  }
}

/**
 * Extracts text content from a DOCX buffer.
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    console.log("Extracting text from DOCX buffer...");
    const result = await mammoth.extractRawText({ buffer });
    console.log(`Extracted ${result.value.length} characters from DOCX.`);
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    // Ensure we throw an actual Error object
    const message = "Failed to extract text from DOCX";
    if (error instanceof Error) {
      throw new Error(`${message}. Reason: ${error.message}`);
    } else {
      throw new Error(`${message}. Reason: ${String(error)}`);
    }
  }
}

/**
 * Extracts text content from a plain text buffer.
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
      // Ensure we throw an actual Error object
      const message = "Failed to decode plain text file";
      if (latin1Error instanceof Error) {
        throw new Error(`${message}. Reason: ${latin1Error.message}`);
      } else {
        throw new Error(`${message}. Reason: ${String(latin1Error)}`);
      }
    }
  }
}

/**
 * Main function to get document content. Fetches from S3 and extracts text.
 */
export async function getDocumentTextContent(s3Key: string): Promise<string> {
  cleanExpiredCache();
  const cachedEntry = contentCache.get(s3Key);
  if (cachedEntry && Date.now() - cachedEntry.timestamp <= CACHE_TTL) {
    console.log(`Cache hit for: ${s3Key}`);
    return cachedEntry.content;
  }
  console.log(`Cache miss or expired for: ${s3Key}`);

  const fileExtension = s3Key.split(".").pop()?.toLowerCase();
  if (!fileExtension) {
    throw new Error(`Could not determine file extension from S3 key: ${s3Key}`);
  }

  const buffer = await fetchDocumentFromS3(s3Key);
  let extractedText: string | null = null;
  let extractionMethod = "unknown"; // Default, will be updated

  try {
    if (fileExtension === "pdf") {
      // Attempt extraction using pdf-ts
      console.log("Attempting PDF text extraction using pdf-ts...");
      extractionMethod = "pdf-ts";
      extractedText = await pdfToText(buffer); // Correct function call
      console.log(
        `Extracted ${extractedText?.length ?? 0} characters using pdf-ts.`
      );
    } else if (fileExtension === "docx") {
      extractionMethod = "mammoth";
      extractedText = await extractDocxText(buffer);
    } else if (fileExtension === "txt") {
      extractionMethod = "plain";
      extractedText = extractPlainText(buffer);
    } else {
      console.warn(
        `Unsupported file extension '${fileExtension}' for direct extraction. Attempting plain text.`
      );
      try {
        extractionMethod = "plain-fallback";
        extractedText = extractPlainText(buffer);
      } catch (e) {
        console.error(`Error during plain text extraction attempt:`, e);
        // Ensure we throw an actual Error object
        const message = `Unsupported file type for extraction: ${fileExtension}`;
        if (e instanceof Error) {
          throw new Error(`${message}. Reason: ${e.message}`);
        } else {
          throw new Error(`${message}. Reason: ${String(e)}`);
        }
      }
    }

    // Basic check for sufficient content after direct extraction
    const insufficientContent =
      !extractedText ||
      extractedText.trim().length < MIN_EXTRACTED_CHARS_THRESHOLD;

    if (insufficientContent) {
      console.warn(
        `Direct extraction method '${extractionMethod}' yielded potentially insufficient content (${
          extractedText?.trim().length ?? 0
        } chars) for ${s3Key}.`
      );
      // Optionally, we could still throw an error here if content is truly empty or below a critical threshold
      // For now, we proceed but log the warning. If it's completely empty later, an error will be thrown.
    }
  } catch (error) {
    console.error(
      `Direct extraction method '${extractionMethod}' failed for ${s3Key}:`,
      error
    );
    // Re-throw the error from the direct extraction method. No LLM fallback.
    // Ensure we throw an actual Error object
    const message = `Extraction failed for ${s3Key} using method ${extractionMethod}`;
    if (error instanceof Error) {
      throw new Error(`${message}. Reason: ${error.message}`);
    } else {
      throw new Error(`${message}. Reason: ${String(error)}`);
    }
  }

  // Final check - ensure text is not null or empty before caching/returning
  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error(
      `Failed to extract text content from ${s3Key} using method ${extractionMethod}. Result was empty.`
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

// TODO: Add placeholder for authorization checks if needed at this level
// Example: checkUserPermission(userId, s3Key);
