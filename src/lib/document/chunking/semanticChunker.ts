/**
 * Semantic Chunking
 *
 * This module implements chunking that respects natural language boundaries
 * and semantic units like paragraphs, sentences, and sections.
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
 * Options specific to semantic chunking
 */
export interface SemanticChunkingOptions extends ChunkingOptions {
  /**
   * Whether to prefer keeping sentences together
   * Default: true
   */
  preferCompleteSentences?: boolean;

  /**
   * Whether to include section headings with chunks
   * Default: true
   */
  includeSectionHeadings?: boolean;

  /**
   * Whether to start new chunks at section boundaries
   * Default: true
   */
  newChunkOnSectionBoundary?: boolean;

  /**
   * Format for adding section headings
   * Default: "## {title}\n\n"
   */
  sectionHeadingFormat?: string;
}

/**
 * A chunker that respects semantic boundaries in text
 */
export class SemanticChunker extends BaseChunker {
  /**
   * Create chunks using a semantic approach
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

    const options = this.options as SemanticChunkingOptions;
    const {
      maxChunkSize = 1000,
      targetChunkSize = 500,
      minChunkSize = 100,
      preferCompleteSentences = true,
      includeSectionHeadings = true,
      newChunkOnSectionBoundary = true,
      sectionHeadingFormat = "## {title}\n\n",
    } = options;

    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    const chunks: DocumentChunk[] = [];
    let currentChunk = "";
    let chunkStartPosition = 0;
    let currentPosition = 0;
    let lastParagraphEndPosition = 0;
    let chunkIndex = 0;
    let currentSection: DocumentSection | undefined = undefined;

    // Find initial section if sections are provided
    if (sections && sections.length > 0) {
      currentSection = sections.find(
        (section) =>
          section.startPosition !== undefined &&
          section.startPosition <= currentPosition
      );
    }

    // Process each paragraph
    for (const paragraph of paragraphs) {
      const paragraphStart = currentPosition;
      const paragraphEnd = paragraphStart + paragraph.length;

      // Check if we're entering a new section
      if (sections && sections.length > 0 && newChunkOnSectionBoundary) {
        const sectionForPosition = sections.find(
          (section) =>
            section.startPosition !== undefined &&
            section.startPosition <= paragraphStart &&
            (section.endPosition === undefined ||
              section.endPosition >= paragraphStart)
        );

        // If we're entering a new section and have content, start a new chunk
        if (
          sectionForPosition &&
          sectionForPosition !== currentSection &&
          currentChunk.length > 0
        ) {
          // Add the current chunk
          chunks.push({
            id: this.generateChunkId(documentId, chunkIndex),
            documentId,
            content: currentChunk,
            index: chunkIndex,
            startPosition: chunkStartPosition,
            endPosition: lastParagraphEndPosition,
            section: currentSection
              ? {
                  title: currentSection.title,
                  level: currentSection.level,
                }
              : undefined,
            metadata: this.extractMetadataForChunk(
              metadata,
              chunkStartPosition,
              lastParagraphEndPosition,
              sections,
              currentSection
            ),
          });

          chunkIndex++;
          currentChunk = "";
          chunkStartPosition = paragraphStart;
        }

        currentSection = sectionForPosition;
      }

      // Add section heading to the chunk if needed
      if (
        includeSectionHeadings &&
        currentSection &&
        currentSection.startPosition === paragraphStart
      ) {
        const sectionHeading = sectionHeadingFormat.replace(
          "{title}",
          currentSection.title
        );
        currentChunk += sectionHeading;
      }

      // Check if adding this paragraph would exceed max chunk size
      if (
        currentChunk.length + paragraph.length + 2 > maxChunkSize &&
        currentChunk.length > 0
      ) {
        // If we're exceeding and current chunk is big enough, create a new chunk
        chunks.push({
          id: this.generateChunkId(documentId, chunkIndex),
          documentId,
          content: currentChunk,
          index: chunkIndex,
          startPosition: chunkStartPosition,
          endPosition: lastParagraphEndPosition,
          section: currentSection
            ? {
                title: currentSection.title,
                level: currentSection.level,
              }
            : undefined,
          metadata: this.extractMetadataForChunk(
            metadata,
            chunkStartPosition,
            lastParagraphEndPosition,
            sections,
            currentSection
          ),
        });

        chunkIndex++;
        currentChunk = "";
        chunkStartPosition = paragraphStart;

        // Add section heading to the new chunk if needed
        if (
          includeSectionHeadings &&
          currentSection &&
          currentChunk.length === 0
        ) {
          const sectionHeading = sectionHeadingFormat.replace(
            "{title}",
            currentSection.title
          );
          currentChunk += sectionHeading;
        }
      } else if (
        currentChunk.length + paragraph.length > targetChunkSize &&
        preferCompleteSentences
      ) {
        // If we're above target size but want to keep sentences together,
        // try to find a good break point within the paragraph

        const sentences = this.splitIntoSentences(paragraph);
        if (sentences.length > 1) {
          let sentenceBreakIndex = 0;
          let currentLength = 0;
          // Find sentence that crosses the target boundary
          while (
            sentenceBreakIndex < sentences.length &&
            currentLength + sentences[sentenceBreakIndex].length <=
              targetChunkSize - currentChunk.length
          ) {
            currentLength += sentences[sentenceBreakIndex].length;
            sentenceBreakIndex++;
          }

          // If we found a good break and the current chunk is big enough
          if (
            sentenceBreakIndex > 0 &&
            currentChunk.length + currentLength >= minChunkSize
          ) {
            // Add sentences up to the break point
            const firstPart = sentences.slice(0, sentenceBreakIndex).join("");
            currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + firstPart;

            // Create a chunk with the content so far
            const breakPosition = paragraphStart + firstPart.length;
            chunks.push({
              id: this.generateChunkId(documentId, chunkIndex),
              documentId,
              content: currentChunk,
              index: chunkIndex,
              startPosition: chunkStartPosition,
              endPosition: breakPosition,
              section: currentSection
                ? {
                    title: currentSection.title,
                    level: currentSection.level,
                  }
                : undefined,
              metadata: this.extractMetadataForChunk(
                metadata,
                chunkStartPosition,
                breakPosition,
                sections,
                currentSection
              ),
            });

            chunkIndex++;
            currentChunk = "";
            chunkStartPosition = breakPosition;

            // Add section heading to the new chunk if needed
            if (
              includeSectionHeadings &&
              currentSection &&
              currentChunk.length === 0
            ) {
              const sectionHeading = sectionHeadingFormat.replace(
                "{title}",
                currentSection.title
              );
              currentChunk += sectionHeading;
            }

            // Add remaining sentences to the next chunk
            const remainingSentences = sentences
              .slice(sentenceBreakIndex)
              .join("");
            if (remainingSentences.length > 0) {
              currentChunk +=
                (currentChunk.length > 0 ? "\n\n" : "") + remainingSentences;
            }
          } else {
            // If we can't find a good sentence break, add the whole paragraph
            currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph;
          }
        } else {
          // If there's only one sentence or we can't split, add the whole paragraph
          currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph;
        }
      } else {
        // Normal case: Add the paragraph to the current chunk
        currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph;
      }

      currentPosition = paragraphEnd + 2; // +2 for the paragraph separator
      lastParagraphEndPosition = paragraphEnd;
    }

    // Add the final chunk if it has content
    if (currentChunk.length > 0) {
      chunks.push({
        id: this.generateChunkId(documentId, chunkIndex),
        documentId,
        content: currentChunk,
        index: chunkIndex,
        startPosition: chunkStartPosition,
        endPosition: lastParagraphEndPosition,
        section: currentSection
          ? {
              title: currentSection.title,
              level: currentSection.level,
            }
          : undefined,
        metadata: this.extractMetadataForChunk(
          metadata,
          chunkStartPosition,
          lastParagraphEndPosition,
          sections,
          currentSection
        ),
      });
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
   * Split text into sentences
   *
   * @param text Text to split
   * @returns Array of sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Basic regex-based sentence splitting
    // This is a simplistic approach; for production use, consider using a NLP library
    const sentenceRegex =
      /([.!?])\s+(?=[A-Z])|([.!?])(?=\s*$)|(\.{3})\s+(?=[A-Z])/g;
    const sentenceBoundaries: number[] = [];
    let match;

    // Find all sentence boundaries
    while ((match = sentenceRegex.exec(text)) !== null) {
      sentenceBoundaries.push(match.index + 1); // Position after the punctuation
    }

    // Add the end of the text as the final boundary
    sentenceBoundaries.push(text.length);

    // Create sentences based on boundaries
    const sentences: string[] = [];
    let startPos = 0;

    for (const endPos of sentenceBoundaries) {
      sentences.push(text.substring(startPos, endPos));
      startPos = endPos;
    }

    return sentences;
  }

  /**
   * Extract metadata for a specific chunk position
   */
  private extractMetadataForChunk(
    documentMetadata?: DocumentMetadata,
    startPosition?: number,
    endPosition?: number,
    sections?: DocumentSection[],
    currentSection?: DocumentSection
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
      if (documentMetadata.createdDate) {
        metadata.documentCreatedDate = documentMetadata.createdDate;
      }
    }

    // Add position information
    if (startPosition !== undefined && endPosition !== undefined) {
      metadata.startPosition = startPosition;
      metadata.endPosition = endPosition;
    }

    // Add section information if available
    if (currentSection) {
      metadata.sectionTitle = currentSection.title;
      metadata.sectionLevel = currentSection.level;
      if (currentSection.startPosition !== undefined) {
        metadata.sectionPosition = currentSection.startPosition;
      }
    } else if (sections && sections.length > 0 && startPosition !== undefined) {
      // Find the most specific section that contains this chunk
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (
          section.startPosition !== undefined &&
          section.startPosition <= startPosition &&
          ("endPosition" in section === false ||
            section.endPosition === undefined ||
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
const semanticChunker = new SemanticChunker();
chunkerRegistry.register("semantic", semanticChunker);
