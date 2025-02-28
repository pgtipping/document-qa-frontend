import React from "react";
import Link from "next/link";

const TestingTutorial = () => {
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
        Testing Your Document Q&A Application
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          Comprehensive testing is essential for ensuring the reliability and
          quality of your Document Q&A application. This tutorial covers various
          testing strategies for both frontend and backend components, helping
          you build a robust application that handles edge cases gracefully.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frontend Testing</h2>

        <h3 className="text-xl font-medium mb-3">
          1. Setting Up Jest with React Testing Library
        </h3>
        <p className="mb-4">
          First, set up Jest and React Testing Library in your Next.js project:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Create jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
};

# Create jest.setup.js
import '@testing-library/jest-dom';

# Add to package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">2. Component Testing</h3>
        <p className="mb-4">
          Test your React components to ensure they render correctly and handle
          user interactions:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/components/QuestionInput.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionInput from './QuestionInput';
import { client } from '../lib/document-qa';

// Mock the document-qa client
jest.mock('../lib/document-qa', () => ({
  client: {
    askQuestion: jest.fn(),
  },
}));

describe('QuestionInput Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders the question input form', () => {
    render(<QuestionInput documentId="test-doc-123" />);
    
    // Check if the input field and button are rendered
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask question/i })).toBeInTheDocument();
  });

  test('handles question submission', async () => {
    // Mock the API response
    client.askQuestion.mockResolvedValueOnce('This is the answer to your question.');
    
    render(<QuestionInput documentId="test-doc-123" />);
    
    // Type a question
    const inputElement = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(inputElement, 'What is the main topic?');
    
    // Submit the form
    const buttonElement = screen.getByRole('button', { name: /ask question/i });
    fireEvent.click(buttonElement);
    
    // Check if the API was called with correct parameters
    expect(client.askQuestion).toHaveBeenCalledWith({
      documentId: 'test-doc-123',
      question: 'What is the main topic?',
    });
    
    // Wait for the answer to be displayed
    await waitFor(() => {
      expect(screen.getByText('This is the answer to your question.')).toBeInTheDocument();
    });
  });

  test('displays error message when API call fails', async () => {
    // Mock the API error
    client.askQuestion.mockRejectedValueOnce({
      response: { data: { detail: 'Failed to process question' } },
    });
    
    render(<QuestionInput documentId="test-doc-123" />);
    
    // Type a question and submit
    const inputElement = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(inputElement, 'What is the main topic?');
    fireEvent.click(screen.getByRole('button', { name: /ask question/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to process question')).toBeInTheDocument();
    });
  });
});`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          3. Testing File Upload Components
        </h3>
        <p className="mb-4">
          Test file upload components with mocked file objects:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/components/FileUpload.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from './FileUpload';
import apiClient from '../lib/api-client';

// Mock the API client
jest.mock('../lib/api-client', () => ({
  post: jest.fn(),
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({
      onClick: jest.fn(),
    }),
    getInputProps: () => ({}),
    isDragActive: false,
    acceptedFiles: [],
  }),
}));

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the dropzone', () => {
    render(<FileUpload onDocumentUploaded={() => {}} />);
    
    expect(screen.getByText(/drag and drop your file here/i)).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    // Mock successful API response
    apiClient.post.mockResolvedValueOnce({
      data: { document_id: 'test-doc-123' },
    });
    
    const onDocumentUploaded = jest.fn();
    render(<FileUpload onDocumentUploaded={onDocumentUploaded} />);
    
    // Create a mock file
    const file = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
    
    // Simulate file drop
    const dropzone = screen.getByText(/drag and drop your file here/i).closest('div');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    // Wait for the upload to complete
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/upload', expect.any(FormData), expect.any(Object));
      expect(onDocumentUploaded).toHaveBeenCalledWith('test-doc-123');
    });
  });

  test('displays error message when upload fails', async () => {
    // Mock API error
    apiClient.post.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid file format' } },
    });
    
    render(<FileUpload onDocumentUploaded={() => {}} />);
    
    // Create a mock file
    const file = new File(['file content'], 'test.txt', { type: 'text/plain' });
    
    // Simulate file drop
    const dropzone = screen.getByText(/drag and drop your file here/i).closest('div');
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid file format')).toBeInTheDocument();
    });
  });
});`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Integration Testing</h2>

        <h3 className="text-xl font-medium mb-3">1. Testing API Integration</h3>
        <p className="mb-4">
          Test the integration between your frontend and API:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// src/tests/integration/document-qa.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../app/page';
import apiClient from '../../lib/api-client';

// Mock the API client
jest.mock('../../lib/api-client', () => ({
  post: jest.fn(),
}));

describe('Document Q&A Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete document upload and question flow', async () => {
    // Mock successful upload
    apiClient.post.mockResolvedValueOnce({
      data: { document_id: 'test-doc-123' },
    });
    
    // Mock successful question response
    apiClient.post.mockResolvedValueOnce({
      data: { answer: 'This is the answer to your question.' },
    });
    
    render(<App />);
    
    // Step 1: Upload a document
    const file = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByText(/drag and drop your file here/i).closest('div');
    
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    // Wait for upload to complete and UI to update
    await waitFor(() => {
      expect(screen.getByText(/ask questions/i)).toBeInTheDocument();
    });
    
    // Step 2: Ask a question
    const inputElement = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(inputElement, 'What is the main topic?');
    
    fireEvent.click(screen.getByRole('button', { name: /ask question/i }));
    
    // Check if the answer is displayed
    await waitFor(() => {
      expect(screen.getByText('This is the answer to your question.')).toBeInTheDocument();
    });
    
    // Verify API calls
    expect(apiClient.post).toHaveBeenCalledTimes(2);
    expect(apiClient.post.mock.calls[0][0]).toBe('/upload');
    expect(apiClient.post.mock.calls[1][0]).toBe('/ask');
    expect(apiClient.post.mock.calls[1][1]).toEqual({
      document_id: 'test-doc-123',
      question: 'What is the main topic?',
    });
  });
});`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Mock Service Worker
        </h3>
        <p className="mb-4">
          Use Mock Service Worker (MSW) to intercept and mock API requests:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install MSW
npm install --save-dev msw

// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Mock document upload endpoint
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        document_id: 'mock-doc-123',
        message: 'Document uploaded successfully',
      })
    );
  }),
  
  // Mock question answering endpoint
  rest.post('/api/ask', (req, res, ctx) => {
    const { question } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        answer: \`This is a mock answer to: "\${question}"\`,
      })
    );
  }),
];

// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/mocks/browser.js (for browser usage)
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Add to jest.setup.js
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Backend Testing</h2>

        <h3 className="text-xl font-medium mb-3">
          1. FastAPI Endpoint Testing
        </h3>
        <p className="mb-4">Test your FastAPI endpoints using pytest:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install pytest and testing dependencies
pip install pytest pytest-asyncio httpx

# api/tests/test_documents.py
import pytest
from fastapi.testclient import TestClient
from ..main import app
from ..services.document_service import process_document

# Mock the document processing service
@pytest.fixture
def mock_process_document(monkeypatch):
    async def mock_process(*args, **kwargs):
        return {"success": True}
    
    monkeypatch.setattr("api.services.document_service.process_document", mock_process)

client = TestClient(app)

def test_upload_document(mock_process_document):
    # Create a test file
    file_content = b"Test document content"
    files = {"file": ("test.pdf", file_content, "application/pdf")}
    
    # Make the request
    response = client.post("/upload", files=files)
    
    # Check the response
    assert response.status_code == 200
    assert "document_id" in response.json()
    assert "message" in response.json()

def test_upload_invalid_file_type():
    # Create an invalid file type
    file_content = b"Invalid file content"
    files = {"file": ("test.exe", file_content, "application/octet-stream")}
    
    # Make the request
    response = client.post("/upload", files=files)
    
    # Check the response
    assert response.status_code == 400
    assert "detail" in response.json()
    assert "Invalid file type" in response.json()["detail"]

# api/tests/test_qa.py
import pytest
from fastapi.testclient import TestClient
from ..main import app
from ..services.llm_service import get_llm_response

# Mock the LLM service
@pytest.fixture
def mock_llm_service(monkeypatch):
    async def mock_get_response(*args, **kwargs):
        return "This is a mock answer from the LLM."
    
    monkeypatch.setattr("api.services.llm_service.get_llm_response", mock_get_response)

client = TestClient(app)

def test_ask_question(mock_llm_service):
    # Prepare the request data
    data = {
        "document_id": "test-doc-123",
        "question": "What is the main topic?"
    }
    
    # Make the request
    response = client.post("/ask", json=data)
    
    # Check the response
    assert response.status_code == 200
    assert "answer" in response.json()
    assert response.json()["answer"] == "This is a mock answer from the LLM."

def test_ask_question_missing_parameters():
    # Missing document_id
    data = {
        "question": "What is the main topic?"
    }
    
    # Make the request
    response = client.post("/ask", json=data)
    
    # Check the response
    assert response.status_code == 400
    assert "detail" in response.json()
    assert "Missing required parameters" in response.json()["detail"]`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Testing LLM Integration
        </h3>
        <p className="mb-4">Test your LLM service integration:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# api/tests/test_llm_service.py
import pytest
from unittest.mock import patch, MagicMock
from ..services.llm_service import get_llm_response, get_llm_client

@pytest.fixture
def mock_llm_client():
    mock_client = MagicMock()
    mock_completion = MagicMock()
    mock_completion.choices = [MagicMock(text="Mock LLM response")]
    mock_client.completions.create.return_value = mock_completion
    
    with patch("api.services.llm_service.get_llm_client", return_value=mock_client):
        yield mock_client

@pytest.mark.asyncio
async def test_get_llm_response(mock_llm_client):
    # Test parameters
    document_id = "test-doc-123"
    document_content = "This is a test document about AI."
    question = "What is the document about?"
    
    # Mock the document retrieval
    with patch("api.services.document_service.get_document", return_value=document_content):
        # Call the function
        response = await get_llm_response(document_id, question)
        
        # Check the response
        assert response == "Mock LLM response"
        
        # Verify the LLM client was called correctly
        mock_llm_client.completions.create.assert_called_once()
        call_args = mock_llm_client.completions.create.call_args[1]
        assert "Document: This is a test document about AI." in call_args["prompt"]
        assert f"Question: {question}" in call_args["prompt"]`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">End-to-End Testing</h2>

        <h3 className="text-xl font-medium mb-3">1. Setting Up Cypress</h3>
        <p className="mb-4">Set up Cypress for end-to-end testing:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install Cypress
npm install --save-dev cypress

# Add to package.json
"scripts": {
  "cypress:open": "cypress open",
  "cypress:run": "cypress run"
}

# cypress/e2e/document-qa.cy.js
describe('Document Q&A Application', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Intercept API calls
    cy.intercept('POST', '/api/upload', {
      statusCode: 200,
      body: {
        document_id: 'e2e-test-doc-123',
        message: 'Document uploaded successfully',
      },
    }).as('uploadDocument');
    
    cy.intercept('POST', '/api/ask', {
      statusCode: 200,
      body: {
        answer: 'This is a test answer from the E2E test.',
      },
    }).as('askQuestion');
  });

  it('should upload a document and ask a question', () => {
    // Check if the upload component is visible
    cy.contains('h2', 'Upload a Document').should('be.visible');
    
    // Upload a file
    cy.get('input[type="file"]').attachFile('test-document.pdf');
    
    // Wait for the upload to complete
    cy.wait('@uploadDocument');
    
    // Check if the question input is now visible
    cy.contains('h2', 'Ask Questions').should('be.visible');
    
    // Type a question
    cy.get('input[placeholder*="ask a question"]').type('What is the main topic?');
    
    // Submit the question
    cy.contains('button', 'Ask Question').click();
    
    // Wait for the answer
    cy.wait('@askQuestion');
    
    // Check if the answer is displayed
    cy.contains('This is a test answer from the E2E test.').should('be.visible');
  });

  it('should handle file upload errors', () => {
    // Override the upload intercept to return an error
    cy.intercept('POST', '/api/upload', {
      statusCode: 400,
      body: {
        detail: 'Invalid file type',
      },
    }).as('uploadError');
    
    // Upload an invalid file
    cy.get('input[type="file"]').attachFile('invalid-file.exe');
    
    // Wait for the error response
    cy.wait('@uploadError');
    
    // Check if the error message is displayed
    cy.contains('Invalid file type').should('be.visible');
  });
});`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Visual Regression Testing
        </h3>
        <p className="mb-4">
          Add visual regression testing with Cypress and Percy:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install Percy
npm install --save-dev @percy/cypress

# Add to cypress/support/e2e.js
import '@percy/cypress';

# Add to cypress/e2e/visual.cy.js
describe('Visual Regression Tests', () => {
  it('should match the homepage snapshot', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
  });

  it('should match the question interface snapshot', () => {
    // Set up the application state
    cy.visit('/');
    
    // Mock the document upload
    cy.window().then((win) => {
      win.localStorage.setItem('documentId', 'visual-test-doc-123');
    });
    
    // Reload to apply the state
    cy.reload();
    
    // Take a snapshot of the question interface
    cy.percySnapshot('Question Interface');
  });
});`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Performance Testing</h2>

        <h3 className="text-xl font-medium mb-3">1. Lighthouse CI</h3>
        <p className="mb-4">
          Set up Lighthouse CI to test performance metrics:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install Lighthouse CI
npm install --save-dev @lhci/cli

# Create lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'max-potential-fid': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
      },
    },
  },
};

# Add to package.json
"scripts": {
  "lhci": "lhci autorun"
}`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Load Testing with k6
        </h3>
        <p className="mb-4">Set up k6 for load testing your API:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`// k6/load-test.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
  // Test document upload
  const uploadUrl = 'http://localhost:3000/api/upload';
  const uploadPayload = {
    file: http.file('test-document.pdf', 'application/pdf'),
  };
  
  const uploadRes = http.post(uploadUrl, uploadPayload);
  
  check(uploadRes, {
    'upload status is 200': (r) => r.status === 200,
    'upload has document_id': (r) => JSON.parse(r.body).document_id !== undefined,
  });
  
  // Extract document ID
  const documentId = JSON.parse(uploadRes.body).document_id;
  
  // Test question answering
  const askUrl = 'http://localhost:3000/api/ask';
  const askPayload = JSON.stringify({
    document_id: documentId,
    question: 'What is the main topic?',
  });
  
  const askRes = http.post(askUrl, askPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(askRes, {
    'ask status is 200': (r) => r.status === 200,
    'ask has answer': (r) => JSON.parse(r.body).answer !== undefined,
  });
  
  sleep(1);
}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you've implemented comprehensive testing for your Document
          Q&A application, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/deployment"
              className="text-blue-600 hover:text-blue-800"
            >
              Deploy your application
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/monitoring"
              className="text-blue-600 hover:text-blue-800"
            >
              Set up monitoring and analytics
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

export default TestingTutorial;
