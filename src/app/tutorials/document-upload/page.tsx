import React from "react";
import Link from "next/link";

const DocumentUploadTutorial = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/tutorials"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Tutorials
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Document Upload Tutorial</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          Document Q&A allows users to upload documents and ask questions about
          their content. This tutorial covers:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Supported document formats</li>
          <li>Document upload process</li>
          <li>Document validation</li>
          <li>Error handling</li>
          <li>Best practices</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Supported Document Formats
        </h2>
        <p className="mb-4">
          Document Q&A supports the following file formats:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>PDF</strong> (.pdf) - Portable Document Format
          </li>
          <li>
            <strong>TXT</strong> (.txt) - Plain text files
          </li>
          <li>
            <strong>DOC</strong> (.doc) - Microsoft Word Document
          </li>
          <li>
            <strong>DOCX</strong> (.docx) - Microsoft Word Open XML Document
          </li>
        </ul>
        <p className="mt-4 text-gray-700">
          <strong>Note:</strong> The maximum file size is 10MB. Files with
          scanned text should have clear, readable content for optimal results.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Document Upload Process</h2>

        <h3 className="text-xl font-medium mb-3">Frontend Implementation</h3>
        <p className="mb-4">
          The document upload component uses React's <code>useDropzone</code>{" "}
          hook for drag-and-drop functionality:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const fileToUpload = acceptedFiles[0];
    setFile(fileToUpload);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.post(
        "/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      // Store document ID for later use
      localStorage.setItem("currentDocumentId", response.data.document_id);
      
      // Success notification
    } catch (error) {
      // Error handling
    } finally {
      // Reset upload state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

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
    disabled: isUploading,
  });

  // Component JSX
}`}
        </pre>

        <h3 className="text-xl font-medium mt-6 mb-3">
          Backend Implementation
        </h3>
        <p className="mb-4">
          The backend handles document validation, storage, and processing:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# FastAPI route
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, str]:
    """Upload a document for Q&A."""
    try:
        document_id = await document_service.save_document(file)
        return {
            "document_id": document_id,
            "message": "Document uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Document service
async def save_document(self, file: UploadFile) -> str:
    """Save an uploaded document and return its ID."""
    # Validate file
    await self._validate_file(file)
    
    # Generate unique ID
    document_id = str(uuid.uuid4())
    
    # Create directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save file
    file_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}")
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return document_id`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Document Validation</h2>
        <p className="mb-4">
          Document validation ensures that only supported file types and sizes
          are processed:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`async def _validate_file(self, file: UploadFile) -> None:
    """Validate the uploaded file."""
    # Check file size
    content = await file.read()
    await file.seek(0)  # Reset file position
    
    if len(content) > settings.MAX_FILE_SIZE:
        raise ValueError(
            f"File size exceeds the maximum allowed size of "
            f"{settings.MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )
    
    # Check MIME type
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in SUPPORTED_MIME_TYPES:
        raise ValueError(
            f"Unsupported file type: {mime_type}. "
            f"Supported types: {', '.join(SUPPORTED_MIME_TYPES.keys())}"
        )`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
        <p className="mb-4">
          Proper error handling ensures a good user experience:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// Frontend error handling
try {
  // Upload code
} catch (error) {
  console.error("Upload error:", error);
  
  // Track error event
  trackEvent("document_upload_error", {
    documentSize: fileToUpload.size,
    documentType: fileToUpload.type,
    errorMessage: error instanceof Error ? error.message : "Unknown error",
  });
  
  // Show error notification
  toast({
    title: "Error",
    description: "Failed to upload file",
    variant: "destructive",
    duration: 3000,
  });
  
  setFile(null);
}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Validate on both client and server:</strong> Implement
            validation on both the frontend and backend for security.
          </li>
          <li>
            <strong>Show upload progress:</strong> Provide visual feedback
            during uploads, especially for larger files.
          </li>
          <li>
            <strong>Handle errors gracefully:</strong> Display user-friendly
            error messages and log detailed errors for debugging.
          </li>
          <li>
            <strong>Secure file storage:</strong> Implement proper access
            controls and consider file encryption for sensitive documents.
          </li>
          <li>
            <strong>Clean up temporary files:</strong> Implement a cleanup
            mechanism for documents that are no longer needed.
          </li>
          <li>
            <strong>Optimize for performance:</strong> Consider using streaming
            uploads for large files and implement caching where appropriate.
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you understand document upload, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/react/setup"
              className="text-blue-600 hover:text-blue-800"
            >
              Learn about React integration
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/python/setup"
              className="text-blue-600 hover:text-blue-800"
            >
              Explore Python/FastAPI integration
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/error-handling"
              className="text-blue-600 hover:text-blue-800"
            >
              Implement comprehensive error handling
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUploadTutorial;
