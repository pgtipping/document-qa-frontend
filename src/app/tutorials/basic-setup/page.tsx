import React from "react";
import Link from "next/link";

const BasicSetupTutorial = () => {
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

      <h1 className="text-3xl font-bold mb-6">Basic Setup Tutorial</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Node.js 18.0 or higher</li>
          <li>Python 3.11 or higher</li>
          <li>Git</li>
          <li>
            API keys for at least one LLM provider (Groq, Together, Deepseek,
            Gemini, or OpenAI)
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 1: Clone the Repository
        </h2>
        <p className="mb-4">Start by cloning the Document Q&A repository:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          git clone https://github.com/your-org/document-qa.git cd document-qa
        </pre>
        <p className="text-sm text-gray-600">
          This repository contains both the frontend and backend code needed for
          the Document Q&A application.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 2: Backend Setup</h2>
        <p className="mb-4">Set up the Python backend:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          cd backend python -m venv venv source venv/bin/activate # On Windows:
          venv\Scripts\activate pip install -r requirements.txt
        </pre>

        <h3 className="text-xl font-medium mt-6 mb-3">
          Configure Environment Variables
        </h3>
        <p className="mb-4">
          Create a <code>.env</code> file in the backend directory with the
          following variables:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          # Required LLM API keys (at least one is required)
          GROQ_API_KEY=your_groq_api_key TOGETHER_API_KEY=your_together_api_key
          DEEPSEEK_API_KEY=your_deepseek_api_key
          GEMINI_API_KEY=your_gemini_api_key OPENAI_API_KEY=your_openai_api_key
          # Optional AWS configuration for metrics
          AWS_ACCESS_KEY_ID=your_aws_access_key
          AWS_SECRET_ACCESS_KEY=your_aws_secret_key AWS_REGION=us-east-1
          S3_BUCKET=your_bucket_name
          S3_PERFORMANCE_LOGS_PREFIX=performance_logs/ # Application settings
          UPLOAD_DIR=./uploads MAX_FILE_SIZE=10485760 # 10MB in bytes
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 3: Frontend Setup</h2>
        <p className="mb-4">Set up the Next.js frontend:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          cd ../frontend npm install
        </pre>

        <h3 className="text-xl font-medium mt-6 mb-3">
          Configure Environment Variables
        </h3>
        <p className="mb-4">
          Create a <code>.env.local</code> file in the frontend directory:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          NEXT_PUBLIC_API_URL=http://localhost:8001
          BACKEND_URL=http://localhost:8001
          NEXT_PUBLIC_BASE_URL=http://localhost:3000
          NEXT_PUBLIC_ENABLE_METRICS_DASHBOARD=true
          NEXT_PUBLIC_ENABLE_MODEL_SELECTION=true
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 4: Start the Application
        </h2>
        <p className="mb-4">Start the backend server:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          # In the backend directory with venv activated python -m uvicorn
          app.main:app --reload --port 8001
        </pre>

        <p className="mb-4">Start the frontend development server:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          # In the frontend directory npm run dev
        </pre>

        <p className="mb-4">
          The application should now be running at{" "}
          <a
            href="http://localhost:3000"
            className="text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            http://localhost:3000
          </a>
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 5: Verify Installation
        </h2>
        <p className="mb-4">To verify that everything is working correctly:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Navigate to <code>http://localhost:3000</code> in your browser
          </li>
          <li>Go to the Chat page</li>
          <li>Upload a document (PDF, TXT, DOC, or DOCX)</li>
          <li>Ask a question about the document</li>
          <li>Verify that you receive a response from the LLM</li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you have the basic setup working, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/document-upload"
              className="text-blue-600 hover:text-blue-800"
            >
              Learn about document upload and processing
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/error-handling"
              className="text-blue-600 hover:text-blue-800"
            >
              Implement error handling
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

export default BasicSetupTutorial;
