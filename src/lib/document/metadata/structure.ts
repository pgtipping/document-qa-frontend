/**
 * Document Structure Analysis
 *
 * This module provides functions for analyzing the structure of documents,
 * including sections, headings, and table of contents.
 */

import { DocumentMetadata, DocumentSection } from "../extractors/baseExtractor";

/**
 * Enhanced section with additional metadata
 */
export interface EnhancedDocumentSection {
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
  startPosition: number;

  /**
   * Character position where this section ends (if known)
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

  /**
   * Child sections within this section
   */
  children?: EnhancedDocumentSection[];
}

/**
 * Document structure analysis result
 */
export interface DocumentStructure {
  /**
   * Array of all sections in the document
   */
  sections: EnhancedDocumentSection[];

  /**
   * Hierarchical table of contents
   */
  tableOfContents: EnhancedDocumentSection[];

  /**
   * Number of headings found
   */
  headingCount: number;

  /**
   * Maximum heading level found (1-6)
   */
  maxHeadingLevel: number;

  /**
   * Document title extracted from content
   */
  title?: string;
}

/**
 * Options for structure analysis
 */
export interface StructureAnalysisOptions {
  /**
   * Whether to detect headings using markdown-style patterns
   * Default: true
   */
  detectMarkdownHeadings?: boolean;

  /**
   * Whether to detect headings using typography patterns (size, formatting)
   * Default: true
   */
  detectTypographicalHeadings?: boolean;

  /**
   * Whether to detect sections using numbering patterns (1.1, 1.2, etc.)
   * Default: true
   */
  detectNumberedSections?: boolean;

  /**
   * Minimum number of lines for a section to be considered valid
   * Default: 2
   */
  minSectionLines?: number;

  /**
   * Whether to build a hierarchical table of contents
   * Default: true
   */
  buildTableOfContents?: boolean;

  /**
   * Maximum length of heading to include in table of contents
   * Default: 200
   */
  maxHeadingLength?: number;
}

/**
 * Default structure analysis options
 */
export const DEFAULT_STRUCTURE_ANALYSIS_OPTIONS: StructureAnalysisOptions = {
  detectMarkdownHeadings: true,
  detectTypographicalHeadings: true,
  detectNumberedSections: true,
  minSectionLines: 2,
  buildTableOfContents: true,
  maxHeadingLength: 200,
};

/**
 * Analyze the structure of a document
 *
 * @param text The document text content
 * @param metadata Existing document metadata
 * @param options Analysis options
 * @returns Document structure analysis
 */
export async function analyzeDocumentStructure(
  text: string,
  metadata?: DocumentMetadata,
  options?: Partial<StructureAnalysisOptions>
): Promise<DocumentStructure> {
  const mergedOptions = {
    ...DEFAULT_STRUCTURE_ANALYSIS_OPTIONS,
    ...options,
  };

  // Initialize result
  const result: DocumentStructure = {
    sections: [],
    tableOfContents: [],
    headingCount: 0,
    maxHeadingLevel: 0,
  };

  // Extract title from metadata or try to detect from content
  if (metadata?.title) {
    result.title = metadata.title;
  } else {
    result.title = extractDocumentTitle(text);
  }

  // Split into lines for line-by-line analysis
  const lines = text.split("\n");

  // Main section detection
  let currentPosition = 0;
  const sections: EnhancedDocumentSection[] = [];

  // Track current section at each level (0 = document, 1 = h1, 2 = h2, etc.)
  const sectionStack: EnhancedDocumentSection[] = [
    {
      title: result.title || "Document",
      level: 0,
      startPosition: 0,
    } as EnhancedDocumentSection,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length;

    // Detect headings
    const heading = detectHeading(
      line,
      mergedOptions.detectMarkdownHeadings,
      mergedOptions.detectTypographicalHeadings,
      mergedOptions.detectNumberedSections
    );

    if (heading) {
      // Track statistics
      result.headingCount++;
      result.maxHeadingLevel = Math.max(result.maxHeadingLevel, heading.level);

      // Adjust heading length if needed
      if (
        heading.title.length > mergedOptions.maxHeadingLength! &&
        mergedOptions.maxHeadingLength! > 0
      ) {
        heading.title =
          heading.title.substring(0, mergedOptions.maxHeadingLength!) + "...";
      }

      // Create section from heading
      const section: EnhancedDocumentSection = {
        title: heading.title,
        level: heading.level,
        startPosition: currentPosition,
      } as EnhancedDocumentSection;

      // Add to flat sections list
      sections.push(section);

      // Handle section hierarchy
      // Close any sections that are at the same or higher level
      while (
        sectionStack.length > 1 &&
        sectionStack[sectionStack.length - 1].level >= heading.level
      ) {
        const closedSection = sectionStack.pop()!;
        closedSection.endPosition = currentPosition;

        // Add as child to parent
        const parent = sectionStack[sectionStack.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(closedSection);
      }

      // Add current section to stack
      sectionStack.push(section);
    }

    // Advance position
    currentPosition += lineLength + 1; // +1 for the newline
  }

  // Close any remaining open sections
  while (sectionStack.length > 1) {
    const closedSection = sectionStack.pop()!;
    closedSection.endPosition = currentPosition;

    // Add as child to parent
    const parent = sectionStack[sectionStack.length - 1];
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(closedSection);
  }

  // Handle root section (the document itself)
  const rootSection = sectionStack[0];
  rootSection.endPosition = currentPosition;

  // Build the result
  result.sections = sections;

  // Build table of contents if requested
  if (mergedOptions.buildTableOfContents) {
    result.tableOfContents = rootSection.children || [];
  }

  return result;
}

/**
 * Extract a document title from content
 *
 * @param text Document text
 * @returns Extracted title or undefined
 */
function extractDocumentTitle(text: string): string | undefined {
  // Simple heuristic: look for the first heading or first non-empty line
  const lines = text.split("\n");

  // Try to find the first heading
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    // Check for Markdown headings
    if (line.startsWith("# ")) {
      return line.substring(2).trim();
    }

    // Check for underlined headings
    if (
      i < lines.length - 1 &&
      lines[i + 1].trim().match(/^[=]+$/) &&
      line.length > 0
    ) {
      return line;
    }
  }

  // Fallback: first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      // Limit length for reasonable title
      return trimmed.length > 100 ? trimmed.substring(0, 100) + "..." : trimmed;
    }
  }

  return undefined;
}

/**
 * Detect a heading from a line of text
 *
 * @param line Text line to analyze
 * @param detectMarkdown Whether to detect Markdown-style headings
 * @param detectTypographical Whether to detect typographical headings
 * @param detectNumbered Whether to detect numbered sections
 * @returns Heading information or null
 */
function detectHeading(
  line: string,
  detectMarkdown: boolean = true,
  detectTypographical: boolean = true,
  detectNumbered: boolean = true
): { title: string; level: number } | null {
  const trimmed = line.trim();
  if (trimmed.length === 0) return null;

  // Markdown style: # Heading
  if (detectMarkdown) {
    const markdownMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (markdownMatch) {
      return {
        title: markdownMatch[2].trim(),
        level: markdownMatch[1].length,
      };
    }
  }

  // Numbered section: 1.2.3 Title
  if (detectNumbered) {
    const numberedMatch = trimmed.match(/^(\d+\.)+\s+(.+)$/);
    if (numberedMatch) {
      const numberPart = numberedMatch[0].substr(
        0,
        numberedMatch[0].length - numberedMatch[2].length
      );
      const level = numberPart.split(".").filter(Boolean).length;

      return {
        title: trimmed, // Keep the numbers as part of the title
        level: Math.min(level, 6), // Cap at 6 levels
      };
    }
  }

  // Typographical characteristics (all caps, etc.)
  if (detectTypographical && trimmed.length <= 200) {
    // All uppercase and reasonable length might be a heading
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length >= 3 &&
      trimmed.length <= 100
    ) {
      return {
        title: trimmed,
        level: 2, // Assume level 2 for these
      };
    }
  }

  return null;
}

/**
 * Build a hierarchical table of contents from flat sections
 *
 * @param sections Array of document sections
 * @returns Hierarchical table of contents
 */
export function buildTableOfContents(
  sections: EnhancedDocumentSection[]
): EnhancedDocumentSection[] {
  if (!sections || sections.length === 0) {
    return [];
  }

  const toc: EnhancedDocumentSection[] = [];
  const sectionStack: EnhancedDocumentSection[] = [];

  for (const section of sections) {
    // Create a shallow copy for the TOC
    const tocSection: EnhancedDocumentSection = { ...section, children: [] };

    // Handle section hierarchy
    while (
      sectionStack.length > 0 &&
      sectionStack[sectionStack.length - 1].level >= section.level
    ) {
      sectionStack.pop();
    }

    if (sectionStack.length === 0) {
      // Top-level section
      toc.push(tocSection);
    } else {
      // Child section
      const parent = sectionStack[sectionStack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(tocSection);
    }

    sectionStack.push(tocSection);
  }

  return toc;
}
