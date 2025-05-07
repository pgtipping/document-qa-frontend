/**
 * Document Entities
 *
 * This module provides functions for extracting named entities and key concepts
 * from document text.
 */

import { DocumentMetadata, DocumentSection } from "../extractors/baseExtractor";

/**
 * Types of entities that can be extracted
 */
export enum EntityType {
  PERSON = "PERSON",
  ORGANIZATION = "ORGANIZATION",
  LOCATION = "LOCATION",
  DATE = "DATE",
  TIME = "TIME",
  MONEY = "MONEY",
  PERCENT = "PERCENT",
  KEY_PHRASE = "KEY_PHRASE",
  TOPIC = "TOPIC",
  QUANTITY = "QUANTITY",
  PRODUCT = "PRODUCT",
  EVENT = "EVENT",
  LAW = "LAW",
  WORK_OF_ART = "WORK_OF_ART",
  LANGUAGE = "LANGUAGE",
  OTHER = "OTHER",
}

/**
 * Entity confidence levels
 */
export enum ConfidenceLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

/**
 * Extracted named entity
 */
export interface NamedEntity {
  /**
   * Entity text as it appears in the document
   */
  text: string;

  /**
   * Normalized/canonical form of the entity
   */
  normalized?: string;

  /**
   * Entity type
   */
  type: EntityType;

  /**
   * Confidence level of this extraction
   */
  confidence: ConfidenceLevel;

  /**
   * Character position where this entity starts
   */
  startPosition: number;

  /**
   * Character position where this entity ends
   */
  endPosition: number;

  /**
   * Section where this entity appears
   */
  section?: {
    /**
     * Section title
     */
    title: string;

    /**
     * Section level
     */
    level: number;
  };

  /**
   * Page number where this entity appears (if applicable)
   */
  page?: number;

  /**
   * Number of mentions of this entity in the document
   */
  mentions?: number;

  /**
   * Relevance score (0-1)
   */
  relevance?: number;

  /**
   * Additional metadata specific to this entity type
   */
  metadata?: Record<string, any>;
}

/**
 * Document topic or category
 */
export interface DocumentTopic {
  /**
   * Topic name
   */
  name: string;

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Relevance score (0-1)
   */
  relevance: number;

  /**
   * Related terms/keywords
   */
  relatedTerms?: string[];
}

/**
 * Entity extraction result
 */
export interface EntityExtractionResult {
  /**
   * Named entities found in the document
   */
  entities: NamedEntity[];

  /**
   * Key phrases extracted from the document
   */
  keyPhrases: NamedEntity[];

  /**
   * Document topics/categories
   */
  topics: DocumentTopic[];

  /**
   * Frequency map of entities by type
   */
  entityFrequency: Record<EntityType, number>;
}

/**
 * Extract entities from document text
 *
 * @param text Document text
 * @param metadata Document metadata
 * @param sections Document sections (if available)
 * @returns Entity extraction result
 */
export async function extractEntities(
  text: string,
  metadata?: DocumentMetadata,
  sections?: DocumentSection[]
): Promise<EntityExtractionResult> {
  // This is a placeholder implementation
  // In a real implementation, we would use an NLP library or API

  // Initialize result
  const result: EntityExtractionResult = {
    entities: [],
    keyPhrases: [],
    topics: [],
    entityFrequency: {} as Record<EntityType, number>,
  };

  // Initialize entity frequency counters
  Object.values(EntityType).forEach((type) => {
    result.entityFrequency[type] = 0;
  });

  // Detect any entities matching simple patterns for demonstration purposes
  // Note: This is not a production-quality implementation

  // Simple person detection (names with titles)
  const personRegex =
    /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s([A-Z][a-z]+(\s[A-Z][a-z]+)?)\b/g;
  let match: RegExpExecArray | null;
  while ((match = personRegex.exec(text)) !== null) {
    const entity: NamedEntity = {
      text: match[0],
      normalized: match[2],
      type: EntityType.PERSON,
      confidence: ConfidenceLevel.MEDIUM,
      startPosition: match.index,
      endPosition: match.index + match[0].length,
    };

    result.entities.push(entity);
    result.entityFrequency[EntityType.PERSON]++;
  }

  // Simple date detection
  const dateRegex =
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?,\s+\d{4}\b/g;
  while ((match = dateRegex.exec(text)) !== null) {
    const entity: NamedEntity = {
      text: match[0],
      type: EntityType.DATE,
      confidence: ConfidenceLevel.HIGH,
      startPosition: match.index,
      endPosition: match.index + match[0].length,
    };

    result.entities.push(entity);
    result.entityFrequency[EntityType.DATE]++;
  }

  // Simple organization detection (capitalized words followed by Inc, LLC, Corp, etc.)
  const orgRegex =
    /\b([A-Z][a-z]*(\s[A-Z][a-z]*)+)\s+(Inc\.?|LLC|Corp\.?|Corporation|Company|Co\.?|Ltd\.?)\b/g;
  while ((match = orgRegex.exec(text)) !== null) {
    const entity: NamedEntity = {
      text: match[0],
      normalized: match[0].replace(
        /\s+(Inc\.?|LLC|Corp\.?|Corporation|Company|Co\.?|Ltd\.?)$/i,
        ""
      ),
      type: EntityType.ORGANIZATION,
      confidence: ConfidenceLevel.MEDIUM,
      startPosition: match.index,
      endPosition: match.index + match[0].length,
    };

    result.entities.push(entity);
    result.entityFrequency[EntityType.ORGANIZATION]++;
  }

  // Extract key phrases (for demo purposes, just take capitalized phrases)
  const keyPhraseRegex =
    /\b([A-Z][a-z]+(\s[A-Z][a-z]+){1,5})\b(?!\s+(Inc\.?|LLC|Corp\.?|Corporation|Company|Co\.?|Ltd\.?))/g;
  while ((match = keyPhraseRegex.exec(text)) !== null) {
    // Skip if it's already detected as another entity type
    const isAlreadyEntity = result.entities.some(
      (e) =>
        match !== null &&
        e.startPosition === match.index &&
        e.endPosition === match.index + match[0].length
    );

    if (!isAlreadyEntity && match !== null) {
      const keyPhrase: NamedEntity = {
        text: match[0],
        type: EntityType.KEY_PHRASE,
        confidence: ConfidenceLevel.LOW,
        startPosition: match.index,
        endPosition: match.index + match[0].length,
        relevance: 0.5, // Default relevance
      };

      result.keyPhrases.push(keyPhrase);
      result.entityFrequency[EntityType.KEY_PHRASE]++;
    }
  }

  // Add document sections as topics if available
  if (sections && sections.length > 0) {
    // Convert top-level sections to topics
    const topicSet = new Set<string>();

    sections.forEach((section) => {
      if (section.level <= 2 && section.title && !topicSet.has(section.title)) {
        topicSet.add(section.title);

        result.topics.push({
          name: section.title,
          confidence: 0.8,
          relevance: 0.9,
        });
      }
    });
  }

  // If no topics were extracted from sections, generate some based on key phrases
  if (result.topics.length === 0 && result.keyPhrases.length > 0) {
    // Group key phrases by frequency and relevance
    const topicCandidates = new Map<string, number>();

    result.keyPhrases.forEach((kp) => {
      const count = topicCandidates.get(kp.text) || 0;
      topicCandidates.set(kp.text, count + 1);
    });

    // Convert top candidates to topics
    Array.from(topicCandidates.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([name, count]) => {
        result.topics.push({
          name,
          confidence: Math.min(0.5 + count * 0.1, 0.9),
          relevance: 0.7,
        });
      });
  }

  return result;
}

/**
 * Find all mentions of a specific entity in text
 *
 * @param text Document text
 * @param entity Entity to search for
 * @returns Array of start positions for each mention
 */
export function findEntityMentions(
  text: string,
  entity: NamedEntity
): number[] {
  const mentions: number[] = [];
  const searchText = entity.text;
  const regex = new RegExp(`\\b${escapeRegExp(searchText)}\\b`, "gi");

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match.index);
  }

  return mentions;
}

/**
 * Escape special characters for use in a regular expression
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get the surrounding context for an entity
 *
 * @param text Document text
 * @param entity Entity to get context for
 * @param contextWindow Number of characters to include before and after
 * @returns Context string
 */
export function getEntityContext(
  text: string,
  entity: NamedEntity,
  contextWindow: number = 100
): string {
  const start = Math.max(0, entity.startPosition - contextWindow);
  const end = Math.min(text.length, entity.endPosition + contextWindow);

  return text.substring(start, end);
}
