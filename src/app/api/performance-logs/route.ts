import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth";

interface PerformanceLog {
  timestamp: string;
  model: string;
  provider: string;
  question: string;
  document_metrics: {
    size_kb: number;
    total_chunks: number;
    selected_chunks: number;
    chunk_size: number;
    context_length: number;
  };
  llm_timing: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  doc_timing: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  total_llm_time: number;
  total_doc_time: number;
}

export async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      // Fetch metrics from backend API
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!backendUrl) {
        throw new Error("Backend API URL not configured");
      }

      const response = await fetch(`${backendUrl}/metrics`, {
        headers: {
          "Content-Type": "application/json",
          // Pass through the authorization header
          Authorization: req.headers.get("Authorization") || "",
        },
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const logs: PerformanceLog[] = await response.json();

      // Transform the data for the frontend
      return NextResponse.json({
        logs,
        documentMetrics: logs.map((log) => log.document_metrics),
        processingTimes: logs.map((log) => ({
          llm: log.total_llm_time,
          doc: log.total_doc_time,
        })),
        latestTimings:
          logs.length > 0
            ? {
                llm: logs[logs.length - 1].llm_timing,
                doc: logs[logs.length - 1].doc_timing,
              }
            : { llm: [], doc: [] },
      });
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      return NextResponse.json(
        { error: "Failed to fetch performance metrics" },
        { status: 500 }
      );
    }
  });
}
