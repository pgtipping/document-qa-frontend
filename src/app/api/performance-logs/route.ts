import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
// Removed unused Prisma import: import { Prisma } from "@prisma/client";
// Removed problematic import: import { PerformanceLog as DbPerformanceLog } from "@prisma/client";

// Define interfaces matching the frontend expectations (from useMetrics/PerformanceMetrics)
interface TimingMetric {
  name: string;
  value: number;
  percentage: number;
}

interface DocumentMetrics {
  size_kb: number;
  total_chunks: number;
  selected_chunks: number;
  chunk_size: number;
  context_length: number;
}

interface ProcessingTime {
  timestamp: string; // Keep as string for chart axis
  llm_time: number;
  doc_time: number;
}

interface LogEntry {
  // Minimal structure needed for the 'latestLog' usage in PerformanceMetrics
  total_llm_time?: number | null; // Allow null from DB
  total_doc_time?: number | null; // Allow null from DB
}

interface ChartData {
  logs: LogEntry[];
  documentMetrics: DocumentMetrics[];
  processingTimes: ProcessingTime[];
  latestTimings: {
    llm: TimingMetric[];
    doc: TimingMetric[];
  };
}

// Define a minimal interface for the DB log structure based on usage
interface DbPerformanceLog {
  timestamp: Date;
  llmCompletionTime: number | null;
  docProcessingTime: number | null;
  embeddingTime: number | null;
  vectorSearchTime: number | null;
  totalTime: number;
  llmTimingBreakdown: unknown | null; // Use unknown for safety
  docTimingBreakdown: unknown | null; // Use unknown for safety
  docMetricsJson: unknown | null; // Use unknown for safety
}

// Helper function to safely parse JSON from Prisma
// Use 'unknown' instead of 'any' or 'Prisma.JsonValue' due to type resolution issues
function safeParseJson<T>(
  jsonData: unknown | null | undefined,
  defaultValue: T
): T {
  if (!jsonData || typeof jsonData !== "object" || Array.isArray(jsonData)) {
    if (typeof jsonData === "string") {
      try {
        const parsed = JSON.parse(jsonData);
        if (typeof parsed === "object" && parsed !== null) {
          if (
            defaultValue === null ||
            (Array.isArray(defaultValue) && Array.isArray(parsed)) ||
            (!Array.isArray(defaultValue) && !Array.isArray(parsed))
          ) {
            return parsed as T;
          }
        }
      } catch (e) {
        console.warn("Failed to parse JSON string from DB:", e);
        return defaultValue;
      }
    }
    return defaultValue;
  }
  if (
    (Array.isArray(defaultValue) && Array.isArray(jsonData)) ||
    (!Array.isArray(defaultValue) && !Array.isArray(jsonData))
  ) {
    // Assuming jsonData is already the correct type T if it's an object/array
    // This might need adjustment based on how Prisma actually returns JSON fields
    return jsonData as T;
  }
  return defaultValue;
}

export async function GET(_req: NextRequest) {
  // Prefix unused req
  // Use the withAdminAuth wrapper to ensure only authenticated admins can access
  // Prefix session with _ as it's provided by wrapper but not used directly here
  return withAdminAuth(_req, async (_session) => {
    // Corrected req to _req
    try {
      // Fetch all performance logs from the database, ordered by timestamp
      // Use lowercase 'performanceLog' as defined in the schema
      // Rely on Prisma client having the correct model definition at runtime
      // Remove 'any' type assertion - TS might still show error due to env issues
      const dbLogs = await prisma.performanceLog.findMany({
        where: {
          // Optionally filter by user if needed, but admin sees all for now
          // userId: _session.user.id, // Use _session if filtering by user
        },
        orderBy: {
          timestamp: "asc", // Order chronologically for historical chart
        },
      });

      if (!dbLogs || dbLogs.length === 0) {
        // Return empty structure if no logs found
        return NextResponse.json({
          logs: [],
          documentMetrics: [],
          processingTimes: [],
          latestTimings: { llm: [], doc: [] },
        });
      }

      // Transform the database logs into the ChartData structure
      const logs: LogEntry[] = dbLogs.map((log: DbPerformanceLog) => ({
        // Add type DbPerformanceLog
        total_llm_time: log.llmCompletionTime, // Map from llmCompletionTime
        total_doc_time:
          log.docProcessingTime ??
          log.totalTime -
            (log.llmCompletionTime ?? 0) -
            (log.embeddingTime ?? 0) -
            (log.vectorSearchTime ?? 0), // Approximate doc time if not directly logged
      }));

      const documentMetrics: DocumentMetrics[] = dbLogs
        .map(
          (
            log: DbPerformanceLog // Add type DbPerformanceLog
          ) => safeParseJson<DocumentMetrics | null>(log.docMetricsJson, null)
        )
        .filter(
          (metrics: DocumentMetrics | null): metrics is DocumentMetrics =>
            metrics !== null // Add type DocumentMetrics | null
        ); // Filter out nulls

      const processingTimes: ProcessingTime[] = dbLogs.map(
        (log: DbPerformanceLog) => ({
          // Add type DbPerformanceLog
          timestamp: log.timestamp.toISOString().split("T")[0], // Format as YYYY-MM-DD for chart axis
          llm_time: log.llmCompletionTime ?? 0, // Use LLM completion time
          doc_time:
            log.docProcessingTime ??
            (log.embeddingTime ?? 0) + (log.vectorSearchTime ?? 0), // Combine embedding and search for doc time if specific doc time absent
        })
      );

      const latestLog = dbLogs[dbLogs.length - 1];
      const latestTimings = {
        llm: safeParseJson<TimingMetric[]>(latestLog.llmTimingBreakdown, []),
        doc: safeParseJson<TimingMetric[]>(latestLog.docTimingBreakdown, []),
      };

      // Construct the final ChartData object
      const chartData: ChartData = {
        logs,
        documentMetrics,
        processingTimes,
        latestTimings,
      };

      return NextResponse.json(chartData);
    } catch (error) {
      console.error("Error fetching performance metrics from DB:", error);
      // Log the specific error for debugging
      const errorMessage =
        error instanceof Error ? error.message : "Unknown database error";
      return NextResponse.json(
        { error: "Failed to fetch performance metrics", details: errorMessage },
        { status: 500 }
      );
    }
  });
}
