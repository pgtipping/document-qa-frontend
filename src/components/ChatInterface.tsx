"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import ModelSelector, { ModelSelection } from "@/components/ModelSelector";
import { triggerMetricsRefresh } from "@/hooks/useMetrics";

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
}

export default function ChatInterface({ onSubmit }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelSelection | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleModelSelect = useCallback((selection: ModelSelection) => {
    setCurrentModel(selection);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
    if (!input.trim() || loading) return;

    const documentId = localStorage.getItem("currentDocumentId");
    if (!documentId) {
      toast({
        title: "Error",
        description: "Please upload a document first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input.trim(),
          document_id: documentId,
          model: currentModel?.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || "Failed to get answer");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Trigger metrics refresh after successful response
      triggerMetricsRefresh();
    } catch (error) {
      console.error("Error asking question:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get answer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <ModelSelector onModelSelect={handleModelSelect} />
      </div>
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

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            disabled={loading}
            className="flex-1 bg-background"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            variant="default"
            className="px-4"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
