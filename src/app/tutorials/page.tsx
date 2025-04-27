import React from "react";
import Link from "next/link";

const Tutorials = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Tutorials</h1>

      {/* Getting Started */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Getting Started
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Basic Setup
            </h3>
            <p className="text-gray-600 mb-4">
              Learn how to set up Document Q&A in your application and make your
              first API call.
            </p>
            <Link
              href="/tutorials/basic-setup"
              className="text-blue-600 hover:text-blue-800"
            >
              Read More →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Document Upload
            </h3>
            <p className="text-gray-600 mb-4">
              Learn how to upload and process documents using our API and SDKs.
            </p>
            <Link
              href="/tutorials/document-upload"
              className="text-blue-600 hover:text-blue-800"
            >
              Read More →
            </Link>
          </div>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
            />
          </svg>
          Integration Examples
        </h2>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3">React Integration</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step guide to integrate Document Q&A in a React
              application.
            </p>
            <div className="space-y-2">
              <Link
                href="/tutorials/react/setup"
                className="block text-blue-600 hover:text-blue-800"
              >
                1. Setting up React Components
              </Link>
              <Link
                href="/tutorials/react/upload"
                className="block text-blue-600 hover:text-blue-800"
              >
                2. Implementing File Upload
              </Link>
              <Link
                href="/tutorials/react/qa"
                className="block text-blue-600 hover:text-blue-800"
              >
                3. Building the Q&A Interface
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3">Python Integration</h3>
            <p className="text-gray-600 mb-4">
              Learn how to use Document Q&A with Python and FastAPI.
            </p>
            <div className="space-y-2">
              <Link
                href="/tutorials/python/setup"
                className="block text-blue-600 hover:text-blue-800"
              >
                1. FastAPI Server Setup
              </Link>
              <Link
                href="/tutorials/python/endpoints"
                className="block text-blue-600 hover:text-blue-800"
              >
                2. Creating API Endpoints
              </Link>
              <Link
                href="/tutorials/python/async"
                className="block text-blue-600 hover:text-blue-800"
              >
                3. Async Processing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Topics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Advanced Topics
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3">Error Handling</h3>
            <p className="text-gray-600 mb-4">
              Best practices for handling errors and edge cases in your
              integration.
            </p>
            <Link
              href="/tutorials/error-handling"
              className="text-blue-600 hover:text-blue-800"
            >
              Read More →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3">
              Performance Optimization
            </h3>
            <p className="text-gray-600 mb-4">
              Tips and techniques for optimizing your Document Q&A integration.
            </p>
            <Link
              href="/tutorials/optimization"
              className="text-blue-600 hover:text-blue-800"
            >
              Read More →
            </Link>
          </div>
        </div>
      </section>

      {/* Sample Projects */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Sample Projects
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">React Sample App</h3>
              <p className="text-gray-600 mb-2">
                A complete React application showcasing document upload and Q&A
                functionality.
              </p>
              <a
                href="https://github.com/your-org/document-qa-react-example"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View on GitHub →
              </a>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">
                Python FastAPI Sample
              </h3>
              <p className="text-gray-600 mb-2">
                A FastAPI backend implementation with document processing and
                Q&A endpoints.
              </p>
              <a
                href="https://github.com/your-org/document-qa-fastapi-example"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tutorials;
