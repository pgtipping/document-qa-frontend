// src/lib/llm-service.ts
import OpenAI from "openai";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel, // Import the specific type
} from "@google/generative-ai";
import Groq from "groq-sdk";
import { encoding_for_model } from "tiktoken"; // For token counting

// --- Configuration ---

// TODO: Consider making this configurable
const TOKEN_ENCODING_MODEL = "gpt-4o"; // Use encoding for a common, recent model
const MAX_CONTEXT_TOKENS = 120000; // As per overhaul_plan.md

// Initialize tiktoken encoding
let encoding: ReturnType<typeof encoding_for_model> | null = null;
try {
  encoding = encoding_for_model(TOKEN_ENCODING_MODEL);
  console.log(`Tiktoken encoding (${TOKEN_ENCODING_MODEL}) initialized.`);
} catch (error) {
  console.error("Failed to initialize tiktoken encoding:", error);
  // Handle the error appropriately - maybe fallback to character count?
}

// Fallback order and models as defined in overhaul_plan.md
const fallbackProviders = [
  {
    name: "openrouter",
    model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free", // Corrected to a valid model ID
    apiKey: process.env.OPENROUTER_API_KEY,
    client: null as OpenAI | null, // Client will be initialized if API key exists
    init: function () {
      if (this.apiKey) {
        this.client = new OpenAI({
          apiKey: this.apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        });
        console.log("OpenRouter client initialized.");
        return true;
      }
      console.log("OpenRouter API key not found, client not initialized.");
      return false;
    },
    call: async function (prompt: string): Promise<string | null> {
      if (!this.client) return null;
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        // Add other parameters like temperature, max_tokens if needed
      });
      return response.choices[0]?.message?.content;
    },
  },
  {
    name: "google",
    model: "gemini-2.5-flash-preview-04-17", // Model from overhaul_plan.md
    apiKey: process.env.GEMINI_API_KEY, // Assuming GEMINI_API_KEY for Gemini
    client: null as GoogleGenerativeAI | null,
    genModel: null as GenerativeModel | null, // Use the specific type
    init: function () {
      if (this.apiKey) {
        this.client = new GoogleGenerativeAI(this.apiKey);
        // Initialize model with safety settings
        this.genModel = this.client.getGenerativeModel({
          model: this.model,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
          // Add generationConfig here if needed (e.g., temperature, maxOutputTokens)
        });
        console.log("Google Gemini client initialized with safety settings.");
        return true;
      }
      console.log("Google API key not found, client not initialized.");
      return false;
    },
    call: async function (prompt: string): Promise<string | null> {
      if (!this.genModel) return null;
      // Pass only the prompt, safety settings are now part of the model instance
      const result = await this.genModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    },
  },
  {
    name: "groq",
    model: "meta-llama/llama-4-scout-17b-16e-instruct", // Model from overhaul_plan.md
    apiKey: process.env.GROQ_API_KEY,
    client: null as Groq | null,
    init: function () {
      if (this.apiKey) {
        this.client = new Groq({ apiKey: this.apiKey });
        console.log("Groq client initialized.");
        return true;
      }
      console.log("Groq API key not found, client not initialized.");
      return false;
    },
    call: async function (prompt: string): Promise<string | null> {
      if (!this.client) return null;
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        // Add other parameters like temperature, max_tokens if needed
      });
      return response.choices[0]?.message?.content;
    },
  },
];

// Initialize clients for available providers
const availableProviders = fallbackProviders.filter((provider) =>
  provider.init()
);

if (availableProviders.length === 0) {
  console.error(
    "FATAL: No LLM providers could be initialized. Check API keys."
  );
  // Depending on application requirements, you might throw an error here
  // or allow the app to run in a degraded state.
} else {
  console.log(
    `Initialized LLM providers: ${availableProviders
      .map((p) => p.name)
      .join(", ")}`
  );
}

// --- Core Function ---

/**
 * Gets a completion from an LLM, trying providers in the fallback order.
 * @param prompt The prompt to send to the LLM.
 * @returns The LLM completion string or null if all providers fail.
 */
export async function getCompletion(prompt: string): Promise<string | null> {
  if (availableProviders.length === 0) {
    console.error("No LLM providers available to get completion.");
    return null;
  }

  for (const provider of availableProviders) {
    console.log(
      `Attempting completion with ${provider.name} (${provider.model})...`
    );
    try {
      const startTime = Date.now();
      const result = await provider.call(prompt);
      const duration = Date.now() - startTime;

      if (result) {
        console.log(
          `Completion successful with ${provider.name} in ${duration}ms.`
        );
        // TODO: Add performance logging here if needed
        return result;
      } else {
        console.warn(
          `Provider ${provider.name} returned null or empty result.`
        );
      }
    } catch (error) {
      console.error(
        `Error calling ${provider.name}:`,
        error instanceof Error ? error.message : error
      );
      // Log more details for debugging if necessary
      // console.error(error);
    }
    console.log(`Falling back from ${provider.name}...`);
  }

  console.error("All LLM providers failed to return a completion.");
  return null;
}

// --- Helper Functions (Placeholder - to be implemented based on Python logic) ---

// --- Helper Functions ---

/**
 * Splits text into overlapping chunks based on character count.
 * @param text The text to split.
 * @param maxChunkSizeChars Target maximum size of each chunk in characters.
 * @param overlapChars Number of characters to overlap between chunks.
 * @returns An array of text chunks.
 */
export function splitIntoChunks(
  text: string,
  maxChunkSizeChars: number = 1500, // Target size in characters
  overlapChars: number = 200 // Overlap characters between chunks
): string[] {
  if (maxChunkSizeChars <= overlapChars) {
    throw new Error("maxChunkSizeChars must be greater than overlapChars");
  }
  if (!text) {
    return [];
  }
  console.log(
    `Splitting text (${text.length} chars) into chunks (max: ${maxChunkSizeChars}, overlap: ${overlapChars})...`
  );
  const chunks = [];
  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + maxChunkSizeChars, text.length);
    chunks.push(text.substring(startIndex, endIndex));
    startIndex += maxChunkSizeChars - overlapChars;
    if (endIndex === text.length) break; // Reached the end
  }
  console.log(`Split into ${chunks.length} chunks.`);
  return chunks;
}

/**
 * Selects relevant chunks based on simple keyword matching from the question.
 * NOTE: This is an interim solution. Proper implementation should use embeddings and vector search.
 * @param chunks Array of all text chunks.
 * @param question The user's question.
 * @param maxChunks Maximum number of chunks to return.
 * @returns An array of selected chunks, prioritized by keyword matches.
 */
export function getRelevantChunks(
  chunks: string[],
  question: string,
  maxChunks: number = 5
): string[] {
  console.log(
    `Selecting relevant chunks using basic keyword matching for question: "${question}"`
  );

  if (!question || chunks.length === 0) {
    return chunks.slice(0, maxChunks); // Return first chunks if no question or chunks
  }

  // Simple keyword extraction (split by space, lowercase, remove common punctuation)
  const questionKeywords = question
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .split(/\s+/)
    .filter(Boolean); // Remove empty strings

  if (questionKeywords.length === 0) {
    return chunks.slice(0, maxChunks); // Return first chunks if no keywords found
  }

  // Score chunks based on keyword presence
  const scoredChunks = chunks.map((chunk, index) => {
    const lowerChunk = chunk.toLowerCase();
    let score = 0;
    for (const keyword of questionKeywords) {
      if (lowerChunk.includes(keyword)) {
        score++;
      }
    }
    return { chunk, score, index }; // Keep original index for stability if scores are equal
  });

  // Sort chunks by score (descending), then by original index (ascending)
  scoredChunks.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.index - b.index;
  });

  // Select the top `maxChunks`
  const selectedChunks = scoredChunks
    .slice(0, maxChunks)
    .map((item) => item.chunk);

  console.log(
    `Selected ${selectedChunks.length} chunks based on keyword relevance.`
  );

  // TODO: Replace this entire function with vector similarity search for production.
  return selectedChunks;
}

/**
 * Creates the base prompt template string.
 * Context limiting is handled separately in `buildPromptWithContextLimit`.
 * @param contextChunks The context chunks (potentially pre-filtered).
 * @param question The user's question.
 * @returns A formatted prompt template string.
 */
export function createPromptTemplate(
  contextChunks: string[],
  question: string
): string {
  // console.warn("createPromptTemplate using basic template."); // Less noisy
  const context = contextChunks.join("\n\n---\n\n");
  // Basic template - can be customized
  return `Based on the following context, please answer the question. If the answer is not present in the context, say "I cannot find the answer in the provided documents."\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
}

/**
 * Counts the number of tokens in a given text using the initialized tiktoken encoder.
 * Falls back to character count / 4 as a rough estimate if encoding fails.
 * @param text The text to count tokens for.
 * @returns The estimated number of tokens.
 */
export function countTokens(text: string): number {
  if (encoding) {
    try {
      return encoding.encode(text).length;
    } catch (error) {
      console.warn(
        "Tiktoken encoding failed during count, falling back:",
        error
      );
      // Fallback to rough estimate
      return Math.ceil(text.length / 4);
    }
  } else {
    // Fallback if encoding never initialized
    console.warn("Tiktoken encoding not available, using char/4 estimate.");
    return Math.ceil(text.length / 4);
  }
}

/**
 * Builds the final prompt string, ensuring it stays within the token limit
 * by selectively including context chunks based on token count.
 * @param relevantChunks Array of context chunks, ideally ordered by relevance (desc).
 * @param question The user's question.
 * @param basePromptTemplate A template string with placeholders {context} and {question}.
 * @param maxTokens The maximum allowed tokens for the entire prompt.
 * @returns The final prompt string within the token limit.
 */
export function buildPromptWithContextLimit(
  relevantChunks: string[],
  question: string,
  basePromptTemplate: string = `Based on the following context, please answer the question. If the answer is not present in the context, say "I cannot find the answer in the provided documents."\n\nContext:\n{context}\n\nQuestion: {question}\n\nAnswer:`,
  maxTokens: number = MAX_CONTEXT_TOKENS
): string {
  const questionTokens = countTokens(question);
  // Estimate tokens for the template structure itself (excluding placeholders)
  const templateTokens = countTokens(
    basePromptTemplate.replace("{context}", "").replace("{question}", "")
  );
  const joinerTokens = countTokens("\n\n---\n\n"); // Tokens for the separator

  const availableTokensForContext = maxTokens - questionTokens - templateTokens;

  if (availableTokensForContext <= 0) {
    console.warn(
      `Not enough tokens for context (${availableTokensForContext}) after accounting for question (${questionTokens}) and template (${templateTokens}). Max: ${maxTokens}`
    );
    // Return prompt with no context or a specific message
    return basePromptTemplate
      .replace("{context}", "[Context omitted due to token limits]")
      .replace("{question}", question);
  }

  let currentTokens = 0;
  const includedChunks: string[] = [];

  console.log(
    `Building prompt. Max context tokens: ${availableTokensForContext}`
  );

  for (const chunk of relevantChunks) {
    const chunkTokens = countTokens(chunk);
    const tokensWithSeparator =
      chunkTokens + (includedChunks.length > 0 ? joinerTokens : 0);

    if (currentTokens + tokensWithSeparator <= availableTokensForContext) {
      currentTokens += tokensWithSeparator;
      includedChunks.push(chunk);
    } else {
      console.log(
        `Token limit (${availableTokensForContext}) reached while adding chunks. Used ${currentTokens} tokens. Stopping context inclusion.`
      );
      break; // Stop adding chunks once limit is exceeded
    }
  }

  const finalContext =
    includedChunks.length > 0
      ? includedChunks.join("\n\n---\n\n")
      : "[No relevant context found or fits within token limits]";

  const finalPrompt = basePromptTemplate
    .replace("{CONTEXT}", finalContext) // Corrected placeholder to uppercase
    .replace("{QUESTION}", question); // Corrected placeholder to uppercase

  const finalTokenCount = countTokens(finalPrompt);

  console.log(
    `Included ${includedChunks.length}/${relevantChunks.length} relevant chunks. Final prompt tokens: ~${finalTokenCount} (Context tokens: ~${currentTokens})`
  );

  if (finalTokenCount > maxTokens) {
    console.warn(
      `Final prompt token count (${finalTokenCount}) still exceeds maxTokens (${maxTokens}) despite limiting. This might indicate issues with token estimation or template size.`
    );
    // Consider further truncation or error handling here if necessary
  }

  return finalPrompt;
}

// Note: The main `getCompletion` function remains the same, but the calling code
// (e.g., in API routes) should now use `splitIntoChunks`, `getRelevantChunks`,
// and `buildPromptWithContextLimit` to construct the prompt before passing it
// to `getCompletion`.
