"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test-email");
      const data = await response.json();
      setResult(data);
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

          {error && (
            <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
