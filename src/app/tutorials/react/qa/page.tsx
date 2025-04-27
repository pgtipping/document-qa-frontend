import React from "react";
import Link from "next/link";

const ReactQATutorial = () => {
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
        Building the Q&A Interface in React
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          This tutorial will guide you through implementing a Question & Answer
          interface for Document Q&A in a React application. We'll create a
          component that allows users to ask questions about their uploaded
          documents and displays the answers.
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
            Completed the{" "}
            <Link
              href="/tutorials/react/upload"
              className="text-blue-600 hover:text-blue-800"
            >
              File Upload Tutorial
            </Link>
          </li>
          <li>Installed dependencies: document-qa-client, axios</li>
          <li>Basic understanding of React hooks and components</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 1: Create the QuestionInput Component
        </h2>
        <p className="mb-4">
          Create a new file <code>src/components/QuestionInput.js</code> with
          the following content:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import React, { useState } from 'react';
import { client } from '../lib/document-qa';

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
      const response = await client.askQuestion({
        documentId,
        question,
      });
      
      setAnswer(response);
    } catch (err) {
      console.error('Question error:', err);
      setError(err.response?.data?.detail || 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="question-form">
        <div className="mb-4">
          <label htmlFor="question" className="block mb-2 font-medium">
            Ask a question about your document:
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="question-input"
            placeholder="e.g., What is the main topic of this document?"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? 'Processing...' : 'Ask Question'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {answer && (
        <div className="answer">
          <h3 className="font-medium mb-2">Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionInput;`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 2: Add Model Selection (Optional)
        </h2>
        <p className="mb-4">
          You can enhance the Q&A component by adding model selection:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import React, { useState, useEffect } from 'react';
import { client } from '../lib/document-qa';

const QuestionInput = ({ documentId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await client.listModels();
        
        // Flatten the models from different providers
        const allModels = [];
        Object.entries(response).forEach(([provider, providerModels]) => {
          Object.entries(providerModels).forEach(([modelId, modelName]) => {
            allModels.push({
              id: modelId,
              name: modelName,
              provider,
            });
          });
        });
        
        setModels(allModels);
        
        // Set default model if available
        if (allModels.length > 0) {
          setSelectedModel(allModels[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      }
    };
    
    fetchModels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await client.askQuestion({
        documentId,
        question,
        model: selectedModel,
      });
      
      setAnswer(response);
    } catch (err) {
      console.error('Question error:', err);
      setError(err.response?.data?.detail || 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="question-form">
        {models.length > 0 && (
          <div className="mb-4">
            <label htmlFor="model" className="block mb-2 font-medium">
              Select AI Model:
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="question" className="block mb-2 font-medium">
            Ask a question about your document:
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="question-input"
            placeholder="e.g., What is the main topic of this document?"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? 'Processing...' : 'Ask Question'}
        </button>
      </form>
      
      {/* Error and answer display */}
    </div>
  );
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 3: Implement Chat History
        </h2>
        <p className="mb-4">
          Add chat history to keep track of previous questions and answers:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import React, { useState } from 'react';
import { client } from '../lib/document-qa';

const QuestionInput = ({ documentId }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add the question to chat history immediately
    const newQuestion = {
      id: Date.now(),
      type: 'question',
      content: question,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory((prev) => [...prev, newQuestion]);
    
    try {
      const response = await client.askQuestion({
        documentId,
        question,
      });
      
      // Add the answer to chat history
      const newAnswer = {
        id: Date.now() + 1,
        type: 'answer',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory((prev) => [...prev, newAnswer]);
      
      // Clear the question input
      setQuestion('');
    } catch (err) {
      console.error('Question error:', err);
      setError(err.response?.data?.detail || 'Failed to get answer');
      
      // Add the error to chat history
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: err.response?.data?.detail || 'Failed to get answer',
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="chat-history mb-4">
        {chatHistory.length === 0 ? (
          <p className="text-gray-500 italic">
            Ask a question to start the conversation
          </p>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((item) => (
              <div
                key={item.id}
                className={\`p-3 rounded \${
                  item.type === 'question'
                    ? 'bg-blue-50 ml-auto max-w-[80%]'
                    : item.type === 'answer'
                    ? 'bg-gray-50 mr-auto max-w-[80%]'
                    : 'bg-red-50 mr-auto max-w-[80%]'
                }\`}
              >
                <p>{item.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <div className="flex">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="question-input flex-grow"
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="submit-button ml-2"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      </form>
      
      {error && !chatHistory.some((item) => item.type === 'error') && (
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
        <h2 className="text-2xl font-semibold mb-4">
          Step 4: Add Loading States
        </h2>
        <p className="mb-4">
          Improve the user experience with loading indicators:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// Add a loading indicator to the chat history
{isLoading && (
  <div className="p-3 bg-gray-50 rounded mr-auto max-w-[80%] animate-pulse">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
    </div>
  </div>
)}

// Or use a more sophisticated loading indicator
{isLoading && (
  <div className="p-3 bg-gray-50 rounded mr-auto max-w-[80%]">
    <div className="flex items-center space-x-2">
      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating answer...</span>
    </div>
  </div>
)}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 5: Implement Direct API Calls
        </h2>
        <p className="mb-4">
          For more control, you can use direct API calls instead of the client
          library:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import axios from 'axios';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!question.trim()) return;
  
  setIsLoading(true);
  setError(null);
  
  // Add the question to chat history
  // ...
  
  try {
    const response = await axios.post('/api/ask', {
      document_id: documentId,
      question: question,
      model: selectedModel, // If using model selection
    });
    
    // Add the answer to chat history
    const newAnswer = {
      id: Date.now() + 1,
      type: 'answer',
      content: response.data.answer,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory((prev) => [...prev, newAnswer]);
    setQuestion('');
  } catch (err) {
    console.error('Question error:', err);
    
    // Handle error
    // ...
  } finally {
    setIsLoading(false);
  }
};`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 6: Using the Component
        </h2>
        <p className="mb-4">
          Now you can use the QuestionInput component in your application:
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
          <h2 className="text-xl mb-4">Ask Questions</h2>
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
          Now that you've implemented the Q&A interface, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
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

export default ReactQATutorial;
