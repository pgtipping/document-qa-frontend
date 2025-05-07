/**
 * Vector Store Interface
 * Defines the contract for vector database implementations
 */

export interface VectorStoreDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  vector?: number[];
}

export interface VectorQueryResult {
  id: string;
  text: string;
  metadata: Record<string, any>;
  score: number;
}

export interface VectorQueryOptions {
  filter?: Record<string, any>;
  includeVector?: boolean;
  includeMetadata?: boolean;
  topK?: number;
  namespace?: string;
}

export interface VectorStoreClient {
  /**
   * Add a document to the vector store
   */
  addDocument(document: VectorStoreDocument): Promise<void>;

  /**
   * Add multiple documents to the vector store in a batch
   */
  addDocuments(documents: VectorStoreDocument[]): Promise<void>;

  /**
   * Query the vector store using a vector
   */
  query(
    queryVector: number[],
    options?: VectorQueryOptions
  ): Promise<VectorQueryResult[]>;

  /**
   * Remove a document from the vector store
   */
  removeDocument(documentId: string): Promise<void>;

  /**
   * Remove documents by filter criteria
   */
  removeDocuments(filter: Record<string, any>): Promise<void>;

  /**
   * Check if the vector store is available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Registry for vector store implementations
 */
class VectorStoreRegistry {
  private implementations: Map<string, () => Promise<VectorStoreClient>> =
    new Map();
  private defaultImplementation: string | null = null;

  /**
   * Register a vector store implementation
   */
  register(
    name: string,
    factory: () => Promise<VectorStoreClient>,
    isDefault: boolean = false
  ): void {
    this.implementations.set(name, factory);
    if (isDefault) {
      this.defaultImplementation = name;
    }
  }

  /**
   * Get a vector store implementation by name
   */
  async get(name?: string): Promise<VectorStoreClient> {
    const implementationName = name || this.defaultImplementation;

    if (!implementationName) {
      throw new Error("No default vector store implementation registered");
    }

    const factory = this.implementations.get(implementationName);
    if (!factory) {
      throw new Error(
        `Vector store implementation '${implementationName}' not found`
      );
    }

    return factory();
  }

  /**
   * Get the list of registered implementations
   */
  getImplementations(): string[] {
    return Array.from(this.implementations.keys());
  }

  /**
   * Check if a specific implementation is registered
   */
  hasImplementation(name: string): boolean {
    return this.implementations.has(name);
  }

  /**
   * Set the default implementation
   */
  setDefaultImplementation(name: string): void {
    if (!this.implementations.has(name)) {
      throw new Error(`Vector store implementation '${name}' not found`);
    }
    this.defaultImplementation = name;
  }
}

// Export singleton registry
export const vectorStoreRegistry = new VectorStoreRegistry();

// Export a convenience function to get the default implementation
export const getVectorStore = async (
  name?: string
): Promise<VectorStoreClient> => {
  return vectorStoreRegistry.get(name);
};
