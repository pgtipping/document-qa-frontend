"use client";

import { useState, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { MessageSquare, Upload, MessageCircle } from "lucide-react";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const feedbackRef = useRef<HTMLTextAreaElement>(null);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chat submission logic would go here
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback cannot be empty",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Here you would send the feedback to your backend
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    });
    setFeedbackText("");
  };

  return (
    <main className="container mx-auto p-6 space-y-8">
      <section aria-labelledby="chat-title" className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1
            id="chat-title"
            className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4"
          >
            Document Analysis & Chat
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your documents and get instant, intelligent answers to your
            questions
          </p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle>InQDoc Document Analysis</CardTitle>
            <CardDescription>
              Chat with your documents, upload new files, or provide feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger
                  value="feedback"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Feedback</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-6">
                <CardDescription className="mb-6">
                  Ask questions about your uploaded documents and get AI-powered
                  answers
                </CardDescription>
                <ChatInterface onSubmit={handleChatSubmit} />
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <CardDescription className="mb-6">
                  Upload your documents to analyze and ask questions about
                </CardDescription>
                <FileUpload />
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    Document Guidelines:
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Supported formats: PDF, TXT, DOC, DOCX</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>
                      • For best results, ensure documents have clear, readable
                      text
                    </li>
                    <li>
                      • Multiple documents can be uploaded for cross-document
                      analysis
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <CardDescription className="mb-6">
                  Share your thoughts, report issues, or suggest improvements
                </CardDescription>
                <div className="space-y-4">
                  <textarea
                    ref={feedbackRef}
                    placeholder="Your feedback helps us improve InQDoc. Tell us what you think or report any issues you've encountered."
                    className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={feedbackText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFeedbackText(e.target.value)
                    }
                  />
                  <Button
                    onClick={handleFeedbackSubmit}
                    className="w-full sm:w-auto"
                  >
                    Submit Feedback
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="bg-muted/20 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Powered by multiple AI models including Gemini 1.5 Flash, ChatGPT,
              Deepseek Chat, and Meta Llama 3.1
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
