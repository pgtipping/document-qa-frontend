import React from "react";
import Link from "next/link";

const PythonSetupTutorial = () => {
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

      <h1 className="text-3xl font-bold mb-6">FastAPI Server Setup</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          This tutorial guides you through setting up a FastAPI backend server
          for your Document Q&A application. FastAPI is a modern,
          high-performance web framework for building APIs with Python, perfect
          for our document processing and question answering system.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Python 3.8+ installed on your system</li>
          <li>Basic knowledge of Python programming</li>
          <li>Familiarity with RESTful API concepts</li>
          <li>A code editor (VS Code, PyCharm, etc.)</li>
          <li>Terminal or command prompt access</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 1: Setting Up the Environment
        </h2>

        <h3 className="text-xl font-medium mb-3">
          Create a Virtual Environment
        </h3>
        <p className="mb-4">
          First, let's create a virtual environment to isolate our project
          dependencies:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Create a project directory
mkdir document-qa-backend
cd document-qa-backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\\Scripts\\activate
# On macOS/Linux
source venv/bin/activate`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">
          Install Required Packages
        </h3>
        <p className="mb-4">
          Now, let's install FastAPI and other required packages:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Install FastAPI and dependencies
pip install fastapi uvicorn python-multipart python-dotenv pydantic aiofiles

# Install LLM provider libraries
pip install groq openai together deepseek-ai google-generativeai

# Create a requirements.txt file
pip freeze > requirements.txt`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 2: Project Structure
        </h2>
        <p className="mb-4">Let's create a well-organized project structure:</p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`document-qa-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration settings
│   │   └── security.py         # Security utilities
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py           # API router
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       ├── documents.py    # Document endpoints
│   │       └── chat.py         # Q&A endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── document_service.py # Document processing
│   │   └── llm_service.py      # LLM integration
│   └── models/
│       ├── __init__.py
│       └── schemas.py          # Pydantic models
├── tests/                      # Test directory
├── .env                        # Environment variables
└── requirements.txt            # Dependencies`}
        </pre>
        <p className="mt-4">
          Create these directories and files using your preferred method. We'll
          populate the key files in the next steps.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 3: Configuration Setup
        </h2>

        <h3 className="text-xl font-medium mb-3">Environment Variables</h3>
        <p className="mb-4">
          Create a <code>.env</code> file in the root directory with the
          following content:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# API Configuration
API_PREFIX=/api
DEBUG=True

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# Document Storage
UPLOAD_DIR=./uploads

# LLM Configuration
GROQ_API_KEY=your-groq-api-key
TOGETHER_API_KEY=your-together-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Default Provider and Model
DEFAULT_PROVIDER=groq
DEFAULT_MODEL=llama-3.2-3b-preview`}
        </pre>

        <h3 className="text-xl font-medium mb-3 mt-6">Configuration Class</h3>
        <p className="mb-4">
          Create the <code>app/core/config.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import os
from typing import List, Dict, Any, Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    # Document Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    # LLM Configuration
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    TOGETHER_API_KEY: Optional[str] = os.getenv("TOGETHER_API_KEY")
    DEEPSEEK_API_KEY: Optional[str] = os.getenv("DEEPSEEK_API_KEY")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # Default Provider and Model
    DEFAULT_PROVIDER: str = os.getenv("DEFAULT_PROVIDER", "groq")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "llama-3.2-3b-preview")
    
    # Available Models
    AVAILABLE_MODELS: Dict[str, Dict[str, str]] = {
        "groq": {
            "llama-3.2-3b-preview": "Meta Llama 3.2-3B",
        },
        "together": {
            "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo": "Meta Llama 3.1-8B",
        },
        "deepseek": {
            "deepseek-chat": "Deepseek V3",
        },
        "gemini": {
            "gemini-1.5-flash-8b": "Gemini 1.5 Flash-8B",
        },
        "openai": {
            "gpt-4o-mini": "GPT-4o mini",
        }
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 4: Creating the Main Application
        </h2>
        <p className="mb-4">
          Create the <code>app/main.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`"""Main application module."""

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.core.config import settings
from app.api.routes import router as api_router

# Configure logging
logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO)
logger = logging.getLogger(__name__)

logger.debug("Starting application initialization")

# Create FastAPI application
app = FastAPI(
    title="Document Q&A API",
    description="API for document upload and Q&A using LLM",
    version="1.0.0",
)

# Configure CORS
logger.debug("Configuring CORS")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Root endpoint
@app.get("/")
async def root() -> dict:
    """Root endpoint providing API information."""
    logger.debug("Root endpoint called")
    return {
        "message": "Welcome to Document Q&A API",
        "version": "1.0.0",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "endpoints": {
            "upload_document": f"{settings.API_PREFIX}/upload",
            "ask_question": f"{settings.API_PREFIX}/ask",
            "list_documents": f"{settings.API_PREFIX}/documents",
            "list_models": f"{settings.API_PREFIX}/models"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.debug("Health check endpoint called")
    return {"status": "healthy"}

# Include API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Run the application
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 5: Setting Up API Routes
        </h2>
        <p className="mb-4">
          Create the <code>app/api/routes.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`from fastapi import APIRouter
from app.api.endpoints import documents, chat, models, test

router = APIRouter()

router.include_router(
    documents.router, prefix="/documents", tags=["documents"]
)
router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(models.router, prefix="/models", tags=["models"])
router.include_router(test.router, prefix="/test", tags=["test"])`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 6: Running the Application
        </h2>
        <p className="mb-4">
          Now that we have set up the basic structure, let's run the
          application:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`# Make sure you're in the project root directory
# Activate the virtual environment if not already activated

# Run the application
python -m app.main

# Alternatively, you can use uvicorn directly
# uvicorn app.main:app --reload --port 8001`}
        </pre>
        <p className="mb-4">
          Your FastAPI server should now be running at{" "}
          <code>http://localhost:8001</code>. You can access the auto-generated
          API documentation at <code>http://localhost:8001/docs</code> or{" "}
          <code>http://localhost:8001/redoc</code>.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you have set up the basic FastAPI server, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/python/endpoints"
              className="text-blue-600 hover:text-blue-800"
            >
              Learn how to create API endpoints
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/python/async"
              className="text-blue-600 hover:text-blue-800"
            >
              Explore asynchronous processing
            </Link>
          </li>
          <li>
            <Link
              href="/tutorials/error-handling"
              className="text-blue-600 hover:text-blue-800"
            >
              Implement comprehensive error handling
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PythonSetupTutorial;
