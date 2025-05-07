/**
 * Sliding Window Chunking
 *
 * This module implements a simple sliding window chunking strategy,
 * which creates overlapping chunks of a fixed size.
 */

import {
  BaseChunker,
  ChunkingOptions,
  ChunkingResult,
  DocumentChunk,
  chunkerRegistry,
} from "./chunkManager";
import { DocumentMetadata, DocumentSection } from "../extractors/baseExtractor";

/**
 * A chunker that implements a sliding window strategy with configurable overlap
 */
export class SlidingWindowChunker extends BaseChunker {
  /**
   * Create chunks using a sliding window approach
   *
   * @param documentId ID of the document being chunked
   * @param text Full text content to chunk
   * @param metadata Document metadata
   * @param sections Document sections (if available)
   * @returns Chunking result
   */
  async createChunks(
    documentId: string,
    text: string,
    metadata?: DocumentMetadata,
    sections?: DocumentSection[]
  ): Promise<ChunkingResult> {
    if (!text || text.trim().length === 0) {
      return {
        chunks: [],
        totalCharacters: 0,
        chunkCount: 0,
        averageChunkSize: 0,
      };
    }

    const {
      maxChunkSize = 1000,
      chunkOverlap = 200,
      respectParagraphBoundaries = true,
    } = this.options;

    // Split text into paragraphs if respecting paragraph boundaries
    const paragraphs = respectParagraphBoundaries
      ? text.split(/\n\s*\n/)
      : [text];

    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    let position = 0;

    // Process each paragraph (or the entire text if not respecting paragraphs)
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) {
        position += paragraph.length + 2; // +2 for the paragraph separator
        continue;
      }

      // If the paragraph is smaller than max chunk size, add it as a chunk
      if (paragraph.length <= maxChunkSize) {
        const chunk: DocumentChunk = {
          id: this.generateChunkId(documentId, chunkIndex),
          documentId,
          content: paragraph,
          index: chunkIndex,
          startPosition: position,
          endPosition: position + paragraph.length,
          metadata: this.extractMetadataForChunk(
            metadata,
            position,
            position + paragraph.length,
            sections
          ),
        };

        chunks.push(chunk);
        chunkIndex++;
        position += paragraph.length + 2; // +2 for the paragraph separator
        continue;
      }

      // For larger paragraphs, apply sliding window
      let start = 0;
      while (start < paragraph.length) {
        const end = Math.min(start + maxChunkSize, paragraph.length);
        const chunkContent = paragraph.substring(start, end);

        const chunk: DocumentChunk = {
          id: this.generateChunkId(documentId, chunkIndex),
          documentId,
          content: chunkContent,
          index: chunkIndex,
          startPosition: position + start,
          endPosition: position + end,
          metadata: this.extractMetadataForChunk(
            metadata,
            position + start,
            position + end,
            sections
          ),
        };

        chunks.push(chunk);
        chunkIndex++;

        // Move the window, with overlap
        start += maxChunkSize - chunkOverlap;
        if (
          start < paragraph.length &&
          start + maxChunkSize > paragraph.length
        ) {
          // Avoid small trailing chunks by ensuring a minimum size
          const remainingLength = paragraph.length - start;
          if (remainingLength < maxChunkSize / 3) {
            // If remaining content is less than 1/3 of max size,
            // extend the previous chunk instead of creating a small one
            break;
          }
        }
      }

      position += paragraph.length + 2; // +2 for the paragraph separator
    }

    // Calculate statistics
    const totalCharacters = text.length;
    const chunkCount = chunks.length;
    const averageChunkSize = chunkCount > 0 ? totalCharacters / chunkCount : 0;

    return {
      chunks,
      totalCharacters,
      chunkCount,
      averageChunkSize,
    };
  }

  /**
   * Extract metadata for a specific chunk position
   */
  private extractMetadataForChunk(
    documentMetadata?: DocumentMetadata,
    startPosition?: number,
    endPosition?: number,
    sections?: DocumentSection[]
  ): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Add basic document metadata
    if (documentMetadata) {
      if (documentMetadata.title) {
        metadata.documentTitle = documentMetadata.title;
      }
      if (documentMetadata.author) {
        metadata.documentAuthor = documentMetadata.author;
      }
      if (documentMetadata.createdAt) {
        metadata.documentCreatedAt = documentMetadata.createdAt;
      }
    }

    // Add position information
    if (startPosition !== undefined && endPosition !== undefined) {
      metadata.startPosition = startPosition;
      metadata.endPosition = endPosition;
    }

    // Add section information if available
    if (sections && sections.length > 0 && startPosition !== undefined) {
      // Find the most specific section that contains this chunk
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (
          section.startPosition !== undefined &&
          section.startPosition <= startPosition &&
          (section.endPosition === undefined ||
            section.endPosition >= startPosition)
        ) {
          metadata.sectionTitle = section.title;
          metadata.sectionLevel = section.level;
          metadata.sectionPosition = section.startPosition;
          break;
        }
      }
    }

    return metadata;
  }
}

// Create and register the default instance
const slidingWindowChunker = new SlidingWindowChunker();
chunkerRegistry.register("slidingWindow", slidingWindowChunker, true);
