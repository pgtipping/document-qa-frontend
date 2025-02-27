import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Document Analysis Blog - InQDoc",
  description:
    "Learn about AI-powered document analysis, best practices, and how to get the most out of InQDoc.",
  keywords:
    "document analysis, AI document search, InQDoc, PDF analysis, text analysis, AI assistant, document intelligence, document processing",
  openGraph: {
    title: "Document Analysis Blog - InQDoc",
    description:
      "Learn about AI-powered document analysis, best practices, and how to get the most out of InQDoc.",
    url: "https://doc-chat-qa.vercel.app/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Document Analysis Blog - InQDoc",
    description:
      "Learn about AI-powered document analysis, best practices, and how to get the most out of InQDoc.",
  },
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Document Analysis Blog</h1>

        <div className="grid gap-8">
          <article>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  <Link
                    href="/blog/ai-document-analysis"
                    className="hover:text-primary transition-colors"
                  >
                    The Future of AI-Powered Document Analysis
                  </Link>
                </CardTitle>
                <CardDescription>
                  Published on February 27, 2024
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Document analysis has evolved significantly with the advent of
                  advanced AI models. In this article, we explore how AI is
                  transforming document processing and analysis, making it
                  faster, more accurate, and more accessible than ever before.
                </p>
                <Link
                  href="/blog/ai-document-analysis"
                  className="text-primary hover:underline"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          </article>

          <article>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  <Link
                    href="/blog/document-qa-best-practices"
                    className="hover:text-primary transition-colors"
                  >
                    Best Practices for Document Q&A: Getting the Most Accurate
                    Answers
                  </Link>
                </CardTitle>
                <CardDescription>
                  Published on February 25, 2024
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Learn how to formulate effective questions, prepare your
                  documents, and choose the right AI models to get the most
                  accurate and helpful answers from Document Q&A. These best
                  practices will help you maximize the value of AI-powered
                  document analysis.
                </p>
                <Link
                  href="/blog/document-qa-best-practices"
                  className="text-primary hover:underline"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          </article>

          <article>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  <Link
                    href="/blog/comparing-ai-models"
                    className="hover:text-primary transition-colors"
                  >
                    Comparing AI Models for Document Analysis: Gemini vs. GPT-4O
                    vs. Deepseek
                  </Link>
                </CardTitle>
                <CardDescription>
                  Published on February 22, 2024
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Not all AI models are created equal when it comes to document
                  analysis. In this comprehensive comparison, we evaluate the
                  performance, accuracy, and speed of different AI models
                  including Gemini 1.5 Flash, GPT-4O Mini, Deepseek Chat, and
                  Meta Llama 3.1.
                </p>
                <Link
                  href="/blog/comparing-ai-models"
                  className="text-primary hover:underline"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          </article>
        </div>
      </div>
    </div>
  );
}
