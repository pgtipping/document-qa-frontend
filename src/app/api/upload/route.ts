import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import s3Client, { UploadConfig } from "@/lib/s3-client";
import { v4 as uuidv4 } from "uuid";

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schema for upload request
const UploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024), // 100MB max
  description: z.string().optional(),
});

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/msword", // DOC
];

/**
 * POST /api/upload
 * Generates a presigned URL for direct-to-S3 document upload
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = UploadRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Invalid upload data",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    const { filename, contentType, fileSize, description } = validatedData.data;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: "Unsupported file type",
          allowedTypes: ALLOWED_FILE_TYPES,
        },
        { status: 400 }
      );
    }

    // Generate a unique ID for the document
    const documentId = uuidv4();

    // Generate S3 key for the document
    const s3Key = s3Client.generateS3Key(session.user.id, documentId, filename);

    // Create upload configuration
    const uploadConfig: UploadConfig = {
      contentType,
      metadata: {
        userId: session.user.id,
        documentId,
        originalFilename: filename,
      },
      expiresIn: 3600, // 1 hour
    };

    // Generate presigned URL for upload
    const presignedUrl = await s3Client.getPresignedUploadUrl(
      s3Key,
      uploadConfig
    );

    // Create document record in database (initially in 'pending' state)
    const document = await prisma.document.create({
      data: {
        id: documentId,
        name: filename,
        fileType: contentType,
        fileSize,
        description,
        s3Key,
        status: "pending",
        userId: session.user.id,
      },
    });

    // Return presigned URL and document ID
    return NextResponse.json(
      {
        documentId,
        presignedUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Endpoint to get upload configuration (allowed file types, size limits)
 */
export async function GET(req: NextRequest) {
  // Verify user authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Return upload configuration
  return NextResponse.json({
    maxSizeBytes: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ALLOWED_FILE_TYPES,
    presignedUrlTtlSeconds: 3600,
  });
}
