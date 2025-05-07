import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schema for status update
const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "error"]),
  errorMessage: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

/**
 * GET /api/files/[id]/status
 * Retrieves the processing status of a document
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

    // Retrieve document status
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      select: {
        id: true,
        status: true,
        userId: true,
        errorMessage: true,
        progress: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify ownership (only owner or admin can view status)
    if (document.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access to document status" },
        { status: 403 }
      );
    }

    // Return document status information
    return NextResponse.json({
      documentId: document.id,
      status: document.status,
      progress: document.progress || 0,
      errorMessage: document.errorMessage,
      lastUpdated: document.updatedAt,
    });
  } catch (error) {
    console.error("Error retrieving document status:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document status" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/files/[id]/status
 * Updates the processing status of a document
 * (Administrative endpoint, requires admin privileges)
 */
export async function PUT(
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

    // Verify user authentication and admin privileges
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify admin role for status updates
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required to update document status" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = StatusUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Invalid status data",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      select: {
        id: true,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Update document status
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        status: validatedData.data.status,
        errorMessage: validatedData.data.errorMessage,
        progress: validatedData.data.progress,
      },
      select: {
        id: true,
        status: true,
        errorMessage: true,
        progress: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error updating document status:", error);
    return NextResponse.json(
      { error: "Failed to update document status" },
      { status: 500 }
    );
  }
}
