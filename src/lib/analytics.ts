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

export const trackEvent = (name: string, properties?: EventProperties) => {
  try {
    window.va?.("event", { event_name: name, ...properties });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
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
