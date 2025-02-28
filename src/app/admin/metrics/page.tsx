"use client";

import { useMetrics } from "@/hooks/useMetrics";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminMetrics() {
  const router = useRouter();
  const metricsData = useMetrics({ enabled: true });

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth");
        if (!response.ok) {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="space-y-8">
        <PerformanceMetrics metricsData={metricsData} />
      </div>
    </main>
  );
}
