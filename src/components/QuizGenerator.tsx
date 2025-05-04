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
import {
  AlertCircle,
  CheckCircle2,
  BadgeHelp,
  Zap,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TemplateSelector from "./quiz/TemplateSelector";
import TemplatePreview from "./quiz/TemplatePreview";
import { getTemplateById } from "@/lib/quiz-templates";

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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [quizSize, setQuizSize] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [templateId, setTemplateId] = useState<string>("general");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedQuizId, setGeneratedQuizId] = useState<string | null>(null);

  // Update selected document when ID changes
  const handleDocumentSelect = (docId: string) => {
    setSelectedDocumentId(docId);
    const doc = documents.find((d) => d.id === docId) || null;
    setSelectedDocument(doc);

    // Auto-recommend template based on document filename if available
    if (doc && doc.filename) {
      // Template recommendation logic handled in TemplateSelector component
    }
  };

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
      // Get the template info to include in the request
      const template = getTemplateById(templateId);

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          quizSize,
          difficulty,
          templateId,
          templateInfo: template
            ? {
                name: template.name,
                focusAreas: template.focusAreas,
                questionTypes: template.questionTypes,
                promptModifier: template.promptModifier,
              }
            : null,
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

  // Get color and icon for difficulty
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case "medium":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200";
      case "hard":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      default:
        return "";
    }
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "easy":
        return <Zap className="h-4 w-4 mr-2" />;
      case "medium":
        return <Badge className="h-4 w-4 mr-2" />;
      case "hard":
        return <Trophy className="h-4 w-4 mr-2" />;
      default:
        return null;
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
            onValueChange={handleDocumentSelect}
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

        {selectedDocumentId && (
          <>
            {/* Template Selection */}
            <Separator className="my-4" />

            <TemplateSelector
              documentFilename={selectedDocument?.filename || ""}
              onTemplateSelect={setTemplateId}
              selectedTemplateId={templateId}
              disabled={isGenerating}
            />

            {/* Template Preview Toggle */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                See how this template affects question generation
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs flex items-center"
                disabled={isGenerating}
              >
                {showPreview ? (
                  <>
                    Hide Preview <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show Preview <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Template Preview */}
            {showPreview && (
              <div className="mt-2">
                <TemplatePreview templateId={templateId} />
              </div>
            )}

            <Separator className="my-4" />

            {/* Quiz Size */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label htmlFor="quiz-size">
                  Number of Questions: {quizSize}
                </Label>
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
              <div className="flex items-center">
                <Label htmlFor="difficulty-select" className="mr-2">
                  Difficulty
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BadgeHelp className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[220px] text-sm">
                        Select the overall difficulty of your quiz. The AI will
                        generate questions matching this level.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex justify-start items-center ${
                        difficulty === "easy" ? getDifficultyColor("easy") : ""
                      } ${
                        difficulty === "easy" ? "border-2 border-green-500" : ""
                      }`}
                      onClick={() => setDifficulty("easy")}
                      disabled={isGenerating}
                    >
                      {getDifficultyIcon("easy")}
                      Easy
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Easy Difficulty</h4>
                      <p className="text-sm">
                        Basic recall and comprehension questions. Ideal for
                        beginners or initial assessment of document
                        understanding.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex justify-start items-center ${
                        difficulty === "medium"
                          ? getDifficultyColor("medium")
                          : ""
                      } ${
                        difficulty === "medium"
                          ? "border-2 border-amber-500"
                          : ""
                      }`}
                      onClick={() => setDifficulty("medium")}
                      disabled={isGenerating}
                    >
                      {getDifficultyIcon("medium")}
                      Medium
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Medium Difficulty
                      </h4>
                      <p className="text-sm">
                        Application and analysis questions requiring deeper
                        understanding of concepts covered in the document.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex justify-start items-center ${
                        difficulty === "hard" ? getDifficultyColor("hard") : ""
                      } ${
                        difficulty === "hard" ? "border-2 border-red-500" : ""
                      }`}
                      onClick={() => setDifficulty("hard")}
                      disabled={isGenerating}
                    >
                      {getDifficultyIcon("hard")}
                      Hard
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Hard Difficulty</h4>
                      <p className="text-sm">
                        Evaluation and synthesis questions requiring deep
                        understanding and connection between concepts in the
                        document.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </>
        )}

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
            setSelectedDocument(null);
            setQuizSize(5);
            setDifficulty("medium");
            setTemplateId("general");
            setShowPreview(false);
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
