"use client";

import { useMetrics } from "@/hooks/useMetrics";
import PerformanceMetrics from "@/components/PerformanceMetrics";
// Removed unused Card components: import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed useEffect and useRouter imports as they are no longer needed here

export default function AdminMetrics() {
  // Removed router initialization
  // Relying on useMetrics hook for auth state and error handling
  const metricsData = useMetrics({ enabled: true });

  // Removed redundant useEffect auth check block

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="space-y-8">
        <PerformanceMetrics metricsData={metricsData} />
      </div>
    </main>
  );
}
