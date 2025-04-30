import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;
// const environment = process.env.PINECONE_ENVIRONMENT; // Pinecone client v3+ doesn't use environment directly in constructor
const indexName = process.env.PINECONE_INDEX_NAME;

if (!apiKey) {
  throw new Error(
    "Missing Pinecone API key environment variable: PINECONE_API_KEY"
  );
}

// if (!environment) {
//   throw new Error("Missing Pinecone environment environment variable: PINECONE_ENVIRONMENT");
// }

if (!indexName) {
  throw new Error(
    "Missing Pinecone index name environment variable: PINECONE_INDEX_NAME"
  );
}

let pineconeClient: Pinecone | null = null;

export const getPineconeClient = async (): Promise<Pinecone> => {
  if (!pineconeClient) {
    try {
      console.log("Initializing Pinecone client...");
      // Pinecone client v3+ uses API key directly, environment is often part of the index host URL or handled internally
      pineconeClient = new Pinecone({
        apiKey: apiKey,
        // The environment is typically inferred or specified when interacting with an index,
        // or part of the index host URL if connecting directly without index listing.
        // For basic operations targeting a specific index, just the API key is needed for the client instance.
      });
      console.log("Pinecone client initialized successfully.");
      // Optional: Add a check here to ensure the index exists and is ready, though this might slow down initialization.
      // Example (requires index name):
      // const indexes = await pineconeClient.listIndexes();
      // if (!indexes.indexes?.some(index => index.name === indexName)) {
      //    throw new Error(`Pinecone index "${indexName}" not found or not ready.`);
      // }
    } catch (error) {
      console.error("Failed to initialize Pinecone client:", error);
      throw new Error("Could not initialize Pinecone client."); // Re-throw for clarity
    }
  }
  return pineconeClient;
};

// Function to get a specific index - this is where the index name is used
export const getPineconeIndex = async () => {
  const client = await getPineconeClient();
  // Type assertion needed as indexName is checked for existence above
  return client.index(indexName!);
};

// Export the index name for potential use elsewhere
export const pineconeIndexName = indexName!;
