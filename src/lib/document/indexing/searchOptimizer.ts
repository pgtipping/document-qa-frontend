/**
 * Search Optimizer
 *
 * This module provides utilities for optimizing search queries and results
 * for improved relevance and context.
 */

import {
  VectorQueryOptions,
  VectorQueryResult,
  getVectorStore,
} from "./vectorStore";
import { generateEmbedding } from "@/lib/llm-service";

/**
 * Enhanced search result with additional context
 */
export interface EnhancedSearchResult extends VectorQueryResult {
  /**
   * Preceding context (text before the chunk)
   */
  precedingContext?: string;

  /**
   * Following context (text after the chunk)
   */
  followingContext?: string;

  /**
   * Highlighted text with query matches
   */
  highlightedContent?: string;

  /**
   * Relevance explanation
   */
  relevanceExplanation?: string;
}

/**
 * Search hybrid options
 */
export interface HybridSearchOptions extends VectorQueryOptions {
  /**
   * Weight for keyword search (0-1)
   * Default: 0.3
   */
  keywordWeight?: number;

  /**
   * Weight for semantic search (0-1)
   * Default: 0.7
   */
  semanticWeight?: number;

  /**
   * Whether to rerank results
   * Default: true
   */
  rerank?: boolean;

  /**
   * Whether to enhance results with context
   * Default: true
   */
  enhanceContext?: boolean;

  /**
   * Number of tokens to include for preceding context
   * Default: 100
   */
  precedingContextTokens?: number;

  /**
   * Number of tokens to include for following context
   * Default: 100
   */
  followingContextTokens?: number;
}

/**
 * Optimize a search query for better results
 *
 * @param originalQuery Original user query
 * @returns Optimized query
 */
export function optimizeQuery(originalQuery: string): string {
  // Remove filler words and common non-informative terms
  const fillerWords = [
    "a",
    "an",
    "the",
    "this",
    "that",
    "these",
    "those",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "can",
    "could",
    "shall",
    "should",
    "will",
    "would",
    "may",
    "might",
    "must",
    "and",
    "or",
    "but",
  ];

  // Expand common abbreviations
  const abbreviations: Record<string, string> = {
    vs: "versus",
    etc: "etcetera",
    "e.g": "for example",
    "i.e": "that is",
    fig: "figure",
    app: "application",
    info: "information",
    tech: "technology",
    doc: "document",
    docs: "documents",
  };

  // Process query:
  // 1. Convert to lowercase
  // 2. Expand abbreviations
  // 3. Remove filler words for semantic search
  let optimizedQuery = originalQuery.toLowerCase();

  // Expand abbreviations
  for (const [abbr, expanded] of Object.entries(abbreviations)) {
    optimizedQuery = optimizedQuery.replace(
      new RegExp(`\\b${abbr}\\b`, "g"),
      expanded
    );
  }

  // Remove filler words (only if they're not the entire query)
  const words = optimizedQuery.split(/\s+/);
  if (words.length > 2) {
    const filteredWords = words.filter((word) => !fillerWords.includes(word));

    // Only use filtered version if we didn't remove everything
    if (filteredWords.length > 0) {
      optimizedQuery = filteredWords.join(" ");
    }
  }

  return optimizedQuery;
}

/**
 * Calculate keyword relevance score for text
 *
 * @param text Content to score
 * @param query Search query
 * @returns Score between 0-1
 */
function calculateKeywordScore(text: string, query: string): number {
  if (!text || !query) return 0;

  const keywords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();

  let matchCount = 0;
  for (const keyword of keywords) {
    if (keyword.length < 3) continue; // Skip very short words

    // Calculate number of occurrences
    const matches = textLower.match(new RegExp(`\\b${keyword}\\b`, "g"));
    matchCount += matches ? matches.length : 0;
  }

  // Normalize score (0-1 range)
  // Higher score for more keyword matches, relative to text length
  const textLength = text.length;
  const normalizedScore = Math.min(
    1,
    matchCount / Math.max(1, Math.sqrt(Math.min(textLength, 1000) / 100))
  );

  return normalizedScore;
}

/**
 * Highlight matches in text
 *
 * @param text Text to highlight matches in
 * @param query Query to highlight
 * @returns Highlighted text with HTML tags
 */
function highlightMatches(text: string, query: string): string {
  if (!text || !query) return text;

  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length >= 3);
  let highlighted = text;

  for (const keyword of keywords) {
    // Use a regular expression with lookahead/lookbehind to match word boundaries
    // This prevents matching within words
    const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
    highlighted = highlighted.replace(regex, "<mark>$1</mark>");
  }

  return highlighted;
}

/**
 * Perform a hybrid search combining vector and keyword search
 *
 * @param query Search query
 * @param options Search options
 * @returns Enhanced search results
 */
export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<EnhancedSearchResult[]> {
  // Default options
  const {
    keywordWeight = 0.3,
    semanticWeight = 0.7,
    rerank = true,
    enhanceContext = true,
    precedingContextTokens = 100,
    followingContextTokens = 100,
    topK = 10,
    filter = {},
  } = options;

  // Optimize query
  const optimizedQuery = optimizeQuery(query);
  console.log(`Original query: "${query}"`);
  console.log(`Optimized query: "${optimizedQuery}"`);

  // Generate embedding for semantic search
  const queryEmbedding = await generateEmbedding(optimizedQuery);
  if (!queryEmbedding) {
    throw new Error("Failed to generate embedding for query");
  }

  // Get vector store client
  const vectorStore = await getVectorStore();

  // Perform vector search
  const semanticResults = await vectorStore.query(queryEmbedding, {
    topK: Math.min(topK * 2, 50), // Get more results for reranking
    filter,
  });

  console.log(`Retrieved ${semanticResults.length} semantic results`);

  // Process results with hybrid scoring
  const hybridResults: EnhancedSearchResult[] = semanticResults.map(
    (result) => {
      // Calculate keyword score
      const keywordScore = calculateKeywordScore(result.text, optimizedQuery);

      // Calculate hybrid score (weighted combination)
      const hybridScore =
        result.score * semanticWeight + keywordScore * keywordWeight;

      // Create enhanced result with hybrid score
      const enhancedResult: EnhancedSearchResult = {
        ...result,
        score: hybridScore,
        highlightedContent: highlightMatches(result.text, optimizedQuery),
        relevanceExplanation: `Semantic: ${result.score.toFixed(
          2
        )}, Keyword: ${keywordScore.toFixed(
          2
        )}, Combined: ${hybridScore.toFixed(2)}`,
      };

      return enhancedResult;
    }
  );

  // Rerank results by hybrid score if requested
  let results = hybridResults;
  if (rerank) {
    results = results.sort((a, b) => b.score - a.score);
  }

  // Trim to requested size
  results = results.slice(0, topK);

  // Enhance with context if requested
  if (enhanceContext) {
    try {
      // Get documentIds from results
      const documentIds = Array.from(
        new Set(results.map((result) => result.metadata.documentId))
      );

      // Enhance results with context
      await enhanceResultsWithContext(
        results,
        documentIds,
        precedingContextTokens,
        followingContextTokens
      );
    } catch (error) {
      console.error("Error enhancing results with context:", error);
      // Continue with unenhanced results
    }
  }

  return results;
}

/**
 * Enhance search results with additional context
 *
 * @param results Results to enhance
 * @param documentIds Document IDs to fetch context from
 * @param precedingTokens Number of tokens for preceding context
 * @param followingTokens Number of tokens for following context
 */
async function enhanceResultsWithContext(
  results: EnhancedSearchResult[],
  documentIds: string[],
  precedingTokens: number = 100,
  followingTokens: number = 100
): Promise<void> {
  if (results.length === 0 || documentIds.length === 0) {
    return;
  }

  // For each result, try to enhance with context
  for (const result of results) {
    try {
      // Extract document ID and chunk information from metadata
      const documentId = result.metadata.documentId;
      const chunkIndex = result.metadata.chunkIndex;

      if (!documentId || chunkIndex === undefined) {
        continue;
      }

      // Get adjacent chunks
      const precedingChunkIndex = chunkIndex > 0 ? chunkIndex - 1 : null;
      const followingChunkIndex = chunkIndex + 1;

      // Get the vector store client
      const vectorStore = await getVectorStore();

      // Fetch preceding context if available
      if (precedingChunkIndex !== null) {
        try {
          const precedingResults = await vectorStore.query([0], {
            // Using a dummy vector since we're filtering by exact ID
            filter: {
              documentId,
              chunkIndex: precedingChunkIndex,
            },
            topK: 1,
          });

          if (precedingResults.length > 0) {
            result.precedingContext = precedingResults[0].text;
          }
        } catch (error) {
          console.error(
            `Error fetching preceding context for chunk ${chunkIndex}:`,
            error
          );
        }
      }

      // Fetch following context if available
      try {
        const followingResults = await vectorStore.query([0], {
          // Using a dummy vector since we're filtering by exact ID
          filter: {
            documentId,
            chunkIndex: followingChunkIndex,
          },
          topK: 1,
        });

        if (followingResults.length > 0) {
          result.followingContext = followingResults[0].text;
        }
      } catch (error) {
        console.error(
          `Error fetching following context for chunk ${chunkIndex}:`,
          error
        );
      }
    } catch (error) {
      console.error("Error enhancing result with context:", error);
    }
  }
}
