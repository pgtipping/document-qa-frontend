import { type Analytics } from "@vercel/analytics/react";

declare global {
  interface Window {
    va?: (
      event: "event" | "beforeSend" | "pageview",
      properties?: unknown
    ) => void;
  }
}

type EventName =
  | "document_upload_start"
  | "document_upload_success"
  | "document_upload_error"
  | "question_asked"
  | "answer_received"
  | "provider_selected"
  | "error_occurred"
  | "timing"
  | "timing_error"
  | "web_vitals";

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
};

// Base trackEvent function
const baseTrackEvent = (name: string, properties?: EventProperties) => {
  try {
    window.va?.("event", { event_name: name, ...properties });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};

// Alert tracking function
export const trackAlert = async (
  type: "error_rate" | "response_time" | "upload_failures",
  value: number,
  details?: Record<string, any>
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
      throw new Error("Failed to send alert");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending alert:", error);
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
      const reportWebVitals = (metric: any) => {
        const { id, name, label, value } = metric;
        trackEvent("web_vitals", {
          id,
          name,
          label,
          value: Math.round(name === "CLS" ? value * 1000 : value),
        });
      };

      // @ts-ignore - Web Vitals are added by Next.js
      window.reportWebVitals = reportWebVitals;
    }
  } catch (error) {
    console.error("Error setting up web vitals tracking:", error);
  }
};
