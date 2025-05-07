import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import s3Client from "@/lib/s3-client";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * GET /api/files/[id]/view
 * Generates a secure presigned URL for viewing a document
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

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const expirationString = searchParams.get("expiresIn");

    // Default expiration to 15 minutes, max 2 hours
    let expiresIn = 15 * 60; // 15 minutes in seconds
    if (expirationString) {
      const parsedExpiration = parseInt(expirationString, 10);
      if (!isNaN(parsedExpiration) && parsedExpiration > 0) {
        expiresIn = Math.min(parsedExpiration, 2 * 60 * 60); // Max 2 hours
      }
    }

    // Retrieve document metadata
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      select: {
        id: true,
        name: true,
        fileType: true,
        s3Key: true,
        userId: true,
        status: true,
        // Only select necessary fields
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify ownership or appropriate access permissions
    if (document.userId !== session.user.id) {
      // Check if document is shared with this user (implement this based on your sharing model)
      const hasAccess = await checkDocumentAccess(documentId, session.user.id);

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Unauthorized access to document" },
          { status: 403 }
        );
      }
    }

    // Ensure document is in a viewable state
    if (document.status !== "completed") {
      return NextResponse.json(
        {
          error: "Document is not ready for viewing",
          status: document.status,
        },
        { status: 400 }
      );
    }

    // Generate presigned URL for viewing
    const presignedUrl = await s3Client.getPresignedDownloadUrl(
      document.s3Key,
      { expiresIn }
    );

    // Return document view information
    return NextResponse.json({
      documentId: document.id,
      name: document.name,
      fileType: document.fileType,
      presignedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error generating document view URL:", error);
    return NextResponse.json(
      { error: "Failed to generate document view URL" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check if a user has access to a document
 * Implement this according to your sharing model
 */
async function checkDocumentAccess(
  documentId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if document is shared with this user
    const sharedDocument = await prisma.documentShare.findFirst({
      where: {
        documentId,
        sharedWithUserId: userId,
        // Add any other conditions based on your sharing model
      },
    });

    return !!sharedDocument;
  } catch (error) {
    console.error("Error checking document access:", error);
    return false;
  }
}
