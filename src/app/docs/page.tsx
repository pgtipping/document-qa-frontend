import React from "react";
import Link from "next/link";
import Image from "next/image";

const Documentation = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>

      <div className="space-y-8">
        {/* Quick Start Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Installation</h3>

            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">JavaScript/TypeScript</p>
              <pre className="bg-black text-white p-3 rounded">
                npm install document-qa-client
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">Python</p>
              <pre className="bg-black text-white p-3 rounded">
                pip install document-qa
              </pre>
            </div>
          </div>
        </section>

        {/* Integration Guides */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">How to Use InQDoc</h2>
          <div className="space-y-4">
            <p>
              Learn how to use InQDoc to upload documents, ask questions, and
              generate quizzes. See the{" "}
              <Link
                href="/docs/how-to-use"
                className="text-blue-600 hover:text-blue-800"
              >
                How to Use Guide
              </Link>{" "}
              for a step-by-step walkthrough.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Document Management</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload and process documents</li>
                <li>Multiple file format support</li>
                <li>Document status tracking</li>
                <li>Secure storage</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Question Answering</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Natural language processing</li>
                <li>Multiple AI model support</li>
                <li>Context-aware responses</li>
                <li>High accuracy results</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
          <div className="space-y-4">
            <ul className="space-y-4">
              <li>
                <Link
                  href="/api-docs"
                  className="text-blue-600 hover:text-blue-800 flex items-center group"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600 group-hover:text-blue-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials"
                  className="text-blue-600 hover:text-blue-800 flex items-center group"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600 group-hover:text-blue-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Tutorials
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/your-org/document-qa/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center group"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600 group-hover:text-blue-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  Issue Tracker
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* Onboarding Guide */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Getting Started: Onboarding Guide
          </h2>
          <ol className="list-decimal pl-6 space-y-8">
            <li>
              <strong>Register:</strong> Create your free InQDoc account using
              the Sign Up button at the top right.
              <div className="mt-2">
                <Image
                  src="/onboarding/register.png"
                  alt="Registration Screenshot"
                  width={600}
                  height={350}
                  className="rounded shadow"
                />
              </div>
            </li>
            <li>
              <strong>Upload Documents:</strong> Go to the Chat page and use the
              Upload button to add your PDF, DOCX, or TXT files. Uploaded
              documents will appear in your document list.
              <div className="mt-2">
                <Image
                  src="/onboarding/upload.png"
                  alt="Upload Screenshot"
                  width={600}
                  height={350}
                  className="rounded shadow"
                />
              </div>
            </li>
            <li>
              <strong>Ask Questions:</strong> Select a document and type your
              question in the chat input. The AI will answer based on your
              document's content.
              <div className="mt-2">
                <Image
                  src="/onboarding/ask.png"
                  alt="Ask Question Screenshot"
                  width={600}
                  height={350}
                  className="rounded shadow"
                />
              </div>
            </li>
            <li>
              <strong>Generate Quizzes:</strong> Use the quiz feature to
              automatically generate questions and test your understanding of
              the document.
              <div className="mt-2">
                <Image
                  src="/onboarding/quiz.png"
                  alt="Quiz Screenshot"
                  width={600}
                  height={350}
                  className="rounded shadow"
                />
              </div>
            </li>
            <li>
              <strong>Review Results:</strong> View your quiz results and chat
              history at any time from your dashboard.
              <div className="mt-2">
                <Image
                  src="/onboarding/results.png"
                  alt="Results Screenshot"
                  width={600}
                  height={350}
                  className="rounded shadow"
                />
              </div>
            </li>
          </ol>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">
              Watch the Quick Start Video
            </h3>
            <video controls width="600" className="rounded shadow">
              <source src="/onboarding/intro.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h4 className="font-semibold mb-2">Tips for Best Results</h4>
            <ul className="list-disc pl-5 space-y-1 text-blue-900">
              <li>
                Upload documents with clear, searchable text (avoid scanned
                images).
              </li>
              <li>
                Select only the documents you want to query for focused answers.
              </li>
              <li>
                Use the "Generate Question" feature for inspiration if you're
                not sure what to ask.
              </li>
              <li>
                Review your quiz results to identify knowledge gaps and track
                your progress.
              </li>
              <li>
                If you get an unexpected answer, try rephrasing your question or
                checking the selected documents.
              </li>
            </ul>
          </div>
          <div className="mt-4 text-gray-600">
            For more details, see the{" "}
            <Link
              href="/docs/how-to-use"
              className="text-blue-600 hover:text-blue-800"
            >
              How to Use Guide
            </Link>{" "}
            or visit our{" "}
            <Link
              href="/tutorials"
              className="text-blue-600 hover:text-blue-800"
            >
              Tutorials
            </Link>{" "}
            for tips and troubleshooting.
          </div>
        </section>
      </div>
    </div>
  );
};

export default Documentation;
