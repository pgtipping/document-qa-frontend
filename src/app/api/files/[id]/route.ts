import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import s3Client from "@/lib/s3-client";

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schema for document update
const DocumentUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  // Only certain fields can be updated by the user
});

/**
 * GET /api/files/[id]
 * Retrieves a single document's metadata by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate document ID
    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Retrieve document metadata
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        fileType: true,
        fileSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        s3Key: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify ownership (only owner or admin can view)
    if (document.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access to document" },
        { status: 403 }
      );
    }

    // Return document metadata (omitting sensitive fields like s3Key)
    const { s3Key, ...documentData } = document;
    return NextResponse.json(documentData);
  } catch (error) {
    console.error("Error retrieving document:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/files/[id]
 * Updates a document's metadata
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate document ID
    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if document exists and verify ownership
    const existingDocument = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      select: {
        userId: true,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify ownership (only owner or admin can update)
    if (
      existingDocument.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Unauthorized access to document" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = DocumentUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Invalid document data",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Update document in database
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: validatedData.data,
      select: {
        id: true,
        name: true,
        description: true,
        fileType: true,
        fileSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files/[id]
 * Deletes a document by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate document ID
    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if document exists and get S3 key
    const existingDocument = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      select: {
        userId: true,
        s3Key: true,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify ownership (only owner or admin can delete)
    if (
      existingDocument.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Unauthorized access to document" },
        { status: 403 }
      );
    }

    // Delete from S3 if s3Key exists
    if (existingDocument.s3Key) {
      try {
        await s3Client.deleteDocument(existingDocument.s3Key);
      } catch (s3Error) {
        console.error("Error deleting document from S3:", s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete document from database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
