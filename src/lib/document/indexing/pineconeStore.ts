import {
  VectorStoreClient,
  VectorStoreDocument,
  VectorQueryOptions,
  VectorQueryResult,
  vectorStoreRegistry,
} from "./vectorStore";
import { getPineconeIndex } from "@/lib/pinecone-client";
import { generateEmbedding } from "@/lib/llm-service";

/**
 * Pinecone implementation of the Vector Store interface
 */
export class PineconeVectorStore implements VectorStoreClient {
  // Cache the pinecone index
  private pineconeIndexPromise: ReturnType<typeof getPineconeIndex> | null =
    null;

  /**
   * Get the Pinecone index, creating the promise if needed
   */
  private async getPineconeIndex() {
    if (!this.pineconeIndexPromise) {
      this.pineconeIndexPromise = getPineconeIndex();
    }
    return this.pineconeIndexPromise;
  }

  /**
   * Add a document to the vector store
   */
  async addDocument(document: VectorStoreDocument): Promise<void> {
    try {
      const index = await this.getPineconeIndex();

      // Generate embedding if not provided
      let vector = document.vector;
      if (!vector) {
        const generatedVector = await generateEmbedding(document.text);
        if (!generatedVector) {
          throw new Error("Failed to generate embedding for document");
        }
        vector = generatedVector;
      }

      // Upsert the document into Pinecone
      await index.upsert([
        {
          id: document.id,
          values: vector,
          metadata: {
            ...document.metadata,
            text: document.text, // Store the text in metadata for retrieval
          },
        },
      ]);

      console.log(`Document ${document.id} added to Pinecone`);
    } catch (error) {
      console.error("Error adding document to Pinecone:", error);
      throw new Error(
        `Failed to add document to Pinecone: ${(error as Error).message}`
      );
    }
  }

  /**
   * Add multiple documents to the vector store in a batch
   */
  async addDocuments(documents: VectorStoreDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }

    try {
      const index = await this.getPineconeIndex();

      // Process documents in batches
      const batchSize = 100; // Pinecone recommends batches of 100
      const batches = [];

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        batches.push(batch);
      }

      console.log(
        `Processing ${documents.length} documents in ${batches.length} batches`
      );

      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(
          `Processing batch ${i + 1}/${batches.length} (${
            batch.length
          } documents)`
        );

        // Generate embeddings in parallel for documents that don't have them
        const withEmbeddings = await Promise.all(
          batch.map(async (doc) => {
            if (doc.vector) {
              return doc;
            }

            const generatedVector = await generateEmbedding(doc.text);
            if (!generatedVector) {
              throw new Error(
                `Failed to generate embedding for document ${doc.id}`
              );
            }

            return { ...doc, vector: generatedVector };
          })
        );

        // Format for Pinecone upsert
        const vectors = withEmbeddings.map((doc) => ({
          id: doc.id,
          values: doc.vector!,
          metadata: {
            ...doc.metadata,
            text: doc.text, // Store the text in metadata for retrieval
          },
        }));

        // Upsert batch to Pinecone
        await index.upsert(vectors);
      }

      console.log(
        `Successfully added ${documents.length} documents to Pinecone`
      );
    } catch (error) {
      console.error("Error adding documents to Pinecone:", error);
      throw new Error(
        `Failed to add documents to Pinecone: ${(error as Error).message}`
      );
    }
  }

  /**
   * Query the vector store using a vector
   */
  async query(
    queryVector: number[],
    options?: VectorQueryOptions
  ): Promise<VectorQueryResult[]> {
    try {
      const index = await this.getPineconeIndex();

      // Build the query
      const queryOptions = {
        vector: queryVector,
        topK: options?.topK || 10,
        includeMetadata: true,
        filter: options?.filter,
      };

      // Execute the query
      const results = await index.query(queryOptions);

      // Transform to our result format
      return (results.matches || []).map((match) => ({
        id: match.id,
        text: (match.metadata?.text as string) || "",
        metadata: { ...match.metadata, text: undefined }, // Remove text from metadata
        score: match.score || 0,
      }));
    } catch (error) {
      console.error("Error querying Pinecone:", error);
      throw new Error(`Failed to query Pinecone: ${(error as Error).message}`);
    }
  }

  /**
   * Remove a document from the vector store
   */
  async removeDocument(documentId: string): Promise<void> {
    try {
      const index = await this.getPineconeIndex();
      await index.deleteOne(documentId);
      console.log(`Document ${documentId} removed from Pinecone`);
    } catch (error) {
      console.error("Error removing document from Pinecone:", error);
      throw new Error(
        `Failed to remove document from Pinecone: ${(error as Error).message}`
      );
    }
  }

  /**
   * Remove documents by filter criteria
   */
  async removeDocuments(filter: Record<string, any>): Promise<void> {
    try {
      const index = await this.getPineconeIndex();
      await index.deleteMany({ filter });
      console.log("Documents removed from Pinecone by filter");
    } catch (error) {
      console.error("Error removing documents from Pinecone:", error);
      throw new Error(
        `Failed to remove documents from Pinecone: ${(error as Error).message}`
      );
    }
  }

  /**
   * Check if the vector store is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getPineconeIndex();
      return true;
    } catch (error) {
      console.error("Pinecone is not available:", error);
      return false;
    }
  }
}

// Factory function to create a Pinecone vector store
export const createPineconeVectorStore =
  async (): Promise<VectorStoreClient> => {
    return new PineconeVectorStore();
  };

// Register with the registry
vectorStoreRegistry.register("pinecone", createPineconeVectorStore, true);
