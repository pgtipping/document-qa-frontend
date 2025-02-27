"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMetricValue,
  getMetricDescription,
  getMetricName,
  getMetricRating,
  reportWebVitals,
} from "@/lib/web-vitals";
import {
  CLSMetric,
  FCPMetric,
  FIDMetric,
  LCPMetric,
  TTFBMetric,
} from "web-vitals";

type WebVitalMetric =
  | CLSMetric
  | FCPMetric
  | FIDMetric
  | LCPMetric
  | TTFBMetric;

export default function WebVitals() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);

  useEffect(() => {
    // Function to send metrics to our state
    const sendToAnalytics = (metric: WebVitalMetric) => {
      // Update state with the new metric
      setMetrics((prevMetrics) => {
        // Check if this metric type already exists
        const existingMetricIndex = prevMetrics.findIndex(
          (m) => m.name === metric.name
        );

        if (existingMetricIndex >= 0) {
          // Replace the existing metric
          const newMetrics = [...prevMetrics];
          newMetrics[existingMetricIndex] = metric;
          return newMetrics;
        } else {
          // Add the new metric
          return [...prevMetrics, metric];
        }
      });

      // You could also send the metric to an analytics service here
      console.log(metric.name, metric.value);
    };

    // Start reporting web vitals
    reportWebVitals(sendToAnalytics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Core Web Vitals</h2>
        <p className="text-muted-foreground mb-6">
          Real-time performance metrics for this page. These metrics affect your
          search engine ranking and user experience.
        </p>
      </div>

      {metrics.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p>Collecting performance metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const rating = getMetricRating(metric.name, metric.value);
            const formattedValue = formatMetricValue(metric.name, metric.value);
            const fullName = getMetricName(metric.name);
            const description = getMetricDescription(metric.name);

            return (
              <Card
                key={metric.name}
                className={`border-l-4 ${
                  rating === "good"
                    ? "border-l-green-500"
                    : rating === "needs-improvement"
                    ? "border-l-yellow-500"
                    : "border-l-red-500"
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{metric.name}</span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        rating === "good"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : rating === "needs-improvement"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {formattedValue}
                    </span>
                  </CardTitle>
                  <CardDescription>{fullName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-sm text-muted-foreground mt-4">
        <p>
          <strong>Good</strong>: Meets Core Web Vitals thresholds
          <span className="mx-2">•</span>
          <strong>Needs Improvement</strong>: Below optimal thresholds
          <span className="mx-2">•</span>
          <strong>Poor</strong>: Significantly below thresholds
        </p>
      </div>
    </div>
  );
}
