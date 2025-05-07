import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hybridSearch } from "@/lib/document/indexing/searchOptimizer";
import { getVectorStore } from "@/lib/document/indexing/vectorStore";
import { generateEmbedding } from "@/lib/llm-service";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Search options schema
 */
const SearchOptionsSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).optional().default(10),
  offset: z.number().int().min(0).optional().default(0),
  minScore: z.number().min(0).max(1).optional().default(0.5),
  filter: z.record(z.string(), z.any()).optional(),
  enhanceContext: z.boolean().optional().default(true),
  rerank: z.boolean().optional().default(true),
  keywordWeight: z.number().min(0).max(1).optional().default(0.3),
  semanticWeight: z.number().min(0).max(1).optional().default(0.7),
});

/**
 * GET /api/files/[fileId]/search
 * Search within a document using vector search
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Validate document ID
    const documentId = params.fileId;
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

    // Parse and validate search parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    const limit = Number(searchParams.get("limit") || 10);
    const offset = Number(searchParams.get("offset") || 0);
    const minScore = Number(searchParams.get("minScore") || 0.5);
    const enhanceContext = searchParams.get("enhanceContext") !== "false";
    const rerank = searchParams.get("rerank") !== "false";
    const keywordWeight = Number(searchParams.get("keywordWeight") || 0.3);
    const semanticWeight = Number(searchParams.get("semanticWeight") || 0.7);

    // Validate search query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Retrieve document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        userId: true,
        status: true,
        filename: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify document ownership
    if (document.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to document" },
        { status: 403 }
      );
    }

    // Verify document has been processed
    if (document.status !== "processed" && document.status !== "active") {
      return NextResponse.json(
        {
          error: "Document has not been processed",
          status: document.status,
        },
        { status: 400 }
      );
    }

    // Check if vector store is available
    let useVectorStore = true;
    try {
      const vectorStore = await getVectorStore();
      const isAvailable = await vectorStore.isAvailable();
      useVectorStore = isAvailable;
    } catch (error) {
      console.warn("Vector store not available, using mock search:", error);
      useVectorStore = false;
    }

    if (useVectorStore) {
      try {
        // Perform search using the search optimizer
        console.log(`Performing vector search for query: "${query}"`);

        const searchResults = await hybridSearch(query, {
          filter: { documentId },
          topK: limit,
          enhanceContext,
          rerank,
          keywordWeight,
          semanticWeight,
        });

        // Filter results by minimum score and apply offset
        const filteredResults = searchResults
          .filter((result) => result.score >= minScore)
          .slice(offset, offset + limit);

        // Return search results
        return NextResponse.json({
          query,
          results: filteredResults,
          totalResults: searchResults.length,
          document: {
            id: document.id,
            filename: document.filename,
          },
          searchParams: {
            limit,
            offset,
            minScore,
            enhanceContext,
            rerank,
            keywordWeight,
            semanticWeight,
          },
          mode: "vector",
        });
      } catch (error) {
        console.error("Error during vector search:", error);
        useVectorStore = false; // Fall back to mock search on error
      }
    }

    // Fallback: Return mock search results if vector search is not available
    console.log("Using mock search results");
    const mockSearchResults = [
      {
        id: `${documentId}_chunk_1`,
        text: `This is a sample search result with the query "${query}" highlighted. This would be a real search result from the vector database.`,
        score: 0.95,
        metadata: {
          documentId,
          page: 1,
          section: "Introduction",
        },
        highlightedContent: `This is a sample search result with the query "<mark>${query}</mark>" highlighted. This would be a real search result from the vector database.`,
        precedingContext: "Text that comes before this chunk for context.",
        followingContext: "Text that follows this chunk for context.",
      },
      {
        id: `${documentId}_chunk_2`,
        text: `Another example result containing the search terms for "${query}". In the actual implementation, this would come from the document chunks.`,
        score: 0.85,
        metadata: {
          documentId,
          page: 2,
          section: "Background",
        },
        highlightedContent: `Another example result containing the search terms for "<mark>${query}</mark>". In the actual implementation, this would come from the document chunks.`,
      },
    ];

    // Return mock search results
    return NextResponse.json({
      query,
      results: mockSearchResults,
      totalResults: mockSearchResults.length,
      document: {
        id: document.id,
        filename: document.filename,
      },
      searchParams: {
        limit,
        offset,
        minScore,
        enhanceContext,
        rerank,
        keywordWeight,
        semanticWeight,
      },
      mode: "mock",
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files/[fileId]/search
 * Advanced search with body payload
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Validate document ID
    const documentId = params.fileId;
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

    // Parse and validate request body
    const body = await req.json();
    const parseResult = SearchOptionsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid search options", details: parseResult.error },
        { status: 400 }
      );
    }
    const {
      query,
      limit,
      offset,
      minScore,
      filter,
      enhanceContext,
      rerank,
      keywordWeight,
      semanticWeight,
    } = parseResult.data;

    // Retrieve document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        userId: true,
        status: true,
        filename: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify document ownership
    if (document.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to document" },
        { status: 403 }
      );
    }

    // Verify document has been processed
    if (document.status !== "processed" && document.status !== "active") {
      return NextResponse.json(
        {
          error: "Document has not been processed",
          status: document.status,
        },
        { status: 400 }
      );
    }

    // Check if vector store is available
    let useVectorStore = true;
    try {
      const vectorStore = await getVectorStore();
      const isAvailable = await vectorStore.isAvailable();
      useVectorStore = isAvailable;
    } catch (error) {
      console.warn("Vector store not available, using mock search:", error);
      useVectorStore = false;
    }

    if (useVectorStore) {
      try {
        // Perform search using the search optimizer
        console.log(`Performing vector search for query: "${query}"`);

        const searchResults = await hybridSearch(query, {
          filter: { documentId },
          topK: limit,
          enhanceContext,
          rerank,
          keywordWeight,
          semanticWeight,
        });

        // Filter results by minimum score and apply offset
        const filteredResults = searchResults
          .filter((result) => result.score >= minScore)
          .slice(offset, offset + limit);

        // Return search results
        return NextResponse.json({
          query,
          results: filteredResults,
          totalResults: searchResults.length,
          document: {
            id: document.id,
            filename: document.filename,
          },
          searchParams: {
            limit,
            offset,
            minScore,
            enhanceContext,
            rerank,
            keywordWeight,
            semanticWeight,
          },
          mode: "vector",
        });
      } catch (error) {
        console.error("Error during vector search:", error);
        useVectorStore = false; // Fall back to mock search on error
      }
    }

    // Fallback: Return mock search results if vector search is not available
    console.log("Using mock search results");
    const mockSearchResults = [
      {
        id: `${documentId}_chunk_1`,
        text: `This is a sample search result with the query "${query}" highlighted. This would be a real search result from the vector database.`,
        score: 0.95,
        metadata: {
          documentId,
          page: 1,
          section: "Introduction",
        },
        highlightedContent: `This is a sample search result with the query "<mark>${query}</mark>" highlighted. This would be a real search result from the vector database.`,
        precedingContext: "Text that comes before this chunk for context.",
        followingContext: "Text that follows this chunk for context.",
      },
      {
        id: `${documentId}_chunk_2`,
        text: `Another example result containing the search terms for "${query}". In the actual implementation, this would come from the document chunks.`,
        score: 0.85,
        metadata: {
          documentId,
          page: 2,
          section: "Background",
        },
        highlightedContent: `Another example result containing the search terms for "<mark>${query}</mark>". In the actual implementation, this would come from the document chunks.`,
      },
    ];

    // Return mock search results
    return NextResponse.json({
      query,
      results: mockSearchResults,
      totalResults: mockSearchResults.length,
      document: {
        id: document.id,
        filename: document.filename,
      },
      searchParams: {
        limit,
        offset,
        minScore,
        enhanceContext,
        rerank,
        keywordWeight,
        semanticWeight,
      },
      mode: "mock",
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
