import React from "react";
import Link from "next/link";

const PythonIntegrationGuide = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        Python/FastAPI Integration Guide
      </h1>

      <div className="space-y-8">
        {/* Installation Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <div className="space-y-4">
            <p>
              To integrate the Document QA system with your Python application,
              start by installing the client library:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded">
                pip install document-qa
              </pre>
            </div>
            <p>
              For a FastAPI application, you'll also need to install FastAPI and
              its dependencies:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded">
                pip install fastapi uvicorn python-multipart
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
                {`# client.py
import os
from document_qa import DocumentQAClient

# Initialize the client
client = DocumentQAClient(
    base_url=os.getenv('DOCUMENT_QA_API_URL', 'https://api.document-qa.com'),
    api_key=os.getenv('DOCUMENT_QA_API_KEY')  # Optional if not using authentication
)`}
              </pre>
            </div>
            <p>
              It's recommended to use environment variables for configuration:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# .env
DOCUMENT_QA_API_URL=https://api.document-qa.com
DOCUMENT_QA_API_KEY=your_api_key_here

# Load environment variables
# pip install python-dotenv
from dotenv import load_dotenv
load_dotenv()  # Load variables from .env file`}
              </pre>
            </div>
          </div>
        </section>

        {/* Document Upload Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Document Upload</h2>
          <div className="space-y-4">
            <p>Upload documents using the client library:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# Example document upload
def upload_document(file_path):
    try:
        # Upload a document from a file path
        result = client.upload_document(file_path)
        print(f"Document uploaded successfully. ID: {result['id']}")
        return result
    except Exception as e:
        print(f"Error uploading document: {e}")
        return None

# Usage
document = upload_document('path/to/document.pdf')`}
              </pre>
            </div>
          </div>
        </section>

        {/* Question Answering Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Question Answering</h2>
          <div className="space-y-4">
            <p>Ask questions about uploaded documents:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# Example question answering
def ask_question(document_id, question, provider=None, model=None):
    try:
        # Ask a question about a document
        params = {
            'document_id': document_id,
            'question': question
        }
        
        # Optional parameters
        if provider:
            params['provider'] = provider
        if model:
            params['model'] = model
            
        result = client.ask_question(**params)
        return result['answer']
    except Exception as e:
        print(f"Error asking question: {e}")
        return None

# Usage
answer = ask_question(
    document_id='doc_123abc',
    question='What is this document about?',
    provider='groq',  # Optional
    model='llama-3.2-3b-preview'  # Optional
)
print(f"Answer: {answer}")`}
              </pre>
            </div>
          </div>
        </section>

        {/* FastAPI Integration */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">FastAPI Integration</h2>
          <div className="space-y-4">
            <p>
              Create a FastAPI application that integrates with the Document QA
              system:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# main.py
import os
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from document_qa import DocumentQAClient

app = FastAPI(title="Document QA API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Document QA client
client = DocumentQAClient(
    base_url=os.getenv('DOCUMENT_QA_API_URL', 'https://api.document-qa.com'),
    api_key=os.getenv('DOCUMENT_QA_API_KEY')
)

# Define request models
class QuestionRequest(BaseModel):
    document_id: str
    question: str
    provider: Optional[str] = None
    model: Optional[str] = None

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for question answering.
    """
    try:
        # Save the uploaded file temporarily
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # Upload to Document QA service
        result = client.upload_document(file_path)
        
        # Clean up the temporary file
        os.remove(file_path)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    Ask a question about an uploaded document.
    """
    try:
        params = {
            'document_id': request.document_id,
            'question': request.question
        }
        
        if request.provider:
            params['provider'] = request.provider
        if request.model:
            params['model'] = request.model
            
        result = client.ask_question(**params)
        return {"answer": result['answer']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def get_models():
    """
    Get available LLM models.
    """
    try:
        return client.get_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`}
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
                {`# errors.py
from typing import Dict, Any, Optional
from fastapi import HTTPException

class DocumentQAError(Exception):
    """Base exception for Document QA errors."""
    def __init__(
        self, 
        message: str, 
        status_code: int = 500, 
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class DocumentNotFoundError(DocumentQAError):
    """Raised when a document is not found."""
    def __init__(self, document_id: str):
        super().__init__(
            message=f"Document not found: {document_id}",
            status_code=404,
            details={"document_id": document_id}
        )

class InvalidFileTypeError(DocumentQAError):
    """Raised when an invalid file type is uploaded."""
    def __init__(self, file_type: str, supported_types: list):
        super().__init__(
            message=f"Invalid file type: {file_type}",
            status_code=400,
            details={
                "file_type": file_type,
                "supported_types": supported_types
            }
        )

# Exception handler for FastAPI
def document_qa_exception_handler(request, exc: DocumentQAError):
    return HTTPException(
        status_code=exc.status_code,
        detail={
            "message": exc.message,
            "details": exc.details
        }
    )

# Register the exception handler in your FastAPI app
# app.add_exception_handler(DocumentQAError, document_qa_exception_handler)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Advanced Features</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Asynchronous Processing</h3>
            <p>Implement background tasks for long-running operations:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# background_tasks.py
from fastapi import BackgroundTasks, FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import time
import os

app = FastAPI()

def process_document(file_path: str, document_id: str):
    """
    Process a document in the background.
    This could include OCR, indexing, or other time-consuming tasks.
    """
    # Simulate long processing
    time.sleep(5)
    
    # Update document status in database
    # db.update_document_status(document_id, "processed")
    
    # Clean up temporary file
    os.remove(file_path)

@app.post("/upload-async")
async def upload_document_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    # Save the uploaded file temporarily
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Generate a document ID
    document_id = f"doc_{int(time.time())}"
    
    # Add the processing task to the background
    background_tasks.add_task(process_document, file_path, document_id)
    
    return JSONResponse(
        status_code=202,
        content={
            "message": "Document upload accepted for processing",
            "document_id": document_id,
            "status": "processing"
        }
    )`}
              </pre>
            </div>

            <h3 className="text-xl font-medium">Caching</h3>
            <p>Implement caching to improve performance:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# caching.py
from fastapi import FastAPI, Depends
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis

app = FastAPI()

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost", encoding="utf8")
    FastAPICache.init(RedisBackend(redis), prefix="document_qa_cache")

@app.get("/cached-models")
@cache(expire=3600)  # Cache for 1 hour
async def get_models_cached():
    """
    Get available LLM models with caching.
    """
    # This expensive operation will be cached
    return client.get_models()

# For question answering, you might want to cache based on parameters
@app.post("/ask-cached")
@cache(expire=3600, namespace="qa")
async def ask_question_cached(request: QuestionRequest):
    """
    Ask a question with caching.
    """
    params = {
        'document_id': request.document_id,
        'question': request.question
    }
    
    if request.provider:
        params['provider'] = request.provider
    if request.model:
        params['model'] = request.model
        
    result = client.ask_question(**params)
    return {"answer": result['answer']}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Authentication and Security */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Authentication and Security
          </h2>
          <div className="space-y-4">
            <p>Implement JWT authentication for your API:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# auth.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Configuration
SECRET_KEY = "your-secret-key"  # Generate a secure key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: Optional[bool] = None

# Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # In a real app, get the user from a database
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user

# FastAPI routes
app = FastAPI()

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Authenticate user (in a real app, check against database)
    if form_data.username != "test" or form_data.password != "test":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Protected Document QA endpoint
@app.post("/ask-protected")
async def ask_question_protected(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user)
):
    # Now only authenticated users can access this endpoint
    return await ask_question(request)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Testing */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Testing</h2>
          <div className="space-y-4">
            <p>Write tests for your Document QA integration:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`# test_api.py
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pytest
from main import app

client = TestClient(app)

# Mock the Document QA client
@pytest.fixture
def mock_document_qa_client():
    with patch("main.client") as mock_client:
        yield mock_client

def test_upload_document(mock_document_qa_client):
    # Mock the client response
    mock_document_qa_client.upload_document.return_value = {
        "id": "test_doc_123",
        "filename": "test.pdf",
        "status": "processed"
    }
    
    # Create a test file
    with open("test.pdf", "wb") as f:
        f.write(b"test content")
    
    # Test the upload endpoint
    with open("test.pdf", "rb") as f:
        response = client.post(
            "/upload",
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 200
    assert response.json() == {
        "id": "test_doc_123",
        "filename": "test.pdf",
        "status": "processed"
    }
    
    # Verify the client was called correctly
    mock_document_qa_client.upload_document.assert_called_once()

def test_ask_question(mock_document_qa_client):
    # Mock the client response
    mock_document_qa_client.ask_question.return_value = {
        "answer": "This is a test answer."
    }
    
    # Test the ask endpoint
    response = client.post(
        "/ask",
        json={
            "document_id": "test_doc_123",
            "question": "What is this document about?"
        }
    )
    
    assert response.status_code == 200
    assert response.json() == {"answer": "This is a test answer."}
    
    # Verify the client was called correctly
    mock_document_qa_client.ask_question.assert_called_once_with(
        document_id="test_doc_123",
        question="What is this document about?"
    )`}
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
                <a
                  href="https://fastapi.tiangolo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  FastAPI Official Documentation
                </a>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-blue-600 hover:text-blue-800"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials/python"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Python Integration Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials/deployment"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Deployment Guide
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PythonIntegrationGuide;
