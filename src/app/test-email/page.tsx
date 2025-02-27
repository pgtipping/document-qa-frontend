"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const handleTestEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setResponseStatus(null);

    try {
      const response = await fetch("/api/test-email");
      setResponseStatus(response.status);

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setError(
          `Server returned ${response.status}: ${
            data.message || data.error || "Unknown error"
          }`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
          <CardDescription>
            This page tests your email alert configuration by sending a test
            email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to test your email configuration. This will
            attempt to send a test email to the address configured in your
            environment variables.
          </p>

          <Button onClick={handleTestEmail} disabled={loading} className="mb-4">
            {loading ? "Sending..." : "Send Test Email"}
          </Button>

          {responseStatus && (
            <div
              className={`p-2 mb-2 rounded text-sm ${
                responseStatus >= 200 && responseStatus < 300
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Response Status: {responseStatus}
            </div>
          )}

          {error && (
            <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap overflow-auto max-h-96 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.config && (
                <div className="mt-4">
                  <h4 className="font-semibold">Email Configuration:</h4>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Service: {result.config.service ? "✅" : "❌"}</li>
                    <li>User: {result.config.user ? "✅" : "❌"}</li>
                    <li>Password: {result.config.pass ? "✅" : "❌"}</li>
                    <li>Recipient: {result.config.recipient ? "✅" : "❌"}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
