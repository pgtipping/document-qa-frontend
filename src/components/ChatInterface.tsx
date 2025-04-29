"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { triggerMetricsRefresh } from "@/hooks/useMetrics";
import { trackEvent } from "@/lib/analytics";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles } from "lucide-react"; // Import Sparkles icon

// Function to format message content with proper styling
const formatMessageContent = (content: string) => {
  // Split content into paragraphs
  const paragraphs = content.split("\n\n");

  return paragraphs.map((paragraph, i) => {
    // Check if paragraph is a bullet point list
    if (paragraph.includes("\n- ")) {
      const items = paragraph.split("\n- ");
      return (
        <div key={i} className="space-y-1">
          {items[0] && <p>{items[0]}</p>}
          <ul className="list-disc list-inside space-y-1">
            {items.slice(1).map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    // Regular paragraph
    return <p key={i}>{paragraph}</p>;
  });
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  onSubmit?: (e: React.FormEvent) => void;
  selectedDocumentIds?: string[]; // Add prop for selected document IDs
}

export default function ChatInterface({
  onSubmit,
  selectedDocumentIds = [], // Default to empty array if not provided
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for sending messages
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false); // Loading state for generating questions
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Handler for generating question and putting it in the input field
  const handleGenerateQuestion = async () => {
    if (isGeneratingQuestion || loading || !isAuthenticated) return;

    setIsGeneratingQuestion(true);
    trackEvent("generate_question_clicked");
    const startTime = performance.now();

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: null, // Indicate question generation mode
          documentIds: selectedDocumentIds,
          mode: "model",
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to generate question.";
        try {
          if (response.status === 401) {
            errorMsg = "Authentication error. Please log in again.";
          } else if (response.status === 403) {
            errorMsg = "Forbidden: You don't have permission for this action.";
          } else {
            const errorData = await response.json();
            errorMsg =
              errorData.error ||
              errorData.detail ||
              `API Error: ${response.status}`;
          }
        } catch {
          errorMsg = `API Error: ${response.status} - ${
            response.statusText || "Failed to generate question"
          }`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const responseTime = performance.now() - startTime;

      if (data.generatedQuestion) {
        setInput(data.generatedQuestion); // Set the input field with the generated question
        trackEvent("question_generated", {
          responseTime,
          questionLength: data.generatedQuestion.length,
        });
        toast({
          title: "Question Generated",
          description: "Suggested question added to input field.",
        });
      } else {
        // Handle case where backend didn't return a generated question unexpectedly
        throw new Error("Backend did not return a generated question.");
      }
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error("Error generating question:", error);
      trackEvent("error_occurred", {
        errorType: "generate_question_error",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to generate question",
        timeTaken: errorTime,
      });
      toast({
        title: "Error Generating Question",
        description:
          error instanceof Error
            ? error.message
            : "Could not generate a question.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Handles submitting the user's question (from input field)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }

    if (!input.trim() || loading || isGeneratingQuestion || !isAuthenticated)
      return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim(); // Capture input before clearing
    setInput(""); // Clear input

    setLoading(true);

    trackEvent("question_asked", {
      questionLength: currentInput.length,
      mode: "user",
    });

    const startTime = performance.now();

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentInput, // Send the actual user question
          documentIds: selectedDocumentIds,
          mode: "user", // Always user mode here
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to get answer.";
        try {
          if (response.status === 401) {
            errorMsg = "Authentication error. Please log in again.";
          } else if (response.status === 403) {
            errorMsg = "Forbidden: You don't have permission for this action.";
          } else {
            const errorData = await response.json();
            errorMsg =
              errorData.error ||
              errorData.detail ||
              `API Error: ${response.status}`;
          }
        } catch {
          errorMsg = `API Error: ${response.status} - ${
            response.statusText || "Failed to get answer"
          }`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const responseTime = performance.now() - startTime;

      // No need to handle generatedQuestion here anymore

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      trackEvent("answer_received", {
        responseTime,
        answerLength: data.answer.length,
        mode: "user",
      });

      // Trigger metrics refresh after successful response
      triggerMetricsRefresh();
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error("Error asking question:", error);

      trackEvent("error_occurred", {
        errorType: "question_error",
        errorMessage:
          error instanceof Error ? error.message : "Failed to get answer",
        timeTaken: errorTime,
        mode: "user",
      });

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to get answer",
        variant: "destructive",
      });
      // Optional: Add the failed user message back to input?
      // setInput(currentInput);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Start a Conversation</h3>
              <p className="text-muted-foreground">
                Upload a document and ask questions to get started. I&apos;ll
                help you understand your document better.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-full",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-[15px] leading-relaxed space-y-2">
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {isLoadingSession ? (
        <div className="p-4 text-center text-muted-foreground">
          Loading session...
        </div>
      ) : !isAuthenticated ? (
        <div className="p-4 text-center text-muted-foreground">
          Please{" "}
          <Link href="/api/auth/signin" className="underline text-primary">
            log in
          </Link>{" "}
          to use the chat.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your document..."
              disabled={loading || !isAuthenticated}
              className="flex-1 bg-background"
            />
            <Button
              type="submit"
              disabled={
                loading ||
                isGeneratingQuestion ||
                !input.trim() ||
                !isAuthenticated
              }
              variant="default"
              className="px-4"
            >
              {loading ? "Sending..." : "Send"}
            </Button>
            {/* Generate Question Button */}
            <Button
              type="button"
              onClick={handleGenerateQuestion}
              disabled={loading || isGeneratingQuestion || !isAuthenticated}
              variant="outline"
              size="icon"
              title="Generate question based on document"
              className="shrink-0"
            >
              {isGeneratingQuestion ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="sr-only">Generate Question</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
