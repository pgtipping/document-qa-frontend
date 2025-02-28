import React from "react";
import Link from "next/link";

const OptimizationTutorial = () => {
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
        Optimizing Your Document Q&A Application
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          Performance optimization is crucial for providing a smooth user
          experience in your Document Q&A application. This tutorial covers
          various techniques to optimize both the frontend and backend
          components, ensuring fast response times and efficient resource usage.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frontend Optimization</h2>

        <h3 className="text-xl font-medium mb-3">1. Component Memoization</h3>
        <p className="mb-4">
          Use React's memoization features to prevent unnecessary re-renders:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// Before optimization
const QuestionItem = ({ question, answer }) => {
  return (
    <div className="qa-item">
      <p className="question">{question}</p>
      <p className="answer">{answer}</p>
    </div>
  );
};

// After optimization with React.memo
import React from 'react';

const QuestionItem = React.memo(({ question, answer }) => {
  return (
    <div className="qa-item">
      <p className="question">{question}</p>
      <p className="answer">{answer}</p>
    </div>
  );
});

// For components with complex props, provide a custom comparison function
const areEqual = (prevProps, nextProps) => {
  return prevProps.question === nextProps.question && 
         prevProps.answer === nextProps.answer;
};

const QuestionItem = React.memo(({ question, answer }) => {
  // Component implementation
}, areEqual);`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">2. Optimizing Hooks</h3>
        <p className="mb-4">
          Use the useCallback and useMemo hooks to optimize performance:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// Before optimization
const QuestionInput = ({ documentId }) => {
  const [question, setQuestion] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit logic
  };
  
  const filteredHistory = chatHistory.filter(item => item.type !== 'error');
  
  return (
    // Component JSX
  );
};

// After optimization
const QuestionInput = ({ documentId }) => {
  const [question, setQuestion] = useState('');
  
  // Memoize the submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    // Submit logic
  }, [documentId, question]); // Only recreate if these dependencies change
  
  // Memoize expensive computations
  const filteredHistory = useMemo(() => {
    return chatHistory.filter(item => item.type !== 'error');
  }, [chatHistory]); // Only recompute when chatHistory changes
  
  return (
    // Component JSX
  );
};`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">3. Code Splitting</h3>
        <p className="mb-4">
          Use dynamic imports to split your code and load components only when
          needed:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/app/page.js
import dynamic from 'next/dynamic';

// Import components dynamically
const FileUpload = dynamic(() => import('../components/FileUpload'), {
  loading: () => <p>Loading file upload component...</p>,
});

const QuestionInput = dynamic(() => import('../components/QuestionInput'), {
  loading: () => <p>Loading question input component...</p>,
});

export default function Home() {
  const [documentId, setDocumentId] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Document Q&A</h1>
      
      {!documentId ? (
        <div>
          <h2 className="text-xl mb-4">Upload a Document</h2>
          <FileUpload onDocumentUploaded={setDocumentId} />
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-4">Ask Questions</h2>
          <QuestionInput documentId={documentId} />
        </div>
      )}
    </div>
  );
}`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">4. Optimizing Images</h3>
        <p className="mb-4">
          Use Next.js Image component for optimized image loading:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// Before optimization
<img src="/logo.png" alt="Logo" width={200} height={50} />

// After optimization
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50} 
  priority={true} // For important above-the-fold images
  loading="lazy" // For below-the-fold images
/>`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Optimization</h2>

        <h3 className="text-xl font-medium mb-3">1. Request Debouncing</h3>
        <p className="mb-4">
          Implement debouncing to prevent excessive API calls:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage in a component
import { useDebounce } from '../hooks/useDebounce';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Make API call with debouncedSearchTerm
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Caching API Responses
        </h3>
        <p className="mb-4">Implement caching to avoid redundant API calls:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/lib/api-cache.js
class APICache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value, ttl = 5 * 60 * 1000) { // Default TTL: 5 minutes
    // If cache is full, remove the oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if the entry has expired
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }
}

const apiCache = new APICache();
export default apiCache;

// Usage with API client
import apiCache from './api-cache';
import apiClient from './api-client';

export async function fetchWithCache(url, params = {}, ttl = 5 * 60 * 1000) {
  // Create a cache key based on the URL and params
  const cacheKey = \`\${url}:\${JSON.stringify(params)}\`;
  
  // Check if we have a cached response
  const cachedResponse = apiCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not cached, make the API call
  const response = await apiClient.get(url, { params });
  
  // Cache the response
  apiCache.set(cacheKey, response.data, ttl);
  
  return response.data;
}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Document Processing Optimization
        </h2>

        <h3 className="text-xl font-medium mb-3">1. File Size Optimization</h3>
        <p className="mb-4">
          Implement client-side file compression before uploading:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/utils/file-compression.js
import { PDFDocument } from 'pdf-lib';

export async function compressPDF(file) {
  // Read the file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Compress the PDF
  const compressedPdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
  
  // Create a new File object with the compressed data
  const compressedFile = new File(
    [compressedPdfBytes], 
    file.name, 
    { type: file.type }
  );
  
  return compressedFile;
}

// Usage in FileUpload component
import { compressPDF } from '../utils/file-compression';

const onDrop = useCallback(async (acceptedFiles) => {
  if (acceptedFiles.length === 0) return;
  
  const file = acceptedFiles[0];
  
  // Compress PDF files before uploading
  let fileToUpload = file;
  if (file.type === 'application/pdf') {
    setIsCompressing(true);
    try {
      fileToUpload = await compressPDF(file);
      console.log(\`Compressed file from \${file.size} to \${fileToUpload.size} bytes\`);
    } catch (err) {
      console.error('Compression error:', err);
      // Fall back to the original file
      fileToUpload = file;
    } finally {
      setIsCompressing(false);
    }
  }
  
  // Continue with upload process
  // ...
}, []);`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">2. Chunked Uploads</h3>
        <p className="mb-4">Implement chunked uploads for large files:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/utils/chunked-upload.js
export async function uploadInChunks(file, uploadUrl, chunkSize = 1024 * 1024) {
  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadedChunks = 0;
  let uploadId = null;
  
  // Initialize upload
  const initResponse = await fetch(\`\${uploadUrl}/init\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks,
    }),
  });
  
  const initData = await initResponse.json();
  uploadId = initData.uploadId;
  
  // Upload chunks
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    
    await fetch(\`\${uploadUrl}/chunk\`, {
      method: 'POST',
      body: formData,
    });
    
    uploadedChunks++;
    const progress = Math.round((uploadedChunks / totalChunks) * 100);
    // Update progress
  }
  
  // Complete upload
  const completeResponse = await fetch(\`\${uploadUrl}/complete\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uploadId,
    }),
  });
  
  return await completeResponse.json();
}

// Usage in FileUpload component
import { uploadInChunks } from '../utils/chunked-upload';

const handleUpload = async (file) => {
  setIsUploading(true);
  setError(null);
  
  try {
    const response = await uploadInChunks(
      file, 
      \`\${process.env.NEXT_PUBLIC_API_URL}/upload\`
    );
    
    if (onDocumentUploaded) {
      onDocumentUploaded(response.documentId);
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError('Failed to upload document');
  } finally {
    setIsUploading(false);
  }
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Backend Optimization</h2>

        <h3 className="text-xl font-medium mb-3">1. Response Streaming</h3>
        <p className="mb-4">
          Implement response streaming for long-running operations:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# api/routes/qa.py
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from ..services.llm_service import get_llm_response_stream

router = APIRouter()

@router.post("/ask/stream")
async def ask_question_stream(request: Request):
    data = await request.json()
    document_id = data.get("document_id")
    question = data.get("question")
    
    # Validate inputs
    if not document_id or not question:
        return {"error": "Missing required parameters"}
    
    # Return a streaming response
    return StreamingResponse(
        get_llm_response_stream(document_id, question),
        media_type="text/event-stream"
    )

# api/services/llm_service.py
async def get_llm_response_stream(document_id, question):
    # Get document content
    document = await get_document(document_id)
    
    # Set up LLM client
    client = get_llm_client()
    
    # Stream the response
    async for chunk in client.completions.create(
        model="gpt-3.5-turbo",
        prompt=f"Document: {document}\n\nQuestion: {question}\n\nAnswer:",
        stream=True,
        max_tokens=500
    ):
        if chunk.choices[0].text:
            # Yield in the format expected by EventSource
            yield f"data: {chunk.choices[0].text}\n\n"
    
    # Signal the end of the stream
    yield "data: [DONE]\n\n"`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Caching Document Processing
        </h3>
        <p className="mb-4">
          Implement caching for document processing results:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# api/services/document_service.py
import hashlib
import json
from functools import lru_cache

# LRU cache for document processing
@lru_cache(maxsize=100)
def process_document_cached(document_id, content_hash):
    # The content_hash parameter ensures the cache is invalidated if the document changes
    # Process the document and return the result
    # ...
    return processed_result

async def process_document(document_id):
    # Get document content
    document = await get_document(document_id)
    
    # Generate a hash of the document content
    content_hash = hashlib.md5(document.encode()).hexdigest()
    
    # Use the cached version if available
    return process_document_cached(document_id, content_hash)`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          3. Asynchronous Processing
        </h3>
        <p className="mb-4">
          Implement asynchronous processing for long-running tasks:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# api/routes/documents.py
from fastapi import APIRouter, BackgroundTasks, UploadFile, File
from ..services.document_service import process_document_async

router = APIRouter()

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    # Save the file temporarily
    file_path = await save_upload_file(file)
    
    # Generate a document ID
    document_id = generate_document_id()
    
    # Start processing in the background
    background_tasks.add_task(
        process_document_async,
        document_id,
        file_path
    )
    
    # Return immediately with the document ID
    return {
        "document_id": document_id,
        "status": "processing",
        "message": "Document upload received and processing started"
    }

@router.get("/documents/{document_id}/status")
async def get_document_status(document_id: str):
    # Check the processing status
    status = await get_processing_status(document_id)
    
    return {
        "document_id": document_id,
        "status": status.state,
        "progress": status.progress,
        "error": status.error
    }`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you've optimized your Document Q&A application, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/testing"
              className="text-blue-600 hover:text-blue-800"
            >
              Implement testing strategies
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/deployment"
              className="text-blue-600 hover:text-blue-800"
            >
              Deploy your application
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

export default OptimizationTutorial;
