"use client";

import { useRef, useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { useMetrics } from "@/hooks/useMetrics";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      main: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default function Home() {
  const [showMetrics, setShowMetrics] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);
  const { hasMetrics, isLoading, data, error } = useMetrics(); // Always check for metrics

  // Pass metrics data to PerformanceMetrics to avoid double polling
  const metricsData = {
    data,
    error,
    isLoading,
    hasMetrics,
  };

  const handleViewMetrics = () => {
    setShowMetrics((prev) => !prev); // Toggle metrics visibility
    if (!showMetrics) {
      // Only scroll when showing metrics
      setTimeout(() => {
        metricsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  // Prevent chat input from scrolling to metrics
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Your chat submission logic here
  };

  return (
    <div className="relative">
      {/* Theme Toggle and Metrics Button */}
      <div className="flex justify-end items-center gap-4 p-4 sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ThemeToggle />
        {hasMetrics && (
          <Button
            onClick={handleViewMetrics}
            className="bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Metrics...
              </>
            ) : showMetrics ? (
              "Hide Metrics"
            ) : (
              "View Performance Metrics"
            )}
          </Button>
        )}
      </div>

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-6 space-y-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardHeader className="space-y-4 pb-8">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Document Q&A
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground">
                Upload your documents and get instant, intelligent answers to
                your questions using AI
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary/20 bg-card">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                  Upload Document
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Upload your PDF or text file to start asking questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 h-full border shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary/20 bg-card">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                  Chat
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Ask questions about your document and get AI-powered answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatInterface onSubmit={handleChatSubmit} />
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Dashboard */}
          {showMetrics && (
            <div ref={metricsRef} className="scroll-mt-20 pt-4">
              <PerformanceMetrics metricsData={metricsData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
