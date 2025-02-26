import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

interface DocumentMetrics {
  size_kb: number;
  total_chunks: number;
  selected_chunks: number;
  chunk_size: number;
  context_length: number;
}

interface TimingEntry {
  name: string;
  duration: number;
}

interface PerformanceLog {
  timestamp: string;
  document_metrics: DocumentMetrics;
  total_llm_time: number;
  total_doc_time: number;
  llm_timing: TimingEntry[];
  doc_timing: TimingEntry[];
}

export async function GET(req: NextRequest) {
  try {
    // In production, return empty data as we'll handle metrics differently
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({
        logs: [],
        documentMetrics: [],
        processingTimes: [],
        latestTimings: { llm: [], doc: [] },
      });
    }

    // Read the performance metrics JSON file (only in development)
    const filePath = path.join(
      process.cwd(),
      "performance_logs",
      "performance_metrics.json"
    );

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log("Metrics file not found at:", filePath);
      return NextResponse.json({
        logs: [],
        documentMetrics: [],
        processingTimes: [],
        latestTimings: { llm: [], doc: [] },
      });
    }

    const content = await fs.readFile(filePath, "utf-8");

    // If file is empty, return empty data structure
    if (!content.trim()) {
      console.log("Metrics file is empty");
      return NextResponse.json({
        logs: [],
        documentMetrics: [],
        processingTimes: [],
        latestTimings: { llm: [], doc: [] },
      });
    }

    // Parse JSON data
    const logs: PerformanceLog[] = JSON.parse(content);
    console.log(`Found ${logs.length} metric entries`);

    // Create specialized data structures for different chart types
    const chartsData = {
      // Original logs
      logs,

      // Document metrics for bar chart
      documentMetrics: logs
        .map((log: PerformanceLog) => ({
          name: "Document Size (KB)",
          value: log.document_metrics.size_kb,
        }))
        .concat(
          logs.map((log: PerformanceLog) => ({
            name: "Total Chunks",
            value: log.document_metrics.total_chunks,
          })),
          logs.map((log: PerformanceLog) => ({
            name: "Selected Chunks",
            value: log.document_metrics.selected_chunks,
          })),
          logs.map((log: PerformanceLog) => ({
            name: "Chunk Size",
            value: log.document_metrics.chunk_size,
          })),
          logs.map((log: PerformanceLog) => ({
            name: "Context Length",
            value: log.document_metrics.context_length,
          }))
        ),

      // Processing times for line chart
      processingTimes: logs.map((log: PerformanceLog) => ({
        timestamp: new Date(log.timestamp).toLocaleTimeString(),
        llm_time: log.total_llm_time,
        doc_time: log.total_doc_time,
      })),

      // Latest timing breakdowns for pie charts
      latestTimings: {
        llm: logs[logs.length - 1]?.llm_timing || [],
        doc: logs[logs.length - 1]?.doc_timing || [],
      },
    };

    return NextResponse.json(chartsData);
  } catch (error) {
    console.error("Error reading performance logs:", error);
    return NextResponse.json(
      { error: "Failed to read performance logs" },
      { status: 500 }
    );
  }
}
