import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDataLength, setLastDataLength] = useState(0);
  const isAuthenticated = sessionStatus === "authenticated";

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Not authenticated. Please log in to view metrics.");
      setIsLoading(false);
      setData(null); // Clear any stale data
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch("/api/performance-logs");

      if (!response.ok) {
        let errorMsg = "Failed to load performance data.";
        if (response.status === 401) {
          errorMsg = "Unauthorized: Please log in again.";
        } else if (response.status === 403) {
          errorMsg = "Forbidden: You do not have permission to view metrics.";
        } else {
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (jsonError) {
            // Ignore if response is not JSON
          }
        }
        setError(errorMsg);
        setData(null); // Clear data on error
        setIsLoading(false);
        return;
      }

      const chartData = await response.json();

      // Only update if we have new data
      if (chartData.logs.length !== lastDataLength) {
        setData(chartData);
        setLastDataLength(chartData.logs.length);
        onNewMetrics?.(chartData);
      }
      setError(null); // Clear error on success
    } catch (err) {
      console.error("Error fetching performance metrics:", err); // Log unexpected errors
      setError("An unexpected error occurred while fetching performance data.");
      setData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, lastDataLength, onNewMetrics]);

  useEffect(() => {
    // Check session status on mount and when it changes
    if (sessionStatus === "loading" || !enabled) {
      setIsLoading(sessionStatus === "loading"); // Show loading indicator while session loads
      return; // Don't fetch until session is loaded and hook is enabled
    }

    if (sessionStatus === "unauthenticated") {
      setError("Not authenticated. Please log in to view metrics.");
      setData(null);
      setIsLoading(false);
      return; // Don't fetch if unauthenticated
    }

    // Initial fetch only if authenticated and enabled
    if (isAuthenticated) {
      fetchData();
    }

    // Set up event listener for metrics refresh
    const handleRefresh = () => {
      if (isAuthenticated) {
        // Only refresh if authenticated
        fetchData();
      }
    };

    metricsEvents.addEventListener("refresh-metrics", handleRefresh);

    return () => {
      metricsEvents.removeEventListener("refresh-metrics", handleRefresh);
    };
    // Depend on sessionStatus to refetch or clear errors when auth state changes
  }, [enabled, fetchData, isAuthenticated, sessionStatus]);

  const hasMetrics = Boolean(
    isAuthenticated && // Metrics only exist if authenticated and data is present
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
    isLoading: isLoading || sessionStatus === "loading", // Consider session loading as loading state
    hasMetrics,
    isAuthenticated, // Expose auth status
  };
}
