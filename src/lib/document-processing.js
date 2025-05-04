// src/lib/document-processing.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import pdf from "pdf-parse"; // Keeping commented out due to ENOENT error
import mammoth from "mammoth";
import { pdfToText } from "pdf-ts"; // Correct named import
import { getExtractionFallback } from "./llm-service"; // Import the specific fallback function
// --- Constants ---
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MIN_EXTRACTED_CHARS_THRESHOLD = 10; // Minimum characters to consider extraction successful
// --- Cache Configuration ---
const contentCache = new Map();
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
async function fetchDocumentFromS3(s3Key) {
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
        const stream = response.Body;
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);
        console.log(`Successfully fetched ${buffer.length} bytes for ${s3Key}`);
        return buffer;
    }
    catch (error) {
        console.error(`Error fetching ${s3Key} from S3:`, error);
        // Ensure we throw an actual Error object
        const message = `Failed to fetch document from S3: ${s3Key}`;
        if (error instanceof Error) {
            throw new Error(`${message}. Reason: ${error.message}`);
        }
        else {
            throw new Error(`${message}. Reason: ${String(error)}`);
        }
    }
}
/**
 * Extracts text content from a DOCX buffer.
 */
async function extractDocxText(buffer) {
    try {
        console.log("Extracting text from DOCX buffer...");
        const result = await mammoth.extractRawText({ buffer });
        console.log(`Extracted ${result.value.length} characters from DOCX.`);
        return result.value;
    }
    catch (error) {
        console.error("Error extracting DOCX text:", error);
        // Ensure we throw an actual Error object
        const message = "Failed to extract text from DOCX";
        if (error instanceof Error) {
            throw new Error(`${message}. Reason: ${error.message}`);
        }
        else {
            throw new Error(`${message}. Reason: ${String(error)}`);
        }
    }
}
/**
 * Extracts text content from a plain text buffer.
 */
function extractPlainText(buffer) {
    try {
        console.log("Attempting UTF-8 decoding for plain text...");
        return buffer.toString("utf-8");
    }
    catch (utf8Error) {
        console.warn("UTF-8 decoding failed, falling back to latin1:", utf8Error);
        try {
            return buffer.toString("latin1");
        }
        catch (latin1Error) {
            console.error("Error extracting plain text (both UTF-8 and latin1 failed):", latin1Error);
            // Ensure we throw an actual Error object
            const message = "Failed to decode plain text file";
            if (latin1Error instanceof Error) {
                throw new Error(`${message}. Reason: ${latin1Error.message}`);
            }
            else {
                throw new Error(`${message}. Reason: ${String(latin1Error)}`);
            }
        }
    }
}
/**
 * Main function to get document content. Fetches from S3 and extracts text.
 */
export async function getDocumentTextContent(s3Key) {
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
    let extractedText = null;
    let extractionMethod = "unknown"; // Default, will be updated
    try {
        // --- Direct Extraction Attempt ---
        if (fileExtension === "pdf") {
            console.log("Attempting PDF text extraction using pdf-ts...");
            extractionMethod = "pdf-ts";
            extractedText = await pdfToText(buffer);
            console.log(`Extracted ${extractedText?.length ?? 0} characters using pdf-ts.`);
        }
        else if (fileExtension === "docx") {
            extractionMethod = "mammoth";
            extractedText = await extractDocxText(buffer);
        }
        else if (fileExtension === "txt") {
            extractionMethod = "plain";
            extractedText = extractPlainText(buffer);
        }
        else {
            console.warn(`Unsupported file extension '${fileExtension}' for direct extraction. Attempting plain text.`);
            try {
                extractionMethod = "plain-fallback";
                extractedText = extractPlainText(buffer);
            }
            catch (e) {
                // If plain text fallback fails for unsupported type, throw specific error
                console.error(`Plain text extraction failed for unsupported type:`, e);
                const message = `Unsupported file type for extraction: ${fileExtension}`;
                if (e instanceof Error) {
                    throw new Error(`${message}. Reason: ${e.message}`);
                }
                else {
                    throw new Error(`${message}. Reason: ${String(e)}`);
                }
            }
        }
        // --- Check if Fallback Needed ---
        const insufficientContent = !extractedText ||
            extractedText.trim().length < MIN_EXTRACTED_CHARS_THRESHOLD;
        if (insufficientContent) {
            console.warn(`Direct extraction method '${extractionMethod}' yielded insufficient content (${extractedText?.trim().length ?? 0} chars) for ${s3Key}. Attempting LLM fallback.`);
            // --- LLM Fallback Logic ---
            extractionMethod = "llm-fallback (google)";
            let bufferString = "";
            try {
                bufferString = buffer.toString("utf-8");
            }
            catch {
                try {
                    bufferString = buffer.toString("latin1");
                }
                catch {
                    console.error("Failed to convert buffer to string for LLM fallback.");
                }
            }
            // Limit buffer string length to avoid overly large prompts
            const maxBufferStringLength = 15000; // Increased limit slightly
            if (bufferString.length > maxBufferStringLength) {
                bufferString =
                    bufferString.substring(0, maxBufferStringLength) + "... [truncated]";
            }
            const fallbackPrompt = `Direct text extraction failed or yielded insufficient content for a document (key: ${s3Key}). Please extract all readable text from the following potentially raw or truncated content:\n\n---\n${bufferString}\n---\n\nExtracted Text:`;
            extractedText = await getExtractionFallback(fallbackPrompt); // Call the specific fallback
            if (!extractedText ||
                extractedText.trim().length < MIN_EXTRACTED_CHARS_THRESHOLD) {
                console.error(`LLM fallback also failed or yielded insufficient content for ${s3Key}.`);
                throw new Error(`LLM fallback failed to extract sufficient content for ${s3Key}.`);
            }
            else {
                console.log(`LLM fallback extraction successful for ${s3Key}. Length: ${extractedText.length}`);
            }
            // End of LLM Fallback Logic
        }
        // End of Fallback Check
    }
    catch (error) {
        // --- Catch Direct Extraction Errors & Attempt Fallback ---
        console.error(`Direct extraction method '${extractionMethod}' failed for ${s3Key}:`, error);
        console.log(`Attempting LLM fallback due to direct extraction error for ${s3Key}.`);
        extractionMethod = "llm-fallback (google)";
        let bufferString = "";
        try {
            bufferString = buffer.toString("utf-8");
        }
        catch {
            try {
                bufferString = buffer.toString("latin1");
            }
            catch {
                console.error("Failed to convert buffer to string for LLM fallback.");
            }
        }
        const maxBufferStringLength = 15000;
        if (bufferString.length > maxBufferStringLength) {
            bufferString =
                bufferString.substring(0, maxBufferStringLength) + "... [truncated]";
        }
        const fallbackPrompt = `Direct text extraction failed for a document (key: ${s3Key}). Please extract all readable text from the following potentially raw or truncated content:\n\n---\n${bufferString}\n---\n\nExtracted Text:`;
        extractedText = await getExtractionFallback(fallbackPrompt); // Call the specific fallback
        if (!extractedText ||
            extractedText.trim().length < MIN_EXTRACTED_CHARS_THRESHOLD) {
            console.error(`LLM fallback also failed or yielded insufficient content after direct extraction error for ${s3Key}.`);
            const message = `Both direct extraction and LLM fallback failed for ${s3Key}`;
            if (error instanceof Error) {
                throw new Error(`${message}. Initial error: ${error.message}`);
            }
            else {
                throw new Error(`${message}. Initial error: ${String(error)}`);
            }
        }
        else {
            console.log(`LLM fallback extraction successful after direct extraction error for ${s3Key}. Length: ${extractedText.length}`);
        }
        // End of LLM Fallback Logic in Catch
    }
    // --- Final Validation & Cache Update ---
    // This check ensures we always have *some* content after potentially falling back
    if (!extractedText || extractedText.trim().length === 0) {
        // This should ideally not be reached if fallback logic throws errors properly on failure
        throw new Error(`Failed to extract text content from ${s3Key} using method ${extractionMethod}. Result was empty after all attempts.`);
    }
    contentCache.set(s3Key, { content: extractedText, timestamp: Date.now() });
    console.log(`Cached content for: ${s3Key}`);
    console.log(`Content extracted for ${s3Key} using ${extractionMethod} method.`);
    return extractedText;
}
// TODO: Add placeholder for authorization checks if needed at this level
// Example: checkUserPermission(userId, s3Key);
