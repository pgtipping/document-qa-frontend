"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import QuizDisplay from "@/components/QuizDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

interface QuizPageProps {
  params: {
    quizId: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  const { quizId } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect(`/auth?callbackUrl=/quiz/${quizId}`);
    }
  }, [status, quizId]);

  // Fetch basic quiz data for SEO/title
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchQuizTitle = async () => {
      try {
        const response = await fetch(`/api/quiz/${quizId}`);
        if (!response.ok) {
          throw new Error("Failed to load quiz");
        }
        const data = await response.json();
        setQuizTitle(data.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizTitle();
  }, [quizId, status]);

  const handleQuizComplete = (resultId: string) => {
    router.push(`/quiz/${quizId}/results?resultId=${resultId}`);
  };

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/quiz/new")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Quiz Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO
        title={quizTitle ? `${quizTitle} | Quiz | InQDoc` : "Quiz | InQDoc"}
        description="Test your knowledge with this interactive quiz on document content."
      />

      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/quiz/new")}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz Dashboard
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Quiz...</CardTitle>
            <CardDescription>
              Please wait while we fetch your quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-32 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <QuizDisplay quizId={quizId} onComplete={handleQuizComplete} />
      )}
    </div>
  );
}
