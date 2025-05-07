/**
 * Test imports file
 *
 * This file tests importing types from the document module.
 */

import {
  // From baseExtractor
  DocumentMetadata,
  DocumentSection,

  // From structure
  EnhancedDocumentSection,
  DocumentStructure,
  StructureAnalysisOptions,

  // From entities
  EntityType,
  ConfidenceLevel,
  NamedEntity,
  DocumentTopic,

  // From chunkManager
  DocumentChunk,
  ChunkingOptions,
  ChunkingResult,
  BaseChunker,

  // From chunkers
  SemanticChunker,
  SlidingWindowChunker,
} from "../index";

// Test function to demonstrate that imports work
export function testImports(): void {
  console.log("All imports are functioning correctly!");
}
