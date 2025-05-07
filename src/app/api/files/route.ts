import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

// Initialize Prisma client
const prisma = new PrismaClient();

// Input validation schema for query parameters
const QuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "fileSize"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "error"]).optional(),
});

/**
 * GET /api/files
 * Retrieves a paginated list of documents for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = QuerySchema.safeParse(queryParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validatedQuery.error.format(),
        },
        { status: 400 }
      );
    }

    const { page, limit, sortBy, sortOrder, search, status } =
      validatedQuery.data;

    // Construct filter based on query parameters
    const filter: any = {
      userId: session.user.id,
    };

    // Add search filter if provided
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Retrieve documents from database with pagination
    const documents = await prisma.document.findMany({
      where: filter,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        fileType: true,
        fileSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Don't include content or other sensitive/large fields
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.document.count({
      where: filter,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Return formatted response
    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files
 * Creates a new document metadata entry (without content)
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

    // Validate request body
    const DocumentSchema = z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      fileType: z.string().min(1).max(50),
      fileSize: z.number().int().positive(),
      s3Key: z.string().optional(),
      status: z
        .enum(["pending", "processing", "completed", "error"])
        .default("pending"),
    });

    const body = await req.json();
    const validatedBody = DocumentSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid document data",
          details: validatedBody.error.format(),
        },
        { status: 400 }
      );
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        ...validatedBody.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
