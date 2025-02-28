import React from "react";
import Link from "next/link";

const DeploymentTutorial = () => {
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
        Deploying Your Document Q&A Application
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          This tutorial guides you through deploying your Document Q&A
          application to production. We'll cover deploying both the Next.js
          frontend and FastAPI backend using Vercel, setting up environment
          variables, and configuring continuous integration and deployment
          (CI/CD).
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>A GitHub repository with your Document Q&A application code</li>
          <li>A Vercel account (free tier is sufficient)</li>
          <li>Your Groq API key for the LLM integration</li>
          <li>
            Basic understanding of environment variables and CI/CD concepts
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Preparing Your Application for Deployment
        </h2>

        <h3 className="text-xl font-medium mb-3">1. Environment Variables</h3>
        <p className="mb-4">
          Create a <code>.env.example</code> file to document required
          environment variables:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# .env.example

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# LLM Configuration
GROQ_API_KEY=your-groq-api-key

# Document Storage
DOCUMENT_STORAGE_PATH=./tmp/documents

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id`}</pre>
        </div>
        <p className="mb-4">
          Make sure your application code references these environment
          variables:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`// src/lib/api-client.js
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  // ...
});

// api/services/llm_service.py
def get_llm_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    
    return GroqClient(api_key=api_key)`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Update package.json
        </h3>
        <p className="mb-4">
          Ensure your <code>package.json</code> has the correct build and start
          scripts:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`{
  "name": "document-qa-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          3. Create a Vercel Configuration File
        </h3>
        <p className="mb-4">
          Create a <code>vercel.json</code> file in the root of your project:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "functions": {
    "api/**/*": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}`}</pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Deploying the Frontend</h2>

        <h3 className="text-xl font-medium mb-3">1. Connect to Vercel</h3>
        <p className="mb-4">
          Follow these steps to deploy your Next.js frontend to Vercel:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            Sign in to{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Vercel
            </a>
          </li>
          <li>Click "Add New" and select "Project"</li>
          <li>Import your GitHub repository</li>
          <li>
            Configure the project settings:
            <ul className="list-disc pl-6 mt-2">
              <li>Framework Preset: Next.js</li>
              <li>
                Root Directory: <code>./</code> (or the path to your frontend
                code if in a monorepo)
              </li>
              <li>
                Build Command: <code>npm run build</code>
              </li>
              <li>
                Output Directory: <code>.next</code>
              </li>
            </ul>
          </li>
        </ol>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Configure Environment Variables
        </h3>
        <p className="mb-4">
          Add your environment variables in the Vercel project settings:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            In your project dashboard, go to "Settings" &gt; "Environment
            Variables"
          </li>
          <li>
            Add each environment variable from your <code>.env.example</code>{" "}
            file:
            <ul className="list-disc pl-6 mt-2">
              <li>
                NEXT_PUBLIC_API_URL: Set to your API URL (e.g.,{" "}
                <code>https://your-app.vercel.app/api</code>)
              </li>
              <li>GROQ_API_KEY: Your Groq API key</li>
              <li>Add any other required variables</li>
            </ul>
          </li>
          <li>Click "Save" to apply the changes</li>
        </ol>

        <h3 className="text-xl font-medium mb-3 mt-6">3. Deploy</h3>
        <p className="mb-4">
          Click "Deploy" to start the deployment process. Vercel will build and
          deploy your application.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Deploying the Backend API
        </h2>

        <h3 className="text-xl font-medium mb-3">
          1. Serverless Functions with Vercel
        </h3>
        <p className="mb-4">
          To deploy your FastAPI backend as serverless functions on Vercel,
          create an <code>api</code> directory in your project root:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# Project structure
/
├── api/
│   ├── index.py           # Main API entry point
│   ├── upload.py          # Document upload endpoint
│   ├── ask.py             # Question answering endpoint
│   ├── requirements.txt   # Python dependencies
│   └── services/          # API services
├── src/                   # Frontend code
├── public/
├── package.json
└── vercel.json`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Create API Entry Points
        </h3>
        <p className="mb-4">
          Create serverless function files for each API endpoint:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# api/index.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
async def root():
    return {"message": "Document Q&A API is running"}

# Create handler for AWS Lambda / Vercel
handler = Mangum(app)

# api/upload.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os
import uuid
from tempfile import NamedTemporaryFile

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ["application/pdf", "text/plain"]:
        return {"detail": "Invalid file type. Only PDF and text files are supported."}, 400
    
    # Generate document ID
    document_id = str(uuid.uuid4())
    
    # In a serverless environment, we need to use temporary storage
    # or cloud storage like S3. For this example, we'll use /tmp
    with NamedTemporaryFile(delete=False, dir="/tmp", suffix=f"_{document_id}") as tmp:
        # Write file content
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    # In a real application, you would process the document here
    # and store metadata in a database
    
    return {
        "document_id": document_id,
        "message": "Document uploaded successfully"
    }

# Create handler for AWS Lambda / Vercel
handler = Mangum(app)

# api/ask.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ask")
async def ask_question(request: Request):
    data = await request.json()
    document_id = data.get("document_id")
    question = data.get("question")
    
    # Validate inputs
    if not document_id or not question:
        return {"detail": "Missing required parameters"}, 400
    
    # In a real application, you would:
    # 1. Retrieve the document content
    # 2. Call the LLM service
    # 3. Return the answer
    
    # For this example, we'll simulate an LLM response
    answer = f"This is a simulated answer to: '{question}'"
    
    return {"answer": answer}

# Create handler for AWS Lambda / Vercel
handler = Mangum(app)`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          3. Create requirements.txt
        </h3>
        <p className="mb-4">
          Create a <code>requirements.txt</code> file in the <code>api</code>{" "}
          directory:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`fastapi==0.95.0
mangum==0.17.0
python-multipart==0.0.6
pydantic==1.10.7
groq==0.4.0
python-dotenv==1.0.0`}</pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Setting Up CI/CD</h2>

        <h3 className="text-xl font-medium mb-3">1. GitHub Actions for CI</h3>
        <p className="mb-4">
          Create a GitHub Actions workflow file at{" "}
          <code>.github/workflows/ci.yml</code>:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r api/requirements.txt
        pip install pytest pytest-asyncio httpx
    
    - name: Run API tests
      run: |
        cd api
        pytest`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Vercel GitHub Integration
        </h3>
        <p className="mb-4">
          Vercel automatically integrates with GitHub to provide continuous
          deployment:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            Each push to your main branch will trigger a production deployment
          </li>
          <li>Pull requests will create preview deployments</li>
          <li>
            You can configure additional settings in the Vercel project
            dashboard:
            <ul className="list-disc pl-6 mt-2">
              <li>Go to "Settings" &gt; "Git"</li>
              <li>Configure production branch and preview branches</li>
              <li>Set up build and development settings</li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Production Considerations
        </h2>

        <h3 className="text-xl font-medium mb-3">1. Document Storage</h3>
        <p className="mb-4">
          For production, consider using a cloud storage solution instead of
          temporary storage:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# Install AWS SDK
pip install boto3

# api/services/storage_service.py
import boto3
import os
from botocore.exceptions import ClientError

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)

bucket_name = os.environ.get('S3_BUCKET_NAME')

async def upload_document_to_s3(file_content, document_id, file_extension):
    """Upload a document to S3 bucket"""
    try:
        file_key = f"documents/{document_id}{file_extension}"
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=file_content
        )
        return {
            "bucket": bucket_name,
            "key": file_key
        }
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        raise

async def get_document_from_s3(document_id):
    """Get a document from S3 bucket"""
    try:
        # In a real app, you would store the file key in a database
        # For this example, we'll try to find the file by listing objects
        prefix = f"documents/{document_id}"
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )
        
        if 'Contents' in response and len(response['Contents']) > 0:
            file_key = response['Contents'][0]['Key']
            obj = s3_client.get_object(
                Bucket=bucket_name,
                Key=file_key
            )
            return obj['Body'].read()
        
        return None
    except ClientError as e:
        print(f"Error retrieving from S3: {e}")
        raise`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          2. Database Integration
        </h3>
        <p className="mb-4">
          Add a database to store document metadata and user sessions:
        </p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# Install database driver
pip install motor

# api/services/database_service.py
import os
import motor.motor_asyncio
from bson import ObjectId

# MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("MONGODB_URI"))
db = client.document_qa_db

documents_collection = db.documents

async def create_document(document_data):
    """Create a new document record"""
    result = await documents_collection.insert_one(document_data)
    return str(result.inserted_id)

async def get_document(document_id):
    """Get document by ID"""
    if not ObjectId.is_valid(document_id):
        return None
    
    document = await documents_collection.find_one({"_id": ObjectId(document_id)})
    return document

async def update_document(document_id, update_data):
    """Update document data"""
    if not ObjectId.is_valid(document_id):
        return False
    
    result = await documents_collection.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": update_data}
    )
    
    return result.modified_count > 0`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">
          3. Rate Limiting and Security
        </h3>
        <p className="mb-4">Implement rate limiting and security measures:</p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# Install dependencies
pip install fastapi-limiter redis

# api/main.py
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis
import os

app = FastAPI()

# Configure CORS with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up Redis for rate limiting
@app.on_event("startup")
async def startup():
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_client)

# Apply rate limiting to endpoints
@app.post("/api/upload")
@app.post("/api/ask")
@app.get("/api/documents/{document_id}")
async def rate_limited_endpoints(
    request: Request,
    _=Depends(RateLimiter(times=10, seconds=60))  # 10 requests per minute
):
    # Your endpoint logic here
    pass`}</pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Monitoring and Logging</h2>

        <h3 className="text-xl font-medium mb-3">1. Vercel Analytics</h3>
        <p className="mb-4">Enable Vercel Analytics for your project:</p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>Go to your Vercel project dashboard</li>
          <li>Navigate to "Analytics" tab</li>
          <li>Click "Enable Analytics"</li>
          <li>Configure the settings as needed</li>
        </ol>

        <h3 className="text-xl font-medium mb-3 mt-6">2. Custom Logging</h3>
        <p className="mb-4">Implement custom logging for your API:</p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# api/utils/logger.py
import logging
import json
import os
import sys
from datetime import datetime

class CustomJSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if hasattr(record, 'request_id'):
            log_record["request_id"] = record.request_id
            
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

def setup_logger():
    logger = logging.getLogger("document_qa_api")
    logger.setLevel(logging.INFO)
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(CustomJSONFormatter())
    
    logger.addHandler(handler)
    
    return logger

logger = setup_logger()

# Usage in API endpoints
from .utils.logger import logger

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    request_id = str(uuid.uuid4())
    logger.info(f"Processing upload request", extra={"request_id": request_id})
    
    try:
        # Process upload
        # ...
        logger.info(f"Document uploaded successfully", extra={"request_id": request_id})
        return {"document_id": document_id}
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}", extra={"request_id": request_id}, exc_info=True)
        raise`}</pre>
        </div>

        <h3 className="text-xl font-medium mb-3 mt-6">3. Error Tracking</h3>
        <p className="mb-4">Integrate an error tracking service like Sentry:</p>
        <div className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          <pre>{`# Install Sentry SDK
pip install sentry-sdk

# api/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

# Initialize Sentry
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,  # Adjust in production
    environment=os.environ.get("ENVIRONMENT", "development"),
)

# Frontend integration
// src/pages/_app.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust in production
  environment: process.env.NODE_ENV,
});`}</pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you've deployed your Document Q&A application, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/monitoring"
              className="text-blue-600 hover:text-blue-800"
            >
              Set up comprehensive monitoring and analytics
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/scaling"
              className="text-blue-600 hover:text-blue-800"
            >
              Learn about scaling your application
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

export default DeploymentTutorial;
