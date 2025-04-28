"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import axios, { AxiosProgressEvent } from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";

const IconWrapper = ({
  Icon,
  size,
  className,
}: {
  Icon: LucideIcon;
  size: number;
  className?: string;
}) => <Icon size={size} className={className} />;

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const { status } = useSession(); // Removed unused 'session'
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";

  const handleUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || !isAuthenticated) return; // Prevent upload if not authenticated

      const fileToUpload = acceptedFiles[0];
      setFile(fileToUpload);
      setIsUploading(true);
      setUploadProgress(0);

      trackEvent("document_upload_start", {
        documentSize: fileToUpload.size,
        documentType: fileToUpload.type,
      });

      const formData = new FormData();
      formData.append("file", fileToUpload);

      let uploadErrorOccurred = false; // Flag to track if an error happened
      try {
        const startTime = performance.now();
        const response = await axios.post<{ document_id: string }>(
          "/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(progress);
              }
            },
          }
        );

        const uploadDuration = performance.now() - startTime;

        // Store document ID for later use
        localStorage.setItem("currentDocumentId", response.data.document_id);

        // Attempt to track success event, but don't let it block UI
        try {
          trackEvent("document_upload_success", {
            documentSize: fileToUpload.size,
            documentType: fileToUpload.type,
            uploadDuration,
            documentId: response.data.document_id,
          });
        } catch (trackingError) {
          console.error("Failed to track upload success event:", trackingError);
          // Optionally send this specific error to a different monitoring service if needed
        }

        toast({
          title: "Success",
          description: "File uploaded successfully",
          duration: 3000,
        });
      } catch (error: unknown) {
        uploadErrorOccurred = true; // Set flag on error
        // Use unknown type
        console.error("Upload error:", error);
        let errorDesc = "Failed to upload file. Please try again.";
        let errorTitle = "Upload Error";

        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          if (status === 401) {
            errorTitle = "Authentication Error";
            errorDesc = "Please log in again to upload files.";
          } else if (status === 403) {
            errorTitle = "Permission Denied";
            errorDesc = "You do not have permission to upload files.";
          } else if (status === 413) {
            errorTitle = "File Too Large";
            errorDesc = "The selected file exceeds the 10MB size limit.";
          } else {
            try {
              // Attempt to parse specific error data from response
              const errorData = error.response.data as {
                error?: string;
                detail?: string;
              }; // Type assertion
              errorDesc =
                errorData?.error ||
                errorData?.detail ||
                `Server Error (${status})`;
            } catch (parseError) {
              // Log the parsing error specifically
              console.error("Error parsing server error response:", parseError);
              errorDesc = `Server Error (${status}): Failed to upload file.`;
            }
          }
        } else if (error instanceof Error) {
          // Handle generic Error objects
          errorDesc = error.message || errorDesc;
        }

        // Attempt to track error event, but don't let it block UI/error reporting
        try {
          trackEvent("document_upload_error", {
            documentSize: fileToUpload?.size, // Use optional chaining as file might be null on error
            documentType: fileToUpload?.type,
            errorMessage: errorDesc,
            // Removed errorStatus as it's not defined in EventProperties
            // errorStatus: axios.isAxiosError(error)
            //   ? error.response?.status
            //   : undefined,
          });
        } catch (trackingError) {
          console.error("Failed to track upload error event:", trackingError);
        }

        toast({
          title: errorTitle,
          description: errorDesc,
          variant: "destructive",
          duration: 5000, // Increase duration for errors
        });
        setFile(null); // Clear the file state on error
        setIsUploading(false); // Immediately reset uploading state on error
        setUploadProgress(0);
      } finally {
        // Reset UI state after a short delay ONLY if upload was successful
        if (!uploadErrorOccurred) {
          setTimeout(() => {
            // If no error occurred, reset the uploading state after the delay
            setIsUploading(false);
            setUploadProgress(0);
            // Keep file state set on success
          }, 1000); // Delay to allow user to see 100%
        }
        // Note: Error state reset is handled immediately in the catch block
      }
    },
    [toast, isAuthenticated] // Add isAuthenticated dependency
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading || !isAuthenticated || isLoadingSession, // Disable if uploading, not authenticated, or session loading
  });

  const removeFile = () => {
    if (!isUploading) {
      setFile(null);
      localStorage.removeItem("currentDocumentId");
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-200 ease-in-out
          ${
            isUploading || !isAuthenticated || isLoadingSession
              ? "opacity-50 cursor-not-allowed bg-muted/20" // Dimmed and disabled look
              : ""
          }
          ${
            isDragActive && isAuthenticated && !isLoadingSession // Only show active state if authenticated and not loading
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input {...getInputProps()} />
        {isLoadingSession ? (
          <div className="text-center text-muted-foreground">
            Loading session...
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center text-muted-foreground">
            Please{" "}
            <Link href="/api/auth/signin" className="underline text-primary">
              log in
            </Link>{" "}
            to upload documents.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div
              className={`
              p-4 rounded-full 
              transition-all duration-200
              ${
                isDragActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }
            `}
            >
              <IconWrapper Icon={Upload} size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium">
                {isDragActive ? (
                  <span className="text-primary">Drop your file here</span>
                ) : (
                  "Drag & drop your file here"
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse from your computer
              </p>
            </div>
            <div className="text-xs text-muted-foreground/75">
              Supports PDF, TXT, DOC, and DOCX files up to 10MB
            </div>
          </div>
        )}
      </div>

      {file &&
        isAuthenticated && ( // Only show file details if authenticated
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <IconWrapper Icon={File} size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={removeFile}
                disabled={isUploading}
              >
                <IconWrapper Icon={X} size={16} />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
