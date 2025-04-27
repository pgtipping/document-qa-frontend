import React from "react";
import Link from "next/link";

const ReactSetupTutorial = () => {
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

      <h1 className="text-3xl font-bold mb-6">Setting up React Components</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Node.js 18.0 or higher</li>
          <li>npm or yarn</li>
          <li>Basic knowledge of React</li>
          <li>Document Q&A API access</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 1: Create a React Project
        </h2>
        <p className="mb-4">
          Start by creating a new React project using Create React App or
          Next.js:
        </p>

        <h3 className="text-xl font-medium mb-3">Using Create React App</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          npx create-react-app document-qa-react cd document-qa-react
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">Using Next.js</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          npx create-next-app document-qa-next cd document-qa-next
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 2: Install Dependencies
        </h2>
        <p className="mb-4">
          Install the Document Q&A client library and other required
          dependencies:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          npm install document-qa-client axios react-dropzone
        </pre>
        <p className="text-gray-700">
          <strong>Note:</strong> If you're using TypeScript, you'll also need
          the types:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          npm install --save-dev @types/react-dropzone
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 3: Configure Environment Variables
        </h2>
        <p className="mb-4">
          Create a <code>.env</code> file in your project root:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# For Create React App
REACT_APP_API_URL=https://api.document-qa.com

# For Next.js
NEXT_PUBLIC_API_URL=https://api.document-qa.com`}
        </pre>
        <p className="text-gray-700">
          <strong>Note:</strong> For local development, use{" "}
          <code>http://localhost:8001</code> as the API URL.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 4: Create Client Instance
        </h2>
        <p className="mb-4">
          Create a file to initialize the Document Q&A client:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/lib/document-qa.js
import { DocumentQAClient } from 'document-qa-client';

// For Create React App
const apiUrl = process.env.REACT_APP_API_URL;

// For Next.js
// const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const client = new DocumentQAClient({
  baseURL: apiUrl,
});`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 5: Create Basic Components
        </h2>
        <p className="mb-4">
          Let's create the basic components for our Document Q&A application:
        </p>

        <h3 className="text-xl font-medium mb-3">App Component</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/App.js or src/pages/index.js (Next.js)
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import QuestionInput from './components/QuestionInput';

function App() {
  const [documentId, setDocumentId] = useState(null);

  const handleDocumentUploaded = (id) => {
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
}

export default App;`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 6: Add Styling</h2>
        <p className="mb-4">
          You can use CSS, CSS modules, or a CSS-in-JS solution. For simplicity,
          we'll use plain CSS:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`/* src/styles/global.css */
.dropzone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.dropzone:hover {
  border-color: #0070f3;
}

.dropzone.active {
  border-color: #0070f3;
  background-color: rgba(0, 112, 243, 0.05);
}

.progress-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #0070f3;
  transition: width 0.3s ease;
}

.question-form {
  margin-top: 20px;
}

.question-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}

.submit-button {
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.answer {
  margin-top: 20px;
  padding: 15px;
  background-color: #f7f7f7;
  border-radius: 4px;
}
`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you have set up the basic React components, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/react/upload"
              className="text-blue-600 hover:text-blue-800"
            >
              Implement the File Upload component
            </Link>
          </li>
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
              Add error handling
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReactSetupTutorial;
