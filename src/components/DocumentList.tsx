"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Trash2, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Reverting back to alias
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
} from "@/components/ui/alert-dialog"; // Reverting back to alias
import { format } from "date-fns";

interface Document {
  id: string;
  filename: string;
  createdAt: string; // Assuming ISO string format from Prisma
  s3Key: string;
}

export default function DocumentList() {
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (status !== "authenticated") return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ documents: Document[] }>("/api/files");
      setDocuments(response.data.documents);
    } catch (err: any) {
      // Use 'any' or a more specific Axios error type
      console.error("Failed to fetch documents:", err);
      let errorMsg = "Failed to load your documents. Please try again later.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          errorMsg = "Authentication error. Please log in again.";
        } else if (err.response.status === 403) {
          errorMsg = "Forbidden: You don't have permission to view documents.";
        } else {
          errorMsg = `Error ${err.response.status}: Could not fetch documents.`;
        }
      }
      setError(errorMsg);
      // Toast is still generic here, but the main error display is more specific
      toast({
        title: "Error",
        description: "Could not fetch documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [status, toast]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDocuments();
    } else if (status === "unauthenticated") {
      // Clear documents if user logs out
      setDocuments([]);
      setError(null);
      setIsLoading(false);
    }
  }, [status, fetchDocuments]);

  const handleDelete = async (documentId: string) => {
    setIsLoading(true); // Indicate loading state during deletion
    try {
      await axios.delete(`/api/files/${documentId}`);
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
      // Refresh the document list after deletion
      fetchDocuments();
    } catch (err: any) {
      // Use 'any' or a more specific Axios error type
      console.error("Failed to delete document:", err);
      let errorDesc = "Failed to delete document. Please try again.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          errorDesc = "Authentication error. Please log in again.";
        } else if (err.response.status === 403) {
          errorDesc =
            "Forbidden: You don't have permission to delete this document.";
        } else if (err.response.status === 404) {
          errorDesc = "Error: Document not found.";
        } else {
          errorDesc = `Error ${err.response.status}: Could not delete document.`;
        }
      }
      toast({
        title: "Error",
        description: errorDesc,
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading state on error
    }
    // Loading state will be reset by fetchDocuments on success or handled above on error
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4 text-center text-muted-foreground border rounded-lg">
        Please log in to view and manage your documents.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive border border-destructive/50 rounded-lg bg-destructive/10 flex items-center justify-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] hidden sm:table-cell">
              Icon
            </TableHead>
            <TableHead>Filename</TableHead>
            <TableHead className="hidden md:table-cell">Uploaded On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
              </TableCell>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                You haven't uploaded any documents yet.
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="hidden sm:table-cell">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium truncate max-w-xs">
                  {doc.filename}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {format(new Date(doc.createdAt), "PPp")} {/* Format date */}
                </TableCell>
                <TableCell className="text-right">
                  {/* Conditionally render delete button only if authenticated */}
                  {status === "authenticated" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {doc.filename}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the document{" "}
                            <span className="font-medium">{doc.filename}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isLoading}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doc.id)}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                      {/* Removed duplicated closing tag below */}
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
