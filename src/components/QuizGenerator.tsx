"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Document = {
  id: string;
  filename: string;
};

interface QuizGeneratorProps {
  documents: Document[];
  onGenerateStart?: () => void;
  onGenerateComplete?: (quizId: string) => void;
}

export default function QuizGenerator({
  documents,
  onGenerateStart,
  onGenerateComplete,
}: QuizGeneratorProps) {
  const router = useRouter();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [quizSize, setQuizSize] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedQuizId, setGeneratedQuizId] = useState<string | null>(null);

  // Handle quiz generation
  const handleGenerateQuiz = async () => {
    if (!selectedDocumentId) {
      setError("Please select a document for the quiz");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    if (onGenerateStart) {
      onGenerateStart();
    }

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          quizSize,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setSuccess(
        `Quiz "${data.title}" generated successfully with ${data.questionCount} questions!`
      );
      setGeneratedQuizId(data.id);

      if (onGenerateComplete) {
        onGenerateComplete(data.id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenQuiz = () => {
    if (generatedQuizId) {
      router.push(`/quiz/${generatedQuizId}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Quiz</CardTitle>
        <CardDescription>
          Create a quiz from your documents to test understanding
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Document Selection */}
        <div className="space-y-2">
          <Label htmlFor="document-select">Select Document</Label>
          <Select
            value={selectedDocumentId}
            onValueChange={setSelectedDocumentId}
            disabled={isGenerating}
          >
            <SelectTrigger id="document-select">
              <SelectValue placeholder="Select a document" />
            </SelectTrigger>
            <SelectContent>
              {documents.length === 0 ? (
                <SelectItem value="no-docs" disabled>
                  No documents available
                </SelectItem>
              ) : (
                documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.filename}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Quiz Size */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="quiz-size">Number of Questions: {quizSize}</Label>
          </div>
          <Slider
            id="quiz-size"
            defaultValue={[5]}
            min={3}
            max={10}
            step={1}
            onValueChange={(values) => setQuizSize(values[0])}
            disabled={isGenerating}
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty-select">Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={setDifficulty}
            disabled={isGenerating}
          >
            <SelectTrigger id="difficulty-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert
            variant="default"
            className="bg-green-50 text-green-800 border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedDocumentId("");
            setQuizSize(5);
            setDifficulty("medium");
            setError(null);
            setSuccess(null);
            setGeneratedQuizId(null);
          }}
          disabled={isGenerating}
        >
          Reset
        </Button>
        <div className="space-x-2">
          {generatedQuizId && (
            <Button onClick={handleOpenQuiz}>Open Quiz</Button>
          )}
          <Button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !selectedDocumentId}
          >
            {isGenerating ? (
              <>
                <Skeleton className="h-4 w-4 rounded-full mr-2" />
                Generating...
              </>
            ) : (
              "Generate Quiz"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
