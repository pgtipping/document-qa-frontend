import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Define environment variables with fallbacks for development
const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.S3_BUCKET_NAME || "inqdoc-documents-dev";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Error types
export enum S3ErrorType {
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  PERMISSION = "PERMISSION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  REQUEST = "REQUEST_ERROR",
  INTERNAL = "INTERNAL_ERROR",
}

// Custom error class for S3 operations
export class S3Error extends Error {
  type: S3ErrorType;
  originalError?: Error;

  constructor(message: string, type: S3ErrorType, originalError?: Error) {
    super(message);
    this.name = "S3Error";
    this.type = type;
    this.originalError = originalError;
  }
}

// Define the S3 client configuration
const s3ClientConfig: any = {
  region,
};

// Only add credentials if they're defined (for local development)
// In production, use IAM roles or instance profiles
if (accessKeyId && secretAccessKey) {
  s3ClientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
  };
}

// Initialize the S3 client
const s3Client = new S3Client(s3ClientConfig);

// Interface for document metadata
export interface DocumentMetadata {
  contentType: string;
  contentLength?: number;
  userId: string;
  documentId: string;
  [key: string]: any; // Additional metadata
}

// Interface for upload configuration
export interface UploadConfig {
  contentType: string;
  metadata?: Record<string, string>;
  expiresIn?: number; // URL expiration time in seconds
}

// Interface for download configuration
export interface DownloadConfig {
  expiresIn?: number; // URL expiration time in seconds
}

/**
 * Generate a unique S3 key for a document
 * @param userId User ID
 * @param documentId Document ID
 * @param filename Original filename
 * @returns Unique S3 key
 */
export function generateS3Key(
  userId: string,
  documentId: string,
  filename: string
): string {
  // Sanitize filename to remove special characters
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-_]/g, "_");

  // Format: users/{userId}/documents/{documentId}/{sanitizedFilename}
  return `users/${userId}/documents/${documentId}/${sanitizedFilename}`;
}

/**
 * Generate a presigned URL for document upload
 * @param s3Key S3 object key
 * @param config Upload configuration
 * @returns Presigned URL and fields for direct upload
 */
export async function getPresignedUploadUrl(
  s3Key: string,
  config: UploadConfig
): Promise<string> {
  try {
    // Create the put object command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: config.contentType,
      Metadata: config.metadata,
    });

    // Generate the presigned URL
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: config.expiresIn || 3600, // Default 1 hour
    });

    return url;
  } catch (error: any) {
    console.error("Error generating presigned upload URL:", error);

    // Handle specific AWS errors
    if (
      error.name === "InvalidAccessKeyId" ||
      error.name === "SignatureDoesNotMatch"
    ) {
      throw new S3Error(
        "Failed to authenticate with S3",
        S3ErrorType.AUTHENTICATION,
        error
      );
    }

    if (error.name === "AccessDenied") {
      throw new S3Error(
        "Permission denied for S3 operation",
        S3ErrorType.PERMISSION,
        error
      );
    }

    throw new S3Error(
      "Failed to generate presigned upload URL",
      S3ErrorType.INTERNAL,
      error
    );
  }
}

/**
 * Generate a presigned URL for document download
 * @param s3Key S3 object key
 * @param config Download configuration
 * @returns Presigned URL for download
 */
export async function getPresignedDownloadUrl(
  s3Key: string,
  config?: DownloadConfig
): Promise<string> {
  try {
    // Create the get object command
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    // Generate the presigned URL
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: config?.expiresIn || 3600, // Default 1 hour
    });

    return url;
  } catch (error: any) {
    console.error("Error generating presigned download URL:", error);

    // Handle specific AWS errors
    if (error.name === "NoSuchKey") {
      throw new S3Error(
        "Document not found in storage",
        S3ErrorType.NOT_FOUND,
        error
      );
    }

    if (error.name === "AccessDenied") {
      throw new S3Error(
        "Permission denied for S3 operation",
        S3ErrorType.PERMISSION,
        error
      );
    }

    throw new S3Error(
      "Failed to generate presigned download URL",
      S3ErrorType.INTERNAL,
      error
    );
  }
}

/**
 * Check if a document exists in S3
 * @param s3Key S3 object key
 * @returns True if document exists, false otherwise
 */
export async function doesDocumentExist(s3Key: string): Promise<boolean> {
  try {
    // Create the head object command
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    // Execute the command
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound" || error.name === "NoSuchKey") {
      return false;
    }

    console.error("Error checking document existence:", error);
    throw new S3Error(
      "Failed to check document existence",
      S3ErrorType.REQUEST,
      error
    );
  }
}

/**
 * Delete a document from S3
 * @param s3Key S3 object key
 */
export async function deleteDocument(s3Key: string): Promise<void> {
  try {
    // Create the delete object command
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    // Execute the command
    await s3Client.send(command);
  } catch (error: any) {
    console.error("Error deleting document:", error);

    if (error.name === "NoSuchKey") {
      throw new S3Error(
        "Document not found in storage",
        S3ErrorType.NOT_FOUND,
        error
      );
    }

    if (error.name === "AccessDenied") {
      throw new S3Error(
        "Permission denied for S3 operation",
        S3ErrorType.PERMISSION,
        error
      );
    }

    throw new S3Error("Failed to delete document", S3ErrorType.INTERNAL, error);
  }
}

/**
 * Get metadata for a document
 * @param s3Key S3 object key
 * @returns Document metadata
 */
export async function getDocumentMetadata(
  s3Key: string
): Promise<Record<string, string>> {
  try {
    // Create the head object command
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    // Execute the command
    const response = await s3Client.send(command);

    // Return metadata or empty object if not found
    return response.Metadata || {};
  } catch (error: any) {
    console.error("Error getting document metadata:", error);

    if (error.name === "NotFound" || error.name === "NoSuchKey") {
      throw new S3Error(
        "Document not found in storage",
        S3ErrorType.NOT_FOUND,
        error
      );
    }

    throw new S3Error(
      "Failed to get document metadata",
      S3ErrorType.INTERNAL,
      error
    );
  }
}

export default {
  generateS3Key,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  doesDocumentExist,
  deleteDocument,
  getDocumentMetadata,
};
