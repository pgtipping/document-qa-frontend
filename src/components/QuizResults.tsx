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
import { Progress } from "@/components/ui/progress";
import {
  ClipboardCopy,
  Download,
  Share2,
  Check,
  X,
  Clock,
  Award,
} from "lucide-react";
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
      <Card className="w-full">
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
      <Card className="w-full">
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="text-2xl">
              {result.quiz.title} - Results
            </CardTitle>
            <CardDescription>
              From document: {result.quiz.document.filename}
            </CardDescription>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{result.score.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {result.earnedPoints} / {result.totalPoints} points
            </div>
          </div>
        </div>

        {/* Result stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-md">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-semibold">
                {correctCount} Correct
              </div>
              <div className="text-xs text-muted-foreground">
                {((correctCount / result.responses.length) * 100).toFixed(0)}%
                of answers
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-md">
            <X className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-sm font-semibold">
                {incorrectCount} Incorrect
              </div>
              <div className="text-xs text-muted-foreground">
                {((incorrectCount / result.responses.length) * 100).toFixed(0)}%
                of answers
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-semibold">
                {result.timeTaken
                  ? formatTime(result.timeTaken)
                  : "Time not recorded"}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.timeTaken && result.responses.length
                  ? `~${Math.round(
                      result.timeTaken / result.responses.length
                    )}s per question`
                  : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-md">
          <div className="flex items-start gap-2">
            <Award className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <div className="text-sm font-semibold">Feedback</div>
              <div className="text-sm">{result.feedback}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="answers">
          <TabsList className="mb-4">
            <TabsTrigger value="answers">Answers</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="answers">
            <Accordion type="single" collapsible className="w-full">
              {result.responses.map((response, index) => (
                <AccordionItem key={response.id} value={`q-${index}`}>
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <Badge
                        variant={response.isCorrect ? "success" : "destructive"}
                        className="shrink-0"
                      >
                        {response.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                      <span className="text-sm font-medium">
                        {index + 1}.{" "}
                        {response.questionText.length > 60
                          ? `${response.questionText.substring(0, 60)}...`
                          : response.questionText}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-l-2 pl-4 ml-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold">Question:</div>
                      <div className="text-sm">{response.questionText}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-green-700">
                          Correct Answer:
                        </div>
                        <div className="text-sm p-2 bg-green-50 border border-green-100 rounded">
                          {response.correctAnswer}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-blue-700">
                          Your Answer:
                        </div>
                        <div
                          className={`text-sm p-2 ${
                            response.isCorrect
                              ? "bg-green-50 border border-green-100"
                              : "bg-red-50 border border-red-100"
                          } rounded`}
                        >
                          {response.userAnswer || "<No answer provided>"}
                        </div>
                      </div>
                    </div>

                    {response.explanation && (
                      <div>
                        <div className="text-sm font-semibold">
                          Explanation:
                        </div>
                        <div className="text-sm">{response.explanation}</div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="summary">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Score Breakdown</h3>
                <div className="w-full bg-gray-100 rounded-full h-4 mb-1">
                  <div
                    className="bg-green-600 h-4 rounded-full"
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>0%</span>
                  <span>{result.score.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Completion Time</h3>
                {result.timeTaken ? (
                  <p>{formatTime(result.timeTaken)}</p>
                ) : (
                  <p>Time not recorded</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Completed At</h3>
                <p>{new Date(result.completedAt).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-results">Share Results</Label>
                  <div className="flex items-center gap-2">
                    {sharingUpdated && (
                      <span className="text-xs text-green-600">✓ Updated</span>
                    )}
                    <Switch
                      id="share-results"
                      checked={isShared}
                      onCheckedChange={handleSharingChange}
                    />
                  </div>
                </div>

                {isShared && shareUrl && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded text-sm">
                    <div className="truncate flex-1">{shareUrl}</div>
                    <Button variant="outline" size="sm" onClick={copyShareUrl}>
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between gap-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Share Your Quiz Results</AlertDialogTitle>
                <AlertDialogDescription>
                  {isShared
                    ? "Your quiz results are currently shared. Anyone with the link can view them."
                    : "Your quiz results are currently private. Enable sharing to get a link."}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex items-center justify-between py-4">
                <Label htmlFor="share-dialog-switch">Enable sharing</Label>
                <Switch
                  id="share-dialog-switch"
                  checked={isShared}
                  onCheckedChange={handleSharingChange}
                />
              </div>

              {isShared && shareUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded text-sm">
                  <div className="truncate flex-1">{shareUrl}</div>
                  <Button variant="outline" size="sm" onClick={copyShareUrl}>
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                {isShared && shareUrl && (
                  <AlertDialogAction asChild>
                    <Button onClick={copyShareUrl}>Copy Link</Button>
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button
          variant="default"
          onClick={() =>
            router.push(`/quiz/new?documentId=${result.quiz.document.id}`)
          }
        >
          Create New Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
