/**
 * Base Document Extractor
 *
 * This module defines the base interfaces for document metadata and section extraction.
 * It serves as a foundation for document processing components throughout the application.
 */

/**
 * Metadata extracted from a document
 */
export interface DocumentMetadata {
  /**
   * Document title
   */
  title?: string;

  /**
   * Document author
   */
  author?: string;

  /**
   * Document creation date
   */
  createdDate?: string;

  /**
   * Document creation timestamp
   */
  createdAt?: Date;

  /**
   * Document last modified date
   */
  modifiedDate?: string;

  /**
   * Document summary
   */
  summary?: string;

  /**
   * Document language
   */
  language?: string;

  /**
   * Number of pages (for paginated documents)
   */
  pageCount?: number;

  /**
   * Word count
   */
  wordCount?: number;

  /**
   * Character count
   */
  characterCount?: number;

  /**
   * Document keywords
   */
  keywords?: string[];

  /**
   * Additional metadata fields
   */
  [key: string]: any;
}

/**
 * Section extracted from a document
 */
export interface DocumentSection {
  /**
   * Section title
   */
  title: string;

  /**
   * Section heading level (1-6, where 1 is the highest level)
   */
  level: number;

  /**
   * Character position where this section starts
   */
  startPosition?: number;

  /**
   * Character position where this section ends
   */
  endPosition?: number;

  /**
   * Page number where this section starts (if applicable)
   */
  startPage?: number;

  /**
   * Page number where this section ends (if applicable)
   */
  endPage?: number;

  /**
   * Section content text
   */
  content?: string;

  /**
   * Section identifier
   */
  id?: string;

  /**
   * Parent section identifier (if part of a hierarchy)
   */
  parentId?: string;

  /**
   * Additional metadata for this section
   */
  metadata?: Record<string, any>;
}

/**
 * Base interface for document extractors
 */
export interface BaseExtractor {
  /**
   * Extract metadata from a document
   *
   * @param text Document text
   * @returns Document metadata
   */
  extractMetadata(text: string): Promise<DocumentMetadata>;

  /**
   * Extract sections from a document
   *
   * @param text Document text
   * @returns Array of document sections
   */
  extractSections(text: string): Promise<DocumentSection[]>;
}
