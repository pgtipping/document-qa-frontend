// Removed unused Analytics import
// import { type Analytics } from "@vercel/analytics/react";

declare global {
  interface Window {
    va?: (
      event: "event" | "beforeSend" | "pageview",
      properties?: unknown
    ) => void;
  }
}

// Removed unused EventName type
// type EventName =
//   | "document_upload_start"
//   | "document_upload_success"
//   | "document_upload_error"
//   | "question_asked"
//   | "answer_received"
//   | "provider_selected"
//   | "error_occurred"
//   | "timing"
//   | "timing_error"
//   | "web_vitals";

type EventProperties = {
  provider?: string;
  documentSize?: number;
  responseTime?: number;
  errorType?: string;
  errorMessage?: string;
  name?: string;
  duration?: number;
  error?: string;
  id?: string;
  label?: string;
  value?: number;
  documentType?: string;
  uploadDuration?: number;
  documentId?: string;
  questionLength?: number;
  answerLength?: number;
  timeTaken?: number;
  mode?: "user" | "model"; // Added mode property
  generatedQuestion?: boolean; // Added generatedQuestion property
};

// Base trackEvent function
const baseTrackEvent = (name: string, properties?: EventProperties) => {
  try {
    // Check if we're in a browser environment and analytics is initialized
    if (typeof window === "undefined" || !window.va) {
      console.warn("Analytics not initialized or not in browser environment");
      return;
    }
    window.va("event", { event_name: name, ...properties });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};

// Alert tracking function
export const trackAlert = async (
  type: "error_rate" | "response_time" | "upload_failures",
  value: number,
  details?: Record<string, unknown> // Changed any to unknown
) => {
  try {
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        value,
        timestamp: new Date().toISOString(),
        details,
      }),
    });

    if (!response.ok) {
      // Log the error but don't throw, to avoid interrupting other processes
      console.error(`Failed to send alert via API. Status: ${response.status}`);
      // Optionally parse and log the response body for more details
      try {
        const errorBody = await response.json();
        console.error("Alert API error response:", errorBody);
      } catch (parseError) {
        console.error("Failed to parse alert API error response:", parseError); // Log the parseError
      }
      return null; // Indicate failure without throwing
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling /api/alerts:", error);
    return null; // Indicate failure without throwing
  }
};

// Error rate tracking
let errorCount = 0;
let totalOperations = 0;

export const trackErrorRate = () => {
  const errorRate = totalOperations > 0 ? errorCount / totalOperations : 0;
  return trackAlert("error_rate", errorRate);
};

// Response time tracking
const responseTimeSamples: number[] = [];

export const trackResponseTime = (duration: number) => {
  responseTimeSamples.push(duration);
  const average =
    responseTimeSamples.reduce((a, b) => a + b, 0) / responseTimeSamples.length;
  return trackAlert("response_time", average);
};

// Upload failure tracking
let uploadFailures = 0;

export const trackUploadFailure = () => {
  uploadFailures++;
  return trackAlert("upload_failures", uploadFailures);
};

export const resetUploadFailures = () => {
  uploadFailures = 0;
};

// Enhanced trackEvent with alert tracking
export const trackEvent = (name: string, properties?: EventProperties) => {
  totalOperations++;

  if (name.includes("error") || properties?.errorType) {
    errorCount++;
    trackErrorRate();
  }

  if (properties?.responseTime) {
    trackResponseTime(properties.responseTime);
  }

  if (name === "document_upload_error") {
    trackUploadFailure();
  }

  if (name === "document_upload_success") {
    resetUploadFailures();
  }

  return baseTrackEvent(name, properties);
};

export const trackTiming = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    trackEvent("timing", {
      name,
      duration,
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackEvent("timing_error", {
      name,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

// Web Vitals tracking
export const trackWebVitals = () => {
  try {
    if (typeof window !== "undefined") {
      const reportWebVitals = (metric: unknown) => {
        // Changed any to unknown
        // Type guard or assertion needed if accessing metric properties
        if (
          metric &&
          typeof metric === "object" &&
          "id" in metric &&
          "name" in metric &&
          "label" in metric &&
          "value" in metric
        ) {
          const { id, name, label, value } = metric as {
            id: string;
            name: string;
            label: string;
            value: number;
          }; // Type assertion
          trackEvent("web_vitals", {
            id,
            name,
            label,
            value: Math.round(name === "CLS" ? value * 1000 : value),
          });
        } else {
          console.warn(
            "Received unexpected metric format for Web Vitals:",
            metric
          );
        }
      };

      // @ts-expect-error - Web Vitals are added by Next.js
      window.reportWebVitals = reportWebVitals;
    }
  } catch (error) {
    console.error("Error setting up web vitals tracking:", error);
  }
};
