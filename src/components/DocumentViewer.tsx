"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { IconWrapper } from "@/components/ui/icon-wrapper";

interface DocumentViewerProps {
  documentId: string;
  onClose?: () => void;
}

export default function DocumentViewer({
  documentId,
  onClose,
}: DocumentViewerProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("pdf");
  const [documentName, setDocumentName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const fetchDocument = useCallback(async () => {
    if (!isAuthenticated || !documentId) return;

    setIsLoading(true);
    setError(null);

    try {
      // First get document metadata
      const metadataResponse = await axios.get(`/api/files/${documentId}`);
      const { filename, contentType } = metadataResponse.data;
      setDocumentName(filename);

      // Determine document type from content type
      if (contentType.includes("pdf")) {
        setDocumentType("pdf");
      } else if (contentType.includes("text")) {
        setDocumentType("text");
      } else if (contentType.includes("word")) {
        setDocumentType("docx");
      } else {
        setDocumentType("other");
      }

      // Get document content/url
      const response = await axios.get(`/api/files/${documentId}/view`, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = URL.createObjectURL(response.data);
      setDocumentUrl(url);

      // For PDFs, get page count if available
      if (documentType === "pdf" && window.PDFViewerApplication) {
        window.PDFViewerApplication.eventBus.on("pagesloaded", (e) => {
          setTotalPages(e.pagesCount);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch document:", err);
      let errorMsg = "Failed to load document. Please try again later.";

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          errorMsg = "Authentication error. Please log in again.";
        } else if (err.response.status === 403) {
          errorMsg =
            "Forbidden: You don't have permission to view this document.";
        } else if (err.response.status === 404) {
          errorMsg = "Document not found. It may have been deleted.";
        } else {
          errorMsg = `Error ${err.response.status}: Could not fetch document.`;
        }
      }

      setError(errorMsg);
      toast({
        title: "Error",
        description: "Could not load document.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [documentId, isAuthenticated, toast, documentType]);

  useEffect(() => {
    fetchDocument();

    // Cleanup function to revoke object URL on unmount
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [fetchDocument, documentUrl]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  if (status === "loading") {
    return (
      <div
        className="flex justify-center items-center p-8 h-full"
        data-testid="document-viewer-loading"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="p-4 text-center text-muted-foreground border rounded-lg"
        data-testid="document-viewer-unauthenticated"
      >
        Please log in to view documents.
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 text-center text-destructive border border-destructive/50 rounded-lg bg-destructive/10"
        data-testid="document-viewer-error"
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full border rounded-lg overflow-hidden"
      data-testid="document-viewer-container"
    >
      {/* Document Header */}
      <div
        className="p-2 border-b flex items-center justify-between bg-muted/20"
        data-testid="document-viewer-header"
      >
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground"
            data-testid="document-viewer-close-button"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h3
            className="text-sm font-medium truncate"
            data-testid="document-viewer-filename"
          >
            {documentName}
          </h3>
        </div>

        <div
          className="flex items-center space-x-1"
          data-testid="document-viewer-controls"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            data-testid="document-viewer-zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span
            className="text-xs w-10 text-center"
            data-testid="document-viewer-zoom-level"
          >
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            data-testid="document-viewer-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            data-testid="document-viewer-rotate"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div
        className="flex-1 overflow-auto p-4 bg-muted/10 relative"
        data-testid="document-viewer-content"
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documentUrl ? (
          <>
            {documentType === "pdf" && (
              <iframe
                src={`${documentUrl}#page=${currentPage}`}
                className="w-full h-full border-0"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                title={documentName}
                data-testid="document-viewer-pdf"
              />
            )}

            {documentType === "text" && (
              <div
                className="bg-white p-4 rounded shadow-sm max-w-4xl mx-auto"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                data-testid="document-viewer-text"
              >
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {/* Text content would be loaded here */}
                  {/* In a real implementation, you might fetch the text content separately */}
                </pre>
              </div>
            )}

            {documentType === "docx" && (
              <div
                className="bg-white p-4 rounded shadow-sm max-w-4xl mx-auto"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                data-testid="document-viewer-docx"
              >
                {/* For DOCX, you might use a library like mammoth.js to render the content */}
                {/* This is a placeholder */}
                <div className="p-4 text-center text-muted-foreground">
                  DOCX preview not implemented
                </div>
              </div>
            )}

            {documentType === "other" && (
              <div
                className="bg-white p-4 rounded shadow-sm text-center max-w-4xl mx-auto"
                data-testid="document-viewer-unsupported"
              >
                <p>This document type cannot be previewed.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (documentUrl) {
                      window.open(documentUrl, "_blank");
                    }
                  }}
                  className="mt-4"
                  data-testid="document-viewer-download"
                >
                  Download
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Document Footer - Page Navigation */}
      {documentType === "pdf" && totalPages > 1 && (
        <div
          className="p-2 border-t flex items-center justify-center space-x-4 bg-muted/20"
          data-testid="document-viewer-footer"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            data-testid="document-viewer-prev-page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs" data-testid="document-viewer-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            data-testid="document-viewer-next-page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
