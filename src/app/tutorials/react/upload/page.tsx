import React from "react";
import Link from "next/link";

const ReactUploadTutorial = () => {
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

      <h1 className="text-3xl font-bold mb-6">
        Implementing File Upload in React
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          This tutorial will guide you through implementing a file upload
          component for Document Q&A in a React application. We'll use
          react-dropzone for drag-and-drop functionality and axios for handling
          the HTTP requests.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Completed the{" "}
            <Link
              href="/tutorials/react/setup"
              className="text-blue-600 hover:text-blue-800"
            >
              React Setup Tutorial
            </Link>
          </li>
          <li>
            Installed dependencies: document-qa-client, axios, react-dropzone
          </li>
          <li>Basic understanding of React hooks and components</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 1: Create the FileUpload Component
        </h2>
        <p className="mb-4">
          Create a new file <code>src/components/FileUpload.js</code> with the
          following content:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { client } from '../lib/document-qa';

const FileUpload = ({ onDocumentUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleUpload = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);

      // Use axios directly for more control over the upload process
      const response = await client.client.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      // Call the callback with the document ID
      if (onDocumentUploaded) {
        onDocumentUploaded(response.data.document_id);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      // Reset upload state after a delay to show 100% progress
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={\`dropzone \${isDragActive ? 'active' : ''} \${isUploading ? 'opacity-50' : ''}\`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag & drop a document here, or click to select a file</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: PDF, TXT, DOC, DOCX (max 10MB)
        </p>
      </div>

      {isUploading && (
        <div className="mt-4">
          <p>Uploading: {uploadProgress}%</p>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: \`\${uploadProgress}%\` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 2: Implement Direct API Upload
        </h2>
        <p className="mb-4">
          For more control over the upload process, you can use the Document Q&A
          client's direct API access:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// Alternative implementation using the client library
const handleUpload = useCallback(async (acceptedFiles) => {
  if (acceptedFiles.length === 0) return;
  
  const file = acceptedFiles[0];
  setIsUploading(true);
  setUploadProgress(0);
  setError(null);

  try {
    // Use the client library's uploadDocument method
    const response = await client.uploadDocument(file);
    
    // Call the callback with the document ID
    if (onDocumentUploaded) {
      onDocumentUploaded(response.id);
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError('Failed to upload document');
  } finally {
    setIsUploading(false);
  }
}, [onDocumentUploaded]);`}
        </pre>
        <p className="text-gray-700 mt-4">
          <strong>Note:</strong> The client library method doesn't provide
          progress tracking. Use the direct axios approach if you need upload
          progress.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 3: Add File Preview (Optional)
        </h2>
        <p className="mb-4">
          You can enhance the upload component by adding a file preview:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`const FileUpload = ({ onDocumentUploaded }) => {
  // ... existing code
  
  const [file, setFile] = useState(null);
  
  const handleUpload = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const fileToUpload = acceptedFiles[0];
    setFile(fileToUpload); // Store the file for preview
    
    // ... rest of the upload code
  }, [onDocumentUploaded]);
  
  // Function to remove the file
  const removeFile = () => {
    if (!isUploading) {
      setFile(null);
    }
  };
  
  return (
    <div>
      {!file ? (
        <div
          {...getRootProps()}
          className={\`dropzone \${isDragActive ? 'active' : ''}\`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag & drop a document here, or click to select a file</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, TXT, DOC, DOCX (max 10MB)
          </p>
        </div>
      ) : (
        <div className="p-4 border rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={removeFile}
              disabled={isUploading}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <p>Uploading: {uploadProgress}%</p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: \`\${uploadProgress}%\` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 4: Error Handling</h2>
        <p className="mb-4">
          Implement comprehensive error handling for different scenarios:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`const handleUpload = useCallback(async (acceptedFiles) => {
  // ... existing code
  
  try {
    // ... upload code
  } catch (err) {
    console.error('Upload error:', err);
    
    // Handle different error types
    if (err.response) {
      // The request was made and the server responded with an error status
      if (err.response.status === 413) {
        setError('File size exceeds the maximum allowed size');
      } else if (err.response.status === 415) {
        setError('Unsupported file type');
      } else {
        setError(err.response.data?.detail || 'Server error');
      }
    } else if (err.request) {
      // The request was made but no response was received
      setError('No response from server. Please check your connection');
    } else {
      // Something happened in setting up the request
      setError('Failed to upload document: ' + err.message);
    }
  } finally {
    // ... existing code
  }
}, [onDocumentUploaded]);`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 5: Using the Component
        </h2>
        <p className="mb-4">
          Now you can use the FileUpload component in your application:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import QuestionInput from './components/QuestionInput';

function App() {
  const [documentId, setDocumentId] = useState(null);

  const handleDocumentUploaded = (id) => {
    console.log('Document uploaded with ID:', id);
    setDocumentId(id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Document Q&A</h1>
      
      {!documentId ? (
        <div>
          <h2 className="text-xl mb-4">Upload a Document</h2>
          <FileUpload onDocumentUploaded={handleDocumentUploaded} />
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Ask a Question</h2>
          <QuestionInput documentId={documentId} />
          <button
            className="mt-4 text-blue-600"
            onClick={() => setDocumentId(null)}
          >
            Upload a different document
          </button>
        </div>
      )}
    </div>
  );
}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you've implemented the file upload component, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/react/qa"
              className="text-blue-600 hover:text-blue-800"
            >
              Build the Question & Answer interface
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
          <li>
            <Link
              href="/tutorials/optimization"
              className="text-blue-600 hover:text-blue-800"
            >
              Optimize performance
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReactUploadTutorial;
