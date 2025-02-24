import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // Read the performance metrics JSON file
    const filePath = path.join(
      process.cwd(),
      "frontend",
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
    const logs = JSON.parse(content);
    console.log(`Found ${logs.length} metric entries`);

    // Create specialized data structures for different chart types
    const chartsData = {
      // Original logs
      logs,

      // Document metrics for bar chart
      documentMetrics: logs
        .map((log) => ({
          name: "Document Size (KB)",
          value: log.document_metrics.size_kb,
        }))
        .concat(
          logs.map((log) => ({
            name: "Total Chunks",
            value: log.document_metrics.total_chunks,
          })),
          logs.map((log) => ({
            name: "Selected Chunks",
            value: log.document_metrics.selected_chunks,
          })),
          logs.map((log) => ({
            name: "Chunk Size",
            value: log.document_metrics.chunk_size,
          })),
          logs.map((log) => ({
            name: "Context Length",
            value: log.document_metrics.context_length,
          }))
        ),

      // Processing times for line chart
      processingTimes: logs.map((log) => ({
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
