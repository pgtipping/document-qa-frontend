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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { CountdownTimer } from "@/ui/CountdownTimer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Zap, Trophy, Badge as BadgeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define types
interface Question {
  id: string;
  questionText: string;
  answerType: "multiple_choice" | "true_false" | "short_answer";
  options: string[] | null;
  points: number;
  difficulty: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number | null;
  document: {
    id: string;
    filename: string;
  };
  questions: Question[];
}

interface UserAnswer {
  questionId: string;
  userAnswer: string;
}

interface QuizDisplayProps {
  quizId: string;
  onComplete?: (resultId: string) => void;
}

export default function QuizDisplay({ quizId, onComplete }: QuizDisplayProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Helper function to get difficulty badge styles and icon
  const getDifficultyBadge = (difficulty: string) => {
    let color = "";
    let icon = null;

    switch (difficulty) {
      case "easy":
        color = "bg-green-100 text-green-700 hover:bg-green-100";
        icon = <Zap className="h-3 w-3 mr-1" />;
        break;
      case "medium":
        color = "bg-amber-100 text-amber-700 hover:bg-amber-100";
        icon = <BadgeIcon className="h-3 w-3 mr-1" />;
        break;
      case "hard":
        color = "bg-red-100 text-red-700 hover:bg-red-100";
        icon = <Trophy className="h-3 w-3 mr-1" />;
        break;
      default:
        color = "bg-slate-100 text-slate-700";
        break;
    }

    return { color, icon };
  };

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${quizId}`);
        if (!response.ok) {
          throw new Error("Failed to load quiz");
        }
        const data = await response.json();
        setQuiz(data);

        // Initialize user answers
        const initialAnswers = data.questions.map((q: Question) => ({
          questionId: q.id,
          userAnswer: "",
        }));
        setUserAnswers(initialAnswers);

        // Set timer if quiz has a time limit
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
        }

        setStartTime(Date.now());
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Handle timer completion
  const handleTimerComplete = () => {
    submitQuiz();
  };

  // Handle time warning
  const handleTimeWarning = () => {
    setShowTimeWarning(true);
    setTimeout(() => setShowTimeWarning(false), 5000); // Hide after 5 seconds
  };

  // Handle answer change
  const handleAnswerChange = (answer: string) => {
    if (!quiz) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = {
      questionId: quiz.questions[currentQuestionIndex].id,
      userAnswer: answer,
    };
    setUserAnswers(newAnswers);
  };

  // Navigation
  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!quiz || submitting) return;

    setSubmitting(true);

    try {
      // Calculate time taken
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const response = await fetch(`/api/quiz/${quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: userAnswers,
          timeTaken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const result = await response.json();

      // Call onComplete callback with the result ID
      if (onComplete) {
        onComplete(result.resultId);
      } else {
        // Navigate to results page
        router.push(`/quiz/${quizId}/results?resultId=${result.resultId}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during submission"
      );
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Quiz...</CardTitle>
          <CardDescription>Please wait while we load your quiz</CardDescription>
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
  if (error || !quiz) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            There was a problem loading the quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || "Quiz data not available"}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Current question
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex]?.userAnswer || "";
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{quiz.title}</CardTitle>
          {timeRemaining !== null && (
            <CountdownTimer
              initialSeconds={timeRemaining}
              onComplete={handleTimerComplete}
              warningThreshold={120} // 2 minutes warning
              dangerThreshold={60} // 1 minute danger
              size="lg"
              onWarningThreshold={() => handleTimeWarning()}
            />
          )}
        </div>
        <CardDescription>{quiz.description}</CardDescription>

        {/* Time Warning Alert */}
        {showTimeWarning && (
          <Alert className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Time is running out!</AlertTitle>
            <AlertDescription>
              You have less than 2 minutes remaining to complete this quiz.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <div className="pt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {currentQuestion.questionText}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {currentQuestion.points} point
              {currentQuestion.points !== 1 ? "s" : ""}
            </span>
            <span>•</span>
            <span>
              {currentQuestion.answerType === "multiple_choice"
                ? "Choose one option"
                : currentQuestion.answerType === "true_false"
                ? "Select True or False"
                : "Enter your answer"}
            </span>
            <span>•</span>
            {currentQuestion.difficulty && (
              <Badge
                variant="outline"
                className={`${
                  getDifficultyBadge(currentQuestion.difficulty).color
                } flex items-center`}
              >
                {getDifficultyBadge(currentQuestion.difficulty).icon}
                {currentQuestion.difficulty.charAt(0).toUpperCase() +
                  currentQuestion.difficulty.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Answer Input */}
        {currentQuestion.answerType === "multiple_choice" && (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              {currentQuestion.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {currentQuestion.answerType === "true_false" && (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id="true" />
                <Label htmlFor="true" className="cursor-pointer">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id="false" />
                <Label htmlFor="false" className="cursor-pointer">
                  False
                </Label>
              </div>
            </div>
          </RadioGroup>
        )}

        {currentQuestion.answerType === "short_answer" && (
          <Textarea
            placeholder="Enter your answer here..."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={4}
          />
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={goToNextQuestion}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={submitQuiz}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Flag className="mr-2 h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
