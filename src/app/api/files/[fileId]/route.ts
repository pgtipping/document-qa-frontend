import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma"; // Import Prisma client instance
import { getAuthSession } from "@/lib/auth"; // Import session helper

// Configure S3 Client
// Ensure these environment variables are set in your .env.local or environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
// S3_PREFIX is not strictly needed here as we get the full key from DB

// Define an interface for the route context
interface RouteContext {
  params: {
    fileId: string;
  };
}

// GET /api/files/[fileId] - Workaround for Next.js type generation bug
export async function GET() {
  return NextResponse.json(
    { message: "GET method not implemented for this route." },
    { status: 501 }
  );
}

// DELETE /api/files/[fileId]
export async function DELETE(
  request: NextRequest,
  context: RouteContext // Use the defined interface for context
) {
  // Explicitly cast context to RouteContext as a workaround for Next.js type bug
  const typedContext = context as RouteContext;
  const fileId = typedContext.params.fileId; // Access fileId from typedContext.params
  console.log(`Attempting to delete document with ID: ${fileId}`);

  try {
    // --- Authentication & Authorization Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log(`Delete API: Unauthorized attempt for file ID ${fileId}.`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    // --- End Authentication Check ---

    // 1. Find the document record in the database AND verify ownership
    const document = await prisma.document.findUnique({
      where: { id: fileId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Authorization: Check if the document belongs to the authenticated user
    if (document.userId !== userId) {
      console.warn(
        `Delete API: Forbidden attempt by user ${userId} for document ${fileId} owned by ${document.userId}.`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // --- End Authorization Check ---

    if (document.status === "deleted") {
      return NextResponse.json({
        message: `Document ${fileId} is already marked as deleted.`,
      });
    }

    const s3Key = document.s3Key; // Get the S3 key from the database record

    // 2. Delete from S3
    console.log(
      `Attempting to delete s3://${S3_BUCKET_NAME}/${s3Key} for user ${userId}`
    );
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    });
    await s3Client.send(command);
    console.log(`Successfully deleted ${s3Key} from S3`);

    // 3. Update document status in the database
    const updatedDocument = await prisma.document.update({
      where: { id: fileId }, // Already know the user owns it from the check above
      data: { status: "deleted" },
    });
    console.log(
      `Successfully marked document ${fileId} as deleted in database for user ${userId}.`
    );

    return NextResponse.json({
      message: `Document ${updatedDocument.filename} (ID: ${fileId}) marked as deleted successfully.`,
      document: {
        // Optionally return updated document info
        id: updatedDocument.id,
        filename: updatedDocument.filename,
        status: updatedDocument.status,
      },
    });
  } catch (error) {
    console.error(
      `Error processing deletion for document ID ${fileId}:`,
      error
    );

    // Differentiate between S3 errors and DB errors if necessary
    // For now, returning a generic server error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown deletion error";
    return NextResponse.json(
      { error: "Failed to process file deletion", details: errorMessage },
      { status: 500 }
    );
  }
}
