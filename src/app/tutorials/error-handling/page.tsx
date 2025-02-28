import React from "react";
import Link from "next/link";

const ErrorHandlingTutorial = () => {
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

      <h1 className="text-3xl font-bold mb-6">Comprehensive Error Handling</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          Robust error handling is essential for creating a reliable Document
          Q&A application. This tutorial covers strategies for handling errors
          in both the frontend and backend components of your application,
          ensuring a smooth user experience even when things go wrong.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frontend Error Handling</h2>

        <h3 className="text-xl font-medium mb-3">1. Global Error Boundary</h3>
        <p className="mb-4">
          Implement a global error boundary to catch unexpected errors in your
          React components:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
          <p className="mb-4">We're sorry, but an unexpected error occurred.</p>
          <details className="bg-white p-4 rounded-md">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <p className="mt-2 text-red-600">{this.state.error && this.state.error.toString()}</p>
            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`}
        </pre>

        <p className="mb-4">
          Wrap your application with the ErrorBoundary component:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/app/layout.js
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          API Request Error Handling
        </h2>

        <h3 className="text-xl font-medium mb-3">
          1. Create a Custom API Client
        </h3>
        <p className="mb-4">
          Implement a custom API client with built-in error handling:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/lib/api-client.js
import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      
      if (status === 401) {
        // Handle unauthorized errors
        console.error('Unauthorized access');
        // Redirect to login or show auth error
      } else if (status === 403) {
        // Handle forbidden errors
        console.error('Forbidden access');
      } else if (status === 404) {
        // Handle not found errors
        console.error('Resource not found');
      } else if (status >= 500) {
        // Handle server errors
        console.error('Server error occurred');
      }
      
      // You can add custom error messages based on the response
      const errorMessage = error.response.data?.detail || 'An error occurred';
      error.userMessage = errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received');
      error.userMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request configuration error:', error.message);
      error.userMessage = 'An error occurred while setting up the request.';
    }
    
    // You can also log errors to a monitoring service here
    
    return Promise.reject(error);
  }
);

export default apiClient;`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Using the API Client
        </h3>
        <p className="mb-4">Use the custom API client in your components:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/components/QuestionInput.js
import React, { useState } from 'react';
import apiClient from '../lib/api-client';

const QuestionInput = ({ documentId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/ask', {
        document_id: documentId,
        question,
      });
      
      setAnswer(response.data.answer);
    } catch (err) {
      console.error('Question error:', err);
      // Use the user-friendly message from our interceptor
      setError(err.userMessage || 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  // Component JSX
  // ...
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          File Upload Error Handling
        </h2>

        <h3 className="text-xl font-medium mb-3">
          1. Comprehensive File Validation
        </h3>
        <p className="mb-4">
          Implement thorough file validation before uploading:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/components/FileUpload.js
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import apiClient from '../lib/api-client';

const FileUpload = ({ onDocumentUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // File validation function
  const validateFile = (file) => {
    // Check file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: \`File is too large. Maximum size is \${maxSize / (1024 * 1024)}MB.\`
      };
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF and text files are supported.'
      };
    }

    // File is valid
    return { valid: true };
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Upload with progress tracking
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      
      if (onDocumentUploaded) {
        onDocumentUploaded(response.data.document_id);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.userMessage || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  // Component JSX
  // ...
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Error Notification System
        </h2>

        <h3 className="text-xl font-medium mb-3">
          1. Create a Toast Notification System
        </h3>
        <p className="mb-4">
          Implement a toast notification system for displaying errors:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/components/ToastContainer.js
import React, { useState, useEffect } from 'react';

export const ToastContext = React.createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'error', duration = 5000) => {
    const id = Date.now();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, type, duration },
    ]);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ id, message, type, duration, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor =
    type === 'error'
      ? 'bg-red-100 border-red-400 text-red-700'
      : type === 'success'
      ? 'bg-green-100 border-green-400 text-green-700'
      : 'bg-blue-100 border-blue-400 text-blue-700';

  return (
    <div
      className={\`px-4 py-3 rounded border \${bgColor} flex items-center justify-between max-w-md animate-fade-in\`}
    >
      <p>{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

// Hook for using the toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Using the Toast System
        </h3>
        <p className="mb-4">
          Add the ToastProvider to your application and use it in components:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/app/layout.js
import { ToastProvider } from '../components/ToastContainer';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

// In any component:
import { useToast } from '../components/ToastContainer';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleAction = async () => {
    try {
      // Do something
    } catch (error) {
      showToast(error.userMessage || 'An error occurred', 'error');
    }
  };
  
  // Component JSX
  // ...
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Backend Error Handling</h2>

        <h3 className="text-xl font-medium mb-3">
          1. FastAPI Exception Handlers
        </h3>
        <p className="mb-4">
          Implement custom exception handlers in your FastAPI backend:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# api/main.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception classes
class DocumentProcessingError(Exception):
    def __init__(self, detail: str):
        self.detail = detail

class QuestionAnsweringError(Exception):
    def __init__(self, detail: str):
        self.detail = detail

# Exception handlers
@app.exception_handler(DocumentProcessingError)
async def document_processing_exception_handler(request: Request, exc: DocumentProcessingError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.detail},
    )

@app.exception_handler(QuestionAnsweringError)
async def qa_exception_handler(request: Request, exc: QuestionAnsweringError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": exc.detail},
    )

# Global exception handler for unexpected errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the error here
    print(f"Unexpected error: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Using Custom Exceptions
        </h3>
        <p className="mb-4">Use custom exceptions in your API endpoints:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# api/routes/documents.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..exceptions import DocumentProcessingError

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Validate file
        if file.content_type not in ["application/pdf", "text/plain"]:
            raise DocumentProcessingError("Invalid file type. Only PDF and text files are supported.")
        
        # Process file
        # ...
        
        return {"document_id": "123", "message": "Document uploaded successfully"}
    except DocumentProcessingError as e:
        # This will be caught by the custom exception handler
        raise
    except Exception as e:
        # Log the error
        print(f"Error processing document: {str(e)}")
        # Convert to our custom exception
        raise DocumentProcessingError("Failed to process document")`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you've implemented comprehensive error handling, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/optimization"
              className="text-blue-600 hover:text-blue-800"
            >
              Optimize your application's performance
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/testing"
              className="text-blue-600 hover:text-blue-800"
            >
              Implement testing strategies
            </Link>
          </li>
          <li>
            <Link href="/docs" className="text-blue-600 hover:text-blue-800">
              Explore the full documentation
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorHandlingTutorial;
