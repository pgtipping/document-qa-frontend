import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Comparing AI Models for Document Analysis - InQDoc",
  description:
    "A comprehensive comparison of Gemini vs. GPT-4o-mini vs. Deepseek for document analysis, evaluating performance, accuracy, and speed.",
  keywords:
    "AI models comparison, Gemini, GPT-4o-mini, Deepseek, document analysis, AI performance, model comparison",
  openGraph: {
    title: "Comparing AI Models for Document Analysis - InQDoc",
    description:
      "A comprehensive comparison of Gemini vs. GPT-4o-mini vs. Deepseek for document analysis, evaluating performance, accuracy, and speed.",
    url: "https://doc-chat-qa.vercel.app/blog/comparing-ai-models",
    type: "article",
    publishedTime: "2024-02-22T00:00:00Z",
    authors: ["InQDoc Team"],
    tags: ["AI Models", "Document Analysis", "Performance Comparison"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comparing AI Models for Document Analysis - InQDoc",
    description:
      "A comprehensive comparison of Gemini vs. GPT-4o-mini vs. Deepseek for document analysis, evaluating performance, accuracy, and speed.",
  },
};

export default function ComparingAIModels() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="text-primary hover:underline mb-6 inline-block"
        >
          ← Back to Blog
        </Link>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">
            Comparing AI Models for Document Analysis: Gemini vs. GPT-4o-mini
            vs. Deepseek
          </h1>
          <div className="text-muted-foreground mb-8">
            Published on February 22, 2024
          </div>

          <div className="space-y-6">
            <p className="lead text-xl">
              When it comes to document analysis, choosing the right AI model
              can significantly impact your results. In this comprehensive
              comparison, we evaluate the performance, accuracy, and speed of
              different AI models including Gemini 1.5 Flash, GPT-4o-mini, and
              Deepseek Chat.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
              Performance Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Gemini 1.5 Flash</h3>
                <ul className="text-sm space-y-2">
                  <li>Response Time: ~0.9s</li>
                  <li>Strengths: Speed, Real-time analysis</li>
                  <li>Best for: Quick queries, Interactive sessions</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">GPT-4o-mini</h3>
                <ul className="text-sm space-y-2">
                  <li>Response Time: ~4.4s</li>
                  <li>Strengths: Balanced performance, Accuracy</li>
                  <li>Best for: General analysis, Complex queries</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">Deepseek Chat</h3>
                <ul className="text-sm space-y-2">
                  <li>Response Time: ~10.6s</li>
                  <li>Strengths: Depth, Comprehensiveness</li>
                  <li>Best for: Detailed analysis, Technical documents</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8">
              Detailed Analysis by Category
            </h2>

            <h3 className="text-xl font-semibold mt-6">Speed and Efficiency</h3>
            <p>
              Gemini 1.5 Flash leads in speed with an impressive ~0.9s average
              response time, making it ideal for real-time interactions.
              GPT-4o-mini follows with a respectable ~4.4s, while Deepseek Chat
              takes longer at ~10.6s but compensates with more detailed
              analysis.
            </p>

            <h3 className="text-xl font-semibold mt-6">Accuracy and Quality</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Gemini 1.5 Flash:</strong> High accuracy for quick
                queries, may miss nuanced details in complex documents
              </li>
              <li>
                <strong>GPT-4o-mini:</strong> Excellent balance of accuracy and
                speed, handles most document types well
              </li>
              <li>
                <strong>Deepseek Chat:</strong> Highest accuracy for complex
                technical content, excels at detailed analysis
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6">
              Document Type Handling
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full mt-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Document Type</th>
                    <th className="text-left py-2">Best Model</th>
                    <th className="text-left py-2">Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Technical Documentation</td>
                    <td>Deepseek Chat</td>
                    <td>Superior technical understanding</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Business Reports</td>
                    <td>GPT-4o-mini</td>
                    <td>Balanced analysis and speed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Quick References</td>
                    <td>Gemini 1.5 Flash</td>
                    <td>Fast, accurate responses</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold mt-8">
              Cost-Benefit Analysis
            </h2>
            <p>When choosing between models, consider these factors:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Time Sensitivity:</strong> If speed is crucial, Gemini
                1.5 Flash is the clear winner
              </li>
              <li>
                <strong>Complexity:</strong> For complex documents, Deepseek
                Chat's thoroughness justifies the longer processing time
              </li>
              <li>
                <strong>General Use:</strong> GPT-4o-mini offers the best
                balance for most use cases
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8">
              Making the Right Choice
            </h2>
            <p>The best model choice depends on your specific needs:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Choose Gemini 1.5 Flash for real-time analysis and quick
                responses
              </li>
              <li>
                Use GPT-4o-mini for balanced performance across various document
                types
              </li>
              <li>
                Opt for Deepseek Chat when accuracy and detail are paramount
              </li>
            </ul>

            <div className="bg-muted/30 rounded-lg p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Ready to Try These Models?
              </h2>
              <p className="mb-4">
                Experience the difference yourself by testing different models
                with your documents.
              </p>
              <Link href="/chat">
                <Button>Start Document Analysis</Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
