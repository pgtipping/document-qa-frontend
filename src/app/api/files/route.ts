import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // --- Authentication Check ---
    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log("GET /api/files: Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    // --- End Authentication Check ---

    console.log(`Fetching active documents for user ID: ${userId}`);

    // --- Prisma Integration: Fetch active documents for the user ---
    const documents = await prisma.document.findMany({
      where: {
        userId: userId,
        status: "active", // Only fetch active documents
      },
      select: {
        id: true,
        filename: true,
        createdAt: true,
        s3Key: true, // Include s3Key if needed for deletion or other actions client-side
      },
      orderBy: {
        createdAt: "desc", // Order by creation date, newest first
      },
    });

    console.log(
      `Found ${documents.length} active documents for user ${userId}.`
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("GET /api/files error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error fetching documents";
    return NextResponse.json(
      { error: "Failed to fetch documents", details: errorMessage },
      { status: 500 }
    );
  }
}
