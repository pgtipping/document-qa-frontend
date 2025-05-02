"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import QuizResults from "@/components/QuizResults";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SEO from "@/components/SEO";

interface ResultsPageProps {
  params: {
    quizId: string;
  };
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { quizId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get("resultId");
  const shareCode = searchParams.get("shareCode");
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string>("");

  // Redirect if no resultId
  useEffect(() => {
    if (!resultId) {
      router.push(`/quiz/${quizId}`);
    }
  }, [resultId, quizId, router]);

  // Authentication check - but only if not accessing via share code
  useEffect(() => {
    if (!shareCode && status === "unauthenticated") {
      redirect(
        `/auth?callbackUrl=/quiz/${quizId}/results?resultId=${resultId}`
      );
    }
  }, [status, quizId, resultId, shareCode]);

  // Fetch result title for SEO
  useEffect(() => {
    if (!resultId) return;

    const fetchResultTitle = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("resultId", resultId);
        if (shareCode) {
          queryParams.append("shareCode", shareCode);
        }

        const response = await fetch(
          `/api/quiz/${quizId}/results?${queryParams.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to load result");
        }
        const data = await response.json();
        setQuizTitle(data.quiz?.title || "Quiz Result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchResultTitle();
  }, [quizId, resultId, shareCode]);

  // If no result ID is provided, show appropriate error
  if (!resultId) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Missing Result ID</CardTitle>
            <CardDescription>
              No quiz result was specified to view
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please select a quiz to take or a result to view.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO
        title={
          quizTitle ? `${quizTitle} Results | InQDoc` : "Quiz Results | InQDoc"
        }
        description="View your quiz results and performance analysis."
      />

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Results...</CardTitle>
            <CardDescription>
              Please wait while we fetch your results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-32 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the quiz results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <QuizResults quizId={quizId} resultId={resultId} />
      )}
    </div>
  );
}
