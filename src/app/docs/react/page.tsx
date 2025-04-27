import React from "react";
import Link from "next/link";

const ReactIntegrationGuide = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">React Integration Guide</h1>

      <div className="space-y-8">
        {/* Installation Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <div className="space-y-4">
            <p>
              To integrate the Document QA system with your React application,
              start by installing the client library:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded">
                npm install document-qa-client
              </pre>
            </div>
          </div>
        </section>

        {/* Basic Setup Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Basic Setup</h2>
          <div className="space-y-4">
            <p>
              First, configure the client with your API credentials and base
              URL:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`import { DocumentQAClient } from "document-qa-client";

// Initialize the client
const client = new DocumentQAClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.document-qa.com",
  apiKey: process.env.NEXT_PUBLIC_API_KEY, // Optional if not using authentication
});`}
              </pre>
            </div>
            <p>
              It's recommended to create a custom hook to manage the client
              instance:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`// hooks/useDocumentQA.js
import { useState } from "react";
import { DocumentQAClient } from "document-qa-client";

export function useDocumentQA() {
  const [client] = useState(() => new DocumentQAClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  }));
  
  return client;
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Document Upload Component */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Document Upload Component
          </h2>
          <div className="space-y-4">
            <p>Create a reusable component for document uploads:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`import { useState } from "react";
import { useDocumentQA } from "../hooks/useDocumentQA";

export function DocumentUpload({ onSuccess }) {
  const client = useDocumentQA();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);

    try {
      const result = await client.uploadDocument(file);
      onSuccess(result);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleUpload}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading document...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Question Answering Component */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Question Answering Component
          </h2>
          <div className="space-y-4">
            <p>Create a component for asking questions about documents:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`import { useState } from "react";
import { useDocumentQA } from "../hooks/useDocumentQA";

export function QuestionInput({ documentId }) {
  const client = useDocumentQA();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.askQuestion({
        documentId,
        question,
        // Optional: specify model or provider
        // provider: "groq",
        // model: "llama-3.2-3b-preview"
      });
      setAnswer(result.answer);
    } catch (err) {
      setError(err.message || "Failed to get answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="question-container">
      <form onSubmit={handleSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the document..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !documentId}>
          {isLoading ? "Processing..." : "Ask"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {answer && (
        <div className="answer">
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Complete Example */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Complete Example</h2>
          <div className="space-y-4">
            <p>Putting it all together in a complete application:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`import { useState } from "react";
import { DocumentUpload } from "./components/DocumentUpload";
import { QuestionInput } from "./components/QuestionInput";

export default function DocumentQAApp() {
  const [documentId, setDocumentId] = useState(null);
  const [documentName, setDocumentName] = useState(null);

  const handleUploadSuccess = (result) => {
    setDocumentId(result.id);
    setDocumentName(result.filename);
  };

  return (
    <div className="app-container">
      <h1>Document Q&A</h1>
      
      <div className="upload-section">
        <h2>Upload a Document</h2>
        <DocumentUpload onSuccess={handleUploadSuccess} />
      </div>
      
      {documentId && (
        <div className="qa-section">
          <h2>Ask Questions about {documentName}</h2>
          <QuestionInput documentId={documentId} />
        </div>
      )}
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Advanced Features</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Model Selection</h3>
            <p>Allow users to select different LLM models:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`import { useState, useEffect } from "react";
import { useDocumentQA } from "../hooks/useDocumentQA";

export function ModelSelector({ onSelect }) {
  const client = useDocumentQA();
  const [models, setModels] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadModels() {
      try {
        const result = await client.getModels();
        setModels(result.models);
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadModels();
  }, []);
  
  if (isLoading) return <p>Loading models...</p>;
  
  return (
    <div className="model-selector">
      <h3>Select AI Model</h3>
      {Object.entries(models).map(([provider, providerModels]) => (
        <div key={provider} className="provider-group">
          <h4>{provider}</h4>
          {Object.entries(providerModels).map(([modelId, modelName]) => (
            <button
              key={modelId}
              onClick={() => onSelect({ provider, model: modelId })}
            >
              {modelName}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
          <div className="space-y-4">
            <p>Implement robust error handling for production applications:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`// api/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData.code
    );
  }
  return response.json();
}

// Example usage in client
async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(\`\${baseURL}/api/upload\`, {
      method: 'POST',
      body: formData,
    });
    
    return handleApiResponse(response);
  } catch (error) {
    // Handle network errors
    if (!(error instanceof ApiError)) {
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
    throw error;
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-4">
            <p>
              For more advanced integration scenarios, check out these
              resources:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link
                  href="/tutorials/react/setup"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Basic React Setup Tutorial
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials/react/upload"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Document Upload Tutorial
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials/react/qa"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Question Answering Tutorial
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-blue-600 hover:text-blue-800"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReactIntegrationGuide;
