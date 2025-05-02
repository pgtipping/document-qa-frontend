"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import QuizGenerator from "@/components/QuizGenerator";
import { getAuthSession } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Clock, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SEO from "@/components/SEO";

interface Document {
  id: string;
  filename: string;
  createdAt: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  document: {
    filename: string;
  };
  questions: {
    id: string;
  }[];
}

export default function NewQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth?callbackUrl=/quiz/new");
    }
  }, [status]);

  // Fetch documents owned by the user
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchUserData = async () => {
      try {
        // Fetch user's documents
        const docResponse = await fetch("/api/files");
        if (!docResponse.ok) throw new Error("Failed to fetch documents");
        const docsData = await docResponse.json();
        setDocuments(docsData.documents);

        // Fetch user's recent quizzes
        const quizResponse = await fetch("/api/quiz");
        if (quizResponse.ok) {
          const quizzesData = await quizResponse.json();
          setRecentQuizzes(quizzesData.quizzes || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status]);

  const handleQuizCreated = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get preselected document ID from URL if available
  const preselectedDocId = searchParams.get("documentId");
  const filteredDocs = preselectedDocId
    ? documents.filter((doc) => doc.id === preselectedDocId)
    : documents;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <SEO
        title="Create New Quiz | InQDoc"
        description="Generate quizzes from your documents to test understanding and knowledge retention."
      />

      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Quiz</h1>
          <p className="text-muted-foreground">
            Generate quizzes from your documents to test understanding
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/chat")}
          className="mt-4 md:mt-0"
        >
          Back to Documents
        </Button>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Quiz
          </TabsTrigger>
          {recentQuizzes.length > 0 && (
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recent Quizzes
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="create">
          {loading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : documents.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Documents Available</CardTitle>
                <CardDescription>
                  You need to upload documents before you can create quizzes.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => router.push("/chat")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <QuizGenerator
              documents={filteredDocs}
              onGenerateComplete={handleQuizCreated}
            />
          )}
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentQuizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description || `Based on ${quiz.document.filename}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm">
                    <p className="font-medium">
                      {quiz.questions.length} questions
                    </p>
                    <p className="text-muted-foreground">
                      Created {formatDate(quiz.createdAt)}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                  >
                    Take Quiz
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
