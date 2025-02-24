import { useState, useEffect, useCallback } from "react";

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
  timestamp: string;
  llm_time: number;
  doc_time: number;
}

interface ChartData {
  logs: any[];
  documentMetrics: DocumentMetrics[];
  processingTimes: ProcessingTime[];
  latestTimings: {
    llm: TimingMetric[];
    doc: TimingMetric[];
  };
}

interface UseMetricsOptions {
  enabled?: boolean;
  onNewMetrics?: (data: ChartData) => void;
}

// Create a singleton event emitter for metrics events
const metricsEvents = new EventTarget();
export const triggerMetricsRefresh = () => {
  metricsEvents.dispatchEvent(new Event("refresh-metrics"));
};

export function useMetrics({
  enabled = true,
  onNewMetrics,
}: UseMetricsOptions = {}) {
  const [data, setData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDataLength, setLastDataLength] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/performance-logs");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      const chartData = await response.json();

      // Only update if we have new data
      if (chartData.logs.length !== lastDataLength) {
        setData(chartData);
        setLastDataLength(chartData.logs.length);
        onNewMetrics?.(chartData);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching performance logs:", err);
      setError("Failed to load performance data");
    } finally {
      setIsLoading(false);
    }
  }, [lastDataLength, onNewMetrics]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up event listener for metrics refresh
    const handleRefresh = () => {
      fetchData();
    };

    metricsEvents.addEventListener("refresh-metrics", handleRefresh);

    return () => {
      metricsEvents.removeEventListener("refresh-metrics", handleRefresh);
    };
  }, [enabled, fetchData]);

  const hasMetrics = Boolean(
    data &&
      ((Array.isArray(data.logs) && data.logs.length > 0) ||
        (Array.isArray(data.documentMetrics) &&
          data.documentMetrics.length > 0) ||
        (Array.isArray(data.processingTimes) &&
          data.processingTimes.length > 0))
  );

  return {
    data,
    error,
    isLoading,
    hasMetrics,
  };
}
