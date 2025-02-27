import {
  CLSMetric,
  FCPMetric,
  FIDMetric,
  LCPMetric,
  TTFBMetric,
  onCLS,
  onFCP,
  onFID,
  onLCP,
  onTTFB,
} from "web-vitals";

type SendToAnalyticsFunction = (
  metric: CLSMetric | FCPMetric | FIDMetric | LCPMetric | TTFBMetric
) => void;

export function reportWebVitals(
  sendToAnalytics: SendToAnalyticsFunction
): void {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Helper function to determine if the metric is good, needs improvement, or poor
export function getMetricRating(
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  switch (name) {
    case "CLS":
      return value <= 0.1
        ? "good"
        : value <= 0.25
        ? "needs-improvement"
        : "poor";
    case "FID":
      return value <= 100
        ? "good"
        : value <= 300
        ? "needs-improvement"
        : "poor";
    case "LCP":
      return value <= 2500
        ? "good"
        : value <= 4000
        ? "needs-improvement"
        : "poor";
    case "FCP":
      return value <= 1800
        ? "good"
        : value <= 3000
        ? "needs-improvement"
        : "poor";
    case "TTFB":
      return value <= 800
        ? "good"
        : value <= 1800
        ? "needs-improvement"
        : "poor";
    default:
      return "needs-improvement";
  }
}

// Format the metric value for display
export function formatMetricValue(name: string, value: number): string {
  switch (name) {
    case "CLS":
      return value.toFixed(2);
    case "FID":
    case "LCP":
    case "FCP":
    case "TTFB":
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}

// Get a human-readable name for the metric
export function getMetricName(name: string): string {
  switch (name) {
    case "CLS":
      return "Cumulative Layout Shift";
    case "FID":
      return "First Input Delay";
    case "LCP":
      return "Largest Contentful Paint";
    case "FCP":
      return "First Contentful Paint";
    case "TTFB":
      return "Time to First Byte";
    default:
      return name;
  }
}

// Get a description for the metric
export function getMetricDescription(name: string): string {
  switch (name) {
    case "CLS":
      return "Measures visual stability. A low CLS means the page doesn't shift unexpectedly.";
    case "FID":
      return "Measures responsiveness. A low FID means the page is interactive quickly.";
    case "LCP":
      return "Measures loading performance. A fast LCP helps users see your content quickly.";
    case "FCP":
      return "Measures when the first content appears. A fast FCP gives users visual feedback that the page is loading.";
    case "TTFB":
      return "Measures server response time. A fast TTFB indicates a responsive server.";
    default:
      return "";
  }
}
