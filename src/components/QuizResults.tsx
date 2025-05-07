"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClipboardCopy, Share2, Check, X, Clock, Award } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Types
interface QuizResponse {
  id: string;
  questionText: string;
  answerType: string;
  options: string[] | null;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
}

interface QuizResultData {
  id: string;
  score: number;
  earnedPoints: number;
  totalPoints: number;
  feedback: string;
  timeTaken: number | null;
  completedAt: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    document: {
      id: string;
      filename: string;
    };
  };
  user: {
    name: string | null;
    email: string | null;
  };
  responses: QuizResponse[];
  isShared: boolean;
  shareUrl: string | null;
}

interface QuizResultsProps {
  quizId: string;
  resultId: string;
}

export default function QuizResults({ quizId, resultId }: QuizResultsProps) {
  const router = useRouter();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [sharingUpdated, setSharingUpdated] = useState(false);

  // Fetch quiz result
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(
          `/api/quiz/${quizId}/results?resultId=${resultId}`
        );
        if (!response.ok) {
          throw new Error("Failed to load result");
        }
        const data = await response.json();
        setResult(data);
        setIsShared(data.isShared);
        if (data.isShared && data.shareUrl) {
          const baseUrl = window.location.origin;
          setShareUrl(
            `${baseUrl}/quiz/${quizId}/results?resultId=${resultId}&shareCode=${data.shareUrl}`
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId, resultId]);

  // Update sharing settings
  const handleSharingChange = async (share: boolean) => {
    if (!result) return;

    try {
      const response = await fetch(`/api/quiz/${quizId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultId: result.id,
          isShared: share,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing settings");
      }

      const data = await response.json();
      setIsShared(data.isShared);
      if (data.isShared && data.shareUrl) {
        const baseUrl = window.location.origin;
        setShareUrl(
          `${baseUrl}/quiz/${quizId}/results?resultId=${resultId}&shareCode=${data.shareUrl}`
        );
      } else {
        setShareUrl(null);
      }
      setSharingUpdated(true);

      // Auto-hide confirmation after 3 seconds
      setTimeout(() => {
        setSharingUpdated(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update sharing settings"
      );
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  // Format time taken
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} min${mins !== 1 ? "s" : ""} ${secs} sec${
        secs !== 1 ? "s" : ""
      }`;
    }
    return `${secs} second${secs !== 1 ? "s" : ""}`;
  };

  // Loading state
  if (loading) {
    return (
      <Card className="w-full" data-testid="quiz-results-loading">
        <CardHeader>
          <CardTitle>Loading Results...</CardTitle>
          <CardDescription>
            Please wait while we load your quiz results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !result) {
    return (
      <Card className="w-full" data-testid="quiz-results-error">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            There was a problem loading the quiz results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || "Result data not available"}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Calculate counts
  const correctCount = result.responses.filter((r) => r.isCorrect).length;
  const incorrectCount = result.responses.length - correctCount;

  return (
    <Card className="w-full" data-testid="quiz-results">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="text-2xl" data-testid="results-quiz-title">
              {result.quiz.title} - Results
            </CardTitle>
            <CardDescription data-testid="results-document-name">
              From document: {result.quiz.document.filename}
            </CardDescription>
          </div>
          <div
            className="flex flex-col items-center"
            data-testid="results-score-container"
          >
            <div
              className="text-3xl font-bold"
              data-testid="results-score-percentage"
            >
              {result.score.toFixed(1)}%
            </div>
            <div
              className="text-sm text-muted-foreground"
              data-testid="results-score-points"
            >
              {result.earnedPoints} / {result.totalPoints} points
            </div>
          </div>
        </div>

        {/* Result stats */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
          data-testid="results-stats"
        >
          <div
            className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-md"
            data-testid="results-correct-count"
          >
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">{correctCount} Correct</div>
              <div className="text-sm text-muted-foreground">
                {((correctCount / result.responses.length) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-md"
            data-testid="results-incorrect-count"
          >
            <X className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-medium">{incorrectCount} Incorrect</div>
              <div className="text-sm text-muted-foreground">
                {((incorrectCount / result.responses.length) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md"
            data-testid="results-time-taken"
          >
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">Time Taken</div>
              <div className="text-sm text-muted-foreground">
                {result.timeTaken
                  ? formatTime(result.timeTaken)
                  : "Not recorded"}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-50">
            <CardContent className="pt-6 flex items-center gap-4">
              <Award className="w-10 h-10 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p
                  className="text-xl font-semibold"
                  data-testid="results-score"
                >
                  {result.score.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="pt-6 flex items-center gap-4">
              <Check className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Correct</p>
                <p
                  className="text-xl font-semibold"
                  data-testid="results-correct-count"
                >
                  {correctCount} / {result.responses.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardContent className="pt-6 flex items-center gap-4">
              <Clock className="w-10 h-10 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
                <p
                  className="text-xl font-semibold"
                  data-testid="results-time-taken"
                >
                  {result.timeTaken ? formatTime(result.timeTaken) : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share controls */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex flex-col gap-1">
            <div className="font-medium">Share this quiz result</div>
            <div className="text-sm text-muted-foreground">
              Allow others to view your results with a link
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="sharing"
              checked={isShared}
              onCheckedChange={handleSharingChange}
              data-testid="results-share-switch"
            />
            <Label htmlFor="sharing">
              {isShared ? "Sharing enabled" : "Sharing disabled"}
            </Label>
          </div>
        </div>

        {shareUrl && (
          <div className="flex items-center p-4 bg-slate-50 rounded-lg">
            <div
              className="flex-1 text-sm truncate"
              data-testid="results-share-url"
            >
              {shareUrl}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareUrl}
              className="ml-2"
              data-testid="results-copy-button"
            >
              <ClipboardCopy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              data-testid="results-share-button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        {sharingUpdated && (
          <div className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
            Sharing settings updated successfully.
          </div>
        )}

        {/* Questions and answers */}
        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" data-testid="results-tab-all">
              All ({result.responses.length})
            </TabsTrigger>
            <TabsTrigger value="correct" data-testid="results-tab-correct">
              Correct ({correctCount})
            </TabsTrigger>
            <TabsTrigger value="incorrect" data-testid="results-tab-incorrect">
              Incorrect ({incorrectCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Accordion
              type="multiple"
              className="w-full space-y-4"
              defaultValue={["question-0"]}
            >
              {result.responses.map((response, index) => (
                <ResultItem
                  key={index}
                  response={response}
                  index={index}
                  defaultOpen={index === 0}
                />
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="correct" className="mt-4">
            <Accordion type="multiple" className="w-full space-y-4">
              {result.responses
                .filter((r) => r.isCorrect)
                .map((response, index) => (
                  <ResultItem
                    key={index}
                    response={response}
                    index={index}
                    defaultOpen={index === 0}
                  />
                ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="incorrect" className="mt-4">
            <Accordion type="multiple" className="w-full space-y-4">
              {result.responses
                .filter((r) => !r.isCorrect)
                .map((response, index) => (
                  <ResultItem
                    key={index}
                    response={response}
                    index={index}
                    defaultOpen={index === 0}
                  />
                ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/docs")}
          data-testid="results-back-button"
        >
          Back to Documents
        </Button>
        <Button
          onClick={() =>
            router.push(`/quiz/new?documentId=${result.quiz.document.id}`)
          }
          data-testid="results-new-quiz-button"
        >
          Create New Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}

// Individual result item component
function ResultItem({
  response,
  index,
  defaultOpen,
}: {
  response: QuizResponse;
  index: number;
  defaultOpen: boolean;
}) {
  return (
    <AccordionItem
      value={`question-${index}`}
      className="border rounded-lg p-2"
      data-testid={`results-question-${index}`}
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex items-center justify-between w-full px-2 text-left">
          <div className="flex items-center gap-3">
            {response.isCorrect ? (
              <Badge
                className="bg-green-100 text-green-700 hover:bg-green-100"
                data-testid={`results-question-${index}-status`}
              >
                <Check className="mr-1 h-3 w-3" />
                Correct
              </Badge>
            ) : (
              <Badge
                className="bg-red-100 text-red-700 hover:bg-red-100"
                data-testid={`results-question-${index}-status`}
              >
                <X className="mr-1 h-3 w-3" />
                Incorrect
              </Badge>
            )}
            <span className="text-base font-medium line-clamp-1">
              {response.questionText}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Question:
            </p>
            <p className="text-base">{response.questionText}</p>
          </div>

          {response.answerType === "multiple_choice" && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Options:
              </p>
              <ul className="ml-4 space-y-1">
                {response.options?.map((option, i) => (
                  <li
                    key={i}
                    className={`flex items-center ${
                      option === response.correctAnswer
                        ? "text-green-600 font-medium"
                        : option === response.userAnswer &&
                          option !== response.correctAnswer
                        ? "text-red-600 line-through"
                        : ""
                    }`}
                    data-testid={`results-question-${index}-option-${i}`}
                  >
                    {option === response.correctAnswer && (
                      <Check className="mr-1 h-3 w-3 text-green-500" />
                    )}
                    {option === response.userAnswer &&
                      option !== response.correctAnswer && (
                        <X className="mr-1 h-3 w-3 text-red-500" />
                      )}
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Your Answer:
              </p>
              <p
                className={`rounded px-2 py-1 ${
                  response.isCorrect
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
                data-testid={`results-question-${index}-user-answer`}
              >
                {response.userAnswer || "(No answer provided)"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Correct Answer:
              </p>
              <p
                className="bg-green-50 text-green-700 rounded px-2 py-1"
                data-testid={`results-question-${index}-correct-answer`}
              >
                {response.correctAnswer}
              </p>
            </div>
          </div>

          {response.explanation && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Explanation:
              </p>
              <p
                className="text-sm bg-blue-50 p-3 rounded"
                data-testid={`results-question-${index}-explanation`}
              >
                {response.explanation}
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
