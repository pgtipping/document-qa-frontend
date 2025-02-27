"use client";

import { useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowRight,
  FileText,
  Zap,
  Shield,
  MessageSquare,
  BarChart4,
  Layers,
} from "lucide-react";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { useMetrics } from "@/hooks/useMetrics";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  return (
    <div className="relative">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "InQDoc",
            description:
              "Upload documents and get instant, intelligent answers to your questions using advanced AI technology.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Document upload and analysis",
              "AI-powered question answering",
              "Multiple AI model support",
              "Performance metrics",
            ],
          }),
        }}
      />

      {/* FAQ Schema for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What file formats does InQDoc support?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "InQDoc supports PDF, TXT, DOC, DOCX, and other text-based document formats. The system extracts text content from these documents to provide intelligent answers to your questions.",
                },
              },
              {
                "@type": "Question",
                name: "How does InQDoc work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "InQDoc uses advanced AI models to analyze your uploaded documents. When you ask a question, the system searches through the document content to find relevant information and generates a comprehensive answer based on the document context.",
                },
              },
              {
                "@type": "Question",
                name: "Which AI models power InQDoc?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "InQDoc leverages multiple state-of-the-art AI models including Gemini 1.5 Flash, ChatGPT, Deepseek Chat, and Meta Llama 3.1. The system automatically selects the best model for your query or allows you to choose a specific model.",
                },
              },
              {
                "@type": "Question",
                name: "Is my document data secure?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, InQDoc prioritizes data security. Your documents are processed securely, and we implement industry-standard security measures to protect your information. Documents are not stored permanently unless explicitly requested.",
                },
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-6 space-y-12">
          {/* Hero Section */}
          <section aria-labelledby="hero-title" className="py-12">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1
                id="hero-title"
                className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-tight"
              >
                Intelligent Document Analysis Powered by AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your documents and get instant, intelligent answers to
                your questions using state-of-the-art AI models. InQDoc makes
                document analysis simple, fast, and insightful.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Link href="/chat">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* Performance Stats */}
          <section aria-labelledby="stats-title" className="py-8">
            <div className="max-w-5xl mx-auto">
              <h2
                id="stats-title"
                className="text-3xl font-bold text-center mb-8"
              >
                AI Model Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Gemini 1.5 Flash</CardTitle>
                    <CardDescription>Fastest Response Time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">~0.9s</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">ChatGPT</CardTitle>
                    <CardDescription>Balanced Performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">~4.4s</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Deepseek Chat</CardTitle>
                    <CardDescription>Comprehensive Analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">~10.6s</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            aria-labelledby="features-title"
            className="py-12"
          >
            <h2
              id="features-title"
              className="text-3xl font-bold text-center mb-8"
            >
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Document Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Extract insights from complex documents with AI-powered
                    analysis that understands document structure and content
                    relationships.
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Intelligent Q&A</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ask natural language questions about your documents and
                    receive accurate, context-aware answers from advanced AI
                    models.
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">
                      Multiple AI Models
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Choose from various state-of-the-art AI models including
                    Gemini, ChatGPT, Deepseek, and Meta Llama for optimal
                    results.
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart4 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">
                      Performance Metrics
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track response times, accuracy, and other performance
                    metrics to optimize your document analysis workflow.
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Secure Processing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your documents are processed with industry-standard security
                    measures to ensure data privacy and protection.
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layers className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">
                      Multi-Document Support
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload and analyze multiple documents simultaneously, with
                    AI that maintains context across different files.
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link
                    href="/chat"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    Try it now <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Performance Metrics Dashboard */}
          {showMetrics && (
            <section
              id="metrics-panel"
              ref={metricsRef}
              className="scroll-mt-20 py-8 bg-muted/30 rounded-lg"
              aria-labelledby="metrics-title"
            >
              <div className="max-w-5xl mx-auto">
                <h2
                  id="metrics-title"
                  className="text-3xl font-bold text-center mb-8"
                >
                  Detailed Performance Metrics
                </h2>
                <PerformanceMetrics metricsData={metricsData} />
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section aria-labelledby="faq-title" className="py-12">
            <div className="max-w-3xl mx-auto">
              <h2
                id="faq-title"
                className="text-3xl font-semibold mb-6 text-center"
              >
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    What file formats does InQDoc support?
                  </AccordionTrigger>
                  <AccordionContent>
                    InQDoc supports PDF, TXT, DOC, DOCX, and other text-based
                    document formats. The system extracts text content from
                    these documents to provide intelligent answers to your
                    questions.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How does InQDoc work?</AccordionTrigger>
                  <AccordionContent>
                    InQDoc uses advanced AI models to analyze your uploaded
                    documents. When you ask a question, the system searches
                    through the document content to find relevant information
                    and generates a comprehensive answer based on the document
                    context.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Which AI models power InQDoc?
                  </AccordionTrigger>
                  <AccordionContent>
                    InQDoc leverages multiple state-of-the-art AI models
                    including Gemini 1.5 Flash, ChatGPT, Deepseek Chat, and Meta
                    Llama 3.1. The system automatically selects the best model
                    for your query or allows you to choose a specific model.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Is my document data secure?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, InQDoc prioritizes data security. Your documents are
                    processed securely, and we implement industry-standard
                    security measures to protect your information. Documents are
                    not stored permanently unless explicitly requested.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    How accurate are the answers?
                  </AccordionTrigger>
                  <AccordionContent>
                    InQDoc provides highly accurate answers based on the content
                    of your documents. The system uses context-aware AI models
                    that understand document structure and content
                    relationships. However, accuracy depends on the quality and
                    clarity of the uploaded document.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    Can I use InQDoc for multiple documents?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, you can upload and analyze multiple documents. The
                    system maintains context across documents when answering
                    questions, allowing for comprehensive analysis of related
                    information across different files.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section
            aria-labelledby="cta-title"
            className="py-12 bg-primary/5 rounded-xl"
          >
            <div className="max-w-3xl mx-auto text-center space-y-6 p-6">
              <h2
                id="cta-title"
                className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              >
                Ready to analyze your documents?
              </h2>
              <p className="text-lg text-muted-foreground">
                Get started with InQDoc today and unlock the power of AI-driven
                document analysis.
              </p>
              <Link href="/chat">
                <Button size="lg" className="mt-4">
                  Start Analyzing Documents
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-muted/20 py-6 mt-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">InQDoc</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered document analysis for instant, intelligent answers to
                your questions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6">
            <p className="text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} InQDoc - AI-Powered Document
              Analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
