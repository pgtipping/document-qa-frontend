import React from "react";

const APIReference = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">API Reference</h1>

      {/* Base URL Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-medium">Production</p>
          <pre className="bg-black text-white p-3 rounded mb-2">
            https://api.document-qa.com
          </pre>
          <p className="font-medium">Development</p>
          <pre className="bg-black text-white p-3 rounded">
            http://localhost:8001
          </pre>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        <p className="mb-4">
          All API requests require an API key to be sent in the Authorization
          header:
        </p>
        <pre className="bg-black text-white p-3 rounded">
          Authorization: Bearer your-api-key
        </pre>
      </section>

      {/* Endpoints Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>

        {/* Document Management */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">Document Management</h3>

          <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h4 className="font-medium mb-2">Upload Document</h4>
            <pre className="bg-gray-50 p-3 rounded mb-3">
              POST /api/v1/documents Content-Type: multipart/form-data
            </pre>
            <div className="mb-3">
              <p className="font-medium">Parameters:</p>
              <ul className="list-disc pl-6">
                <li>file: The document file (Required)</li>
                <li>Supported formats: PDF, TXT, DOC, DOCX</li>
                <li>Maximum size: 10MB</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-medium mb-2">Get Document Status</h4>
            <pre className="bg-gray-50 p-3 rounded mb-3">
              GET /api/v1/documents/{"{document_id}"}
            </pre>
          </div>
        </div>

        {/* Question Answering */}
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-3">Question Answering</h3>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-medium mb-2">Ask Question</h4>
            <pre className="bg-gray-50 p-3 rounded mb-3">
              POST /api/v1/questions Content-Type: application/json
            </pre>
            <div className="mb-3">
              <p className="font-medium">Request Body:</p>
              <pre className="bg-gray-50 p-3 rounded">
                {`{
  "document_id": "doc_123abc",
  "question": "What is this document about?",
  "model": "llama2-70b-4096" // Optional
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Rate Limits</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="list-disc pl-6">
            <li>60 requests per minute per API key</li>
            <li>Exceeded limits return 429 Too Many Requests</li>
            <li>Reset time included in response headers</li>
          </ul>
        </div>
      </section>

      {/* SDK Usage Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3">TypeScript/JavaScript</h3>
            <pre className="bg-gray-50 p-3 rounded">
              {`import { DocumentQAClient } from "document-qa-client";

const client = new DocumentQAClient({
  baseURL: "https://api.document-qa.com",
  apiKey: "your-api-key",
});

// Upload document
const doc = await client.uploadDocument(file);

// Ask question
const answer = await client.askQuestion({
  documentId: doc.id,
  question: "What is this document about?",
});`}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-3">Python</h3>
            <pre className="bg-gray-50 p-3 rounded">
              {`from document_qa import DocumentQAClient

client = DocumentQAClient(
    base_url='https://api.document-qa.com',
    api_key='your-api-key'
)

# Upload document
doc = client.upload_document('path/to/file.pdf')

# Ask question
answer = client.ask_question(
    document_id=doc['id'],
    question='What is this document about?'
)`}
            </pre>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">For support or feature requests:</p>
          <ul className="list-disc pl-6">
            <li>
              <a
                href="https://github.com/your-org/document-qa/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                GitHub Issues
              </a>
            </li>
            <li>
              <a
                href="mailto:support@document-qa.com"
                className="text-blue-600 hover:text-blue-800"
              >
                support@document-qa.com
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default APIReference;
