/**
 * Document Chunk Manager
 *
 * This module provides functionality for breaking documents into manageable chunks
 * for more efficient processing, embedding, and retrieval.
 */

import { DocumentMetadata, DocumentSection } from "../extractors/baseExtractor";

/**
 * Represents a document chunk with content and metadata
 */
export interface DocumentChunk {
  /**
   * Unique identifier for the chunk
   */
  id: string;

  /**
   * The document ID this chunk belongs to
   */
  documentId: string;

  /**
   * The actual text content of the chunk
   */
  content: string;

  /**
   * 0-based index of this chunk in the document's chunk sequence
   */
  index: number;

  /**
   * Character position where this chunk starts in the original document
   */
  startPosition: number;

  /**
   * Character position where this chunk ends in the original document
   */
  endPosition: number;

  /**
   * Page number where this chunk starts (if applicable)
   */
  startPage?: number;

  /**
   * Page number where this chunk ends (if applicable)
   */
  endPage?: number;

  /**
   * Section information where this chunk belongs
   */
  section?: {
    title: string;
    level: number;
  };

  /**
   * Additional metadata for this chunk
   */
  metadata?: Record<string, any>;

  /**
   * Optional vector embedding of this chunk for semantic search
   */
  embedding?: number[];
}

/**
 * Configuration options for the chunking process
 */
export interface ChunkingOptions {
  /**
   * Maximum chunk size in characters
   * Default: 1000
   */
  maxChunkSize?: number;

  /**
   * Target chunk size in characters
   * Default: 500
   */
  targetChunkSize?: number;

  /**
   * Minimum chunk size in characters
   * Default: 100
   */
  minChunkSize?: number;

  /**
   * Number of characters to overlap between chunks
   * Default: 50
   */
  chunkOverlap?: number;

  /**
   * Whether to respect sentence boundaries when chunking
   * Default: true
   */
  respectSentenceBoundaries?: boolean;

  /**
   * Whether to respect paragraph boundaries when chunking
   * Default: true
   */
  respectParagraphBoundaries?: boolean;

  /**
   * Whether to respect section boundaries when chunking
   * Default: true
   */
  respectSectionBoundaries?: boolean;

  /**
   * Whether to include section titles in chunks
   * Default: true
   */
  includeSectionTitles?: boolean;

  /**
   * Custom separator to use between sections in a chunk
   * Default: "\n\n"
   */
  sectionSeparator?: string;
}

/**
 * Result of the document chunking process
 */
export interface ChunkingResult {
  /**
   * Array of document chunks
   */
  chunks: DocumentChunk[];

  /**
   * Total number of characters processed
   */
  totalCharacters: number;

  /**
   * Number of chunks created
   */
  chunkCount: number;

  /**
   * Average chunk size in characters
   */
  averageChunkSize: number;
}

/**
 * Default chunking options
 */
export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  maxChunkSize: 1000,
  targetChunkSize: 500,
  minChunkSize: 100,
  chunkOverlap: 50,
  respectSentenceBoundaries: true,
  respectParagraphBoundaries: true,
  respectSectionBoundaries: true,
  includeSectionTitles: true,
  sectionSeparator: "\n\n",
};

/**
 * Base class for document chunking
 */
export abstract class BaseChunker {
  protected options: ChunkingOptions;

  constructor(options?: Partial<ChunkingOptions>) {
    this.options = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
  }

  /**
   * Create chunks from document text and metadata
   *
   * @param documentId ID of the document being chunked
   * @param text Full text of the document
   * @param metadata Document metadata
   * @param sections Document sections (if available)
   * @returns Chunking result with document chunks
   */
  abstract createChunks(
    documentId: string,
    text: string,
    metadata?: DocumentMetadata,
    sections?: DocumentSection[]
  ): Promise<ChunkingResult>;

  /**
   * Generate a unique ID for a chunk
   */
  protected generateChunkId(documentId: string, index: number): string {
    return `${documentId}_chunk_${index}`;
  }
}

/**
 * Registry for document chunkers
 */
class ChunkerRegistry {
  private chunkers: Map<string, BaseChunker> = new Map();
  private defaultChunker: string | null = null;

  /**
   * Register a chunker
   *
   * @param name Name of the chunker
   * @param chunker Chunker implementation
   * @param setAsDefault Whether to set this as the default chunker
   */
  register(name: string, chunker: BaseChunker, setAsDefault = false): void {
    this.chunkers.set(name, chunker);

    if (setAsDefault || this.defaultChunker === null) {
      this.defaultChunker = name;
    }
  }

  /**
   * Get a chunker by name
   *
   * @param name Name of the chunker to get
   * @returns The requested chunker or the default chunker if name is not provided
   */
  getChunker(name?: string): BaseChunker {
    if (name && this.chunkers.has(name)) {
      return this.chunkers.get(name)!;
    }

    if (!this.defaultChunker || !this.chunkers.has(this.defaultChunker)) {
      throw new Error("No default chunker available");
    }

    return this.chunkers.get(this.defaultChunker)!;
  }

  /**
   * Get the names of all registered chunkers
   */
  getChunkerNames(): string[] {
    return Array.from(this.chunkers.keys());
  }

  /**
   * Set the default chunker
   */
  setDefaultChunker(name: string): void {
    if (!this.chunkers.has(name)) {
      throw new Error(`Chunker '${name}' not found`);
    }

    this.defaultChunker = name;
  }
}

// Export a singleton registry instance
export const chunkerRegistry = new ChunkerRegistry();
