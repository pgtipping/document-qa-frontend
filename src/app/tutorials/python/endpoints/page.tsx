import React from "react";
import Link from "next/link";

const PythonEndpointsTutorial = () => {
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

      <h1 className="text-3xl font-bold mb-6">Creating API Endpoints</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          This tutorial guides you through creating API endpoints for your
          Document Q&A application using FastAPI. We'll implement endpoints for
          document upload, question answering, and model management, providing a
          complete backend for your application.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Completed the{" "}
            <Link
              href="/tutorials/python/setup"
              className="text-blue-600 hover:text-blue-800"
            >
              FastAPI Server Setup
            </Link>{" "}
            tutorial
          </li>
          <li>Basic understanding of RESTful API principles</li>
          <li>Familiarity with Python and FastAPI</li>
          <li>
            Understanding of Pydantic models for request/response validation
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 1: Define Data Models
        </h2>
        <p className="mb-4">
          First, let's define the data models using Pydantic. Create the{" "}
          <code>app/models/schemas.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from uuid import UUID

class DocumentBase(BaseModel):
    """Base document model."""
    name: str
    content_type: str

class DocumentCreate(DocumentBase):
    """Document creation model."""
    pass

class Document(DocumentBase):
    """Document model with ID."""
    id: str
    created_at: datetime
    size: int
    
    class Config:
        from_attributes = True

class QuestionRequest(BaseModel):
    """Question request model."""
    document_id: str
    question: str
    model: Optional[str] = None

class QuestionResponse(BaseModel):
    """Question response model."""
    answer: str
    document_id: str
    question: str
    model: str
    processing_time: float

class ModelInfo(BaseModel):
    """Model information."""
    id: str
    name: str
    provider: str

class ModelsResponse(BaseModel):
    """Models response."""
    models: List[ModelInfo]

class ErrorResponse(BaseModel):
    """Error response model."""
    detail: str`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 2: Document Service
        </h2>
        <p className="mb-4">
          Create the document service to handle document processing. Create the{" "}
          <code>app/services/document_service.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import os
import uuid
import aiofiles
import logging
from datetime import datetime
from fastapi import UploadFile, HTTPException
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class DocumentService:
    """Service for document operations."""
    
    async def save_document(self, file: UploadFile) -> str:
        """Save an uploaded document and return its ID."""
        try:
            # Validate file
            await self._validate_file(file)
            
            # Generate unique ID
            document_id = str(uuid.uuid4())
            
            # Create directory if it doesn't exist
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            
            # Save file
            file_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}")
            async with aiofiles.open(file_path, 'wb') as out_file:
                content = await file.read()
                await out_file.write(content)
            
            # Save metadata
            metadata = {
                "id": document_id,
                "name": file.filename,
                "content_type": file.content_type,
                "size": len(content),
                "created_at": datetime.now().isoformat()
            }
            
            await self._save_metadata(document_id, metadata)
            
            return document_id
        except Exception as e:
            logger.error(f"Error saving document: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_document(self, document_id: str) -> Dict[str, Any]:
        """Get document by ID."""
        try:
            # Get metadata
            metadata = await self._get_metadata(document_id)
            
            # Get content
            file_path = os.path.join(settings.UPLOAD_DIR, document_id)
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="Document not found")
            
            return metadata
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting document: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def get_document_content(self, document_id: str) -> str:
        """Get document content by ID."""
        try:
            # Get file path
            file_path = os.path.join(settings.UPLOAD_DIR, document_id)
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="Document not found")
            
            # Read content
            async with aiofiles.open(file_path, 'rb') as file:
                content = await file.read()
            
            # Extract text based on content type
            metadata = await self._get_metadata(document_id)
            content_type = metadata.get("content_type", "")
            
            if content_type == "application/pdf":
                # Process PDF
                return self._extract_text_from_pdf(content)
            elif content_type == "text/plain":
                # Process text
                return content.decode("utf-8")
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported content type: {content_type}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting document content: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all documents."""
        try:
            documents = []
            
            # Get all document IDs
            for filename in os.listdir(settings.UPLOAD_DIR):
                if os.path.isfile(os.path.join(settings.UPLOAD_DIR, filename)) and not filename.endswith(".metadata"):
                    try:
                        metadata = await self._get_metadata(filename)
                        documents.append(metadata)
                    except Exception:
                        # Skip documents with missing metadata
                        continue
            
            return documents
        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _validate_file(self, file: UploadFile) -> None:
        """Validate file."""
        # Check file type
        allowed_types = ["application/pdf", "text/plain"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Check file size (10MB limit)
        content = await file.read()
        await file.seek(0)  # Reset file position
        
        max_size = 10 * 1024 * 1024  # 10MB
        if len(content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {max_size / (1024 * 1024)}MB"
            )
    
    async def _save_metadata(self, document_id: str, metadata: Dict[str, Any]) -> None:
        """Save document metadata."""
        import json
        
        metadata_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}.metadata")
        async with aiofiles.open(metadata_path, 'w') as file:
            await file.write(json.dumps(metadata))
    
    async def _get_metadata(self, document_id: str) -> Dict[str, Any]:
        """Get document metadata."""
        import json
        
        metadata_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}.metadata")
        if not os.path.exists(metadata_path):
            raise HTTPException(status_code=404, detail="Document metadata not found")
        
        async with aiofiles.open(metadata_path, 'r') as file:
            content = await file.read()
            return json.loads(content)
    
    def _extract_text_from_pdf(self, content: bytes) -> str:
        """Extract text from PDF content."""
        try:
            from pypdf import PdfReader
            from io import BytesIO
            
            pdf = PdfReader(BytesIO(content))
            text = ""
            
            for page in pdf.pages:
                text += page.extract_text() + "\\n"
            
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to extract text from PDF")

# Create service instance
document_service = DocumentService()`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 3: LLM Service</h2>
        <p className="mb-4">
          Create the LLM service to handle question answering. Create the{" "}
          <code>app/services/llm_service.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`import logging
import time
from typing import Dict, Any, Optional, List
from fastapi import HTTPException
from app.core.config import settings
from app.services.document_service import document_service

logger = logging.getLogger(__name__)

class LLMService:
    """Service for LLM operations."""
    
    def __init__(self):
        """Initialize LLM service."""
        self.clients = {}
        self._initialize_clients()
    
    def _initialize_clients(self) -> None:
        """Initialize LLM clients."""
        # Initialize Groq client
        if settings.GROQ_API_KEY:
            try:
                import groq
                self.clients["groq"] = groq.Groq(api_key=settings.GROQ_API_KEY)
                logger.info("Groq client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {str(e)}")
        
        # Initialize Together client
        if settings.TOGETHER_API_KEY:
            try:
                import together
                together.api_key = settings.TOGETHER_API_KEY
                self.clients["together"] = together
                logger.info("Together client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Together client: {str(e)}")
        
        # Initialize Deepseek client
        if settings.DEEPSEEK_API_KEY:
            try:
                from deepseek import DeepSeekAPI
                self.clients["deepseek"] = DeepSeekAPI(api_key=settings.DEEPSEEK_API_KEY)
                logger.info("Deepseek client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Deepseek client: {str(e)}")
        
        # Initialize Gemini client
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.clients["gemini"] = genai
                logger.info("Gemini client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {str(e)}")
        
        # Initialize OpenAI client
        if settings.OPENAI_API_KEY:
            try:
                import openai
                self.clients["openai"] = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    
    async def get_answer(self, document_id: str, question: str, model: Optional[str] = None) -> Dict[str, Any]:
        """Get answer to a question about a document."""
        start_time = time.time()
        
        try:
            # Get document content
            document_content = await document_service.get_document_content(document_id)
            
            # Determine model and provider
            provider, model_name = self._get_provider_and_model(model)
            
            # Get answer from LLM
            answer = await self._get_llm_response(provider, model_name, document_content, question)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            return {
                "answer": answer,
                "document_id": document_id,
                "question": question,
                "model": model_name,
                "processing_time": processing_time
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting answer: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def _get_provider_and_model(self, model: Optional[str] = None) -> tuple:
        """Get provider and model name."""
        if model:
            # Find provider for the specified model
            for provider, models in settings.AVAILABLE_MODELS.items():
                if model in models:
                    return provider, model
            
            # Model not found
            raise HTTPException(status_code=400, detail=f"Model not found: {model}")
        
        # Use default provider and model
        return settings.DEFAULT_PROVIDER, settings.DEFAULT_MODEL
    
    async def _get_llm_response(self, provider: str, model: str, document: str, question: str) -> str:
        """Get response from LLM."""
        if provider not in self.clients:
            raise HTTPException(status_code=500, detail=f"Provider not available: {provider}")
        
        client = self.clients[provider]
        
        # Create prompt
        prompt = f"""Document content:
{document}

Question: {question}

Answer:"""
        
        try:
            # Call appropriate provider
            if provider == "groq":
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided document."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=500
                )
                return response.choices[0].message.content
            
            elif provider == "together":
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided document."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=500
                )
                return response.choices[0].message.content
            
            elif provider == "deepseek":
                response = client.chat(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided document."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=500,
                    stream=False
                )
                return response.choices[0].message.content
            
            elif provider == "gemini":
                model_obj = client.GenerativeModel(model)
                response = model_obj.generate_content(prompt)
                return response.text
            
            elif provider == "openai":
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided document."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=500
                )
                return response.choices[0].message.content
            
            else:
                raise HTTPException(status_code=500, detail=f"Unsupported provider: {provider}")
        
        except Exception as e:
            logger.error(f"Error calling LLM: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}")
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List available models."""
        models = []
        
        for provider, provider_models in settings.AVAILABLE_MODELS.items():
            # Only include models from available providers
            if provider in self.clients:
                for model_id, model_name in provider_models.items():
                    models.append({
                        "id": model_id,
                        "name": model_name,
                        "provider": provider
                    })
        
        return models

# Create service instance
llm_service = LLMService()`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 4: Document Endpoints
        </h2>
        <p className="mb-4">
          Create the document endpoints. Create the{" "}
          <code>app/api/endpoints/documents.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
from app.models.schemas import Document, ErrorResponse
from app.services.document_service import document_service

router = APIRouter()

@router.post("/", response_model=dict, responses={400: {"model": ErrorResponse}})
async def upload_document(file: UploadFile = File(...)) -> dict:
    """Upload a document for Q&A."""
    document_id = await document_service.save_document(file)
    return {
        "document_id": document_id,
        "message": "Document uploaded successfully"
    }

@router.get("/{document_id}", response_model=dict, responses={404: {"model": ErrorResponse}})
async def get_document(document_id: str) -> dict:
    """Get document by ID."""
    return await document_service.get_document(document_id)

@router.get("/", response_model=List[dict])
async def list_documents() -> List[dict]:
    """List all documents."""
    return await document_service.list_documents()`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 5: Chat Endpoints</h2>
        <p className="mb-4">
          Create the chat endpoints for question answering. Create the{" "}
          <code>app/api/endpoints/chat.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`from fastapi import APIRouter, HTTPException
from app.models.schemas import QuestionRequest, QuestionResponse, ErrorResponse
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/ask", response_model=QuestionResponse, responses={
    400: {"model": ErrorResponse},
    404: {"model": ErrorResponse},
    500: {"model": ErrorResponse}
})
async def ask_question(request: QuestionRequest) -> dict:
    """Ask a question about a document."""
    return await llm_service.get_answer(
        document_id=request.document_id,
        question=request.question,
        model=request.model
    )`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Step 6: Models Endpoints
        </h2>
        <p className="mb-4">
          Create the models endpoints for listing available models. Create the{" "}
          <code>app/api/endpoints/models.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`from fastapi import APIRouter
from app.models.schemas import ModelsResponse
from app.services.llm_service import llm_service

router = APIRouter()

@router.get("/", response_model=dict)
async def list_models() -> dict:
    """List available models."""
    models = llm_service.list_models()
    return {"models": models}`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 7: Test Endpoints</h2>
        <p className="mb-4">
          Create test endpoints for verifying the API functionality. Create the{" "}
          <code>app/api/endpoints/test.py</code> file:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md mb-4 overflow-x-auto">
          {`from fastapi import APIRouter, HTTPException
from app.services.llm_service import llm_service
from app.core.config import settings

router = APIRouter()

@router.get("/test-providers")
async def test_providers() -> dict:
    """Test LLM providers."""
    results = {}
    
    for provider, client in llm_service.clients.items():
        results[provider] = "available"
    
    return {
        "providers": results,
        "available_count": len(results),
        "total_configured": len(settings.AVAILABLE_MODELS)
    }`}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Step 8: Testing the API</h2>
        <p className="mb-4">
          Now that we have implemented all the endpoints, let's test the API:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            Start the FastAPI server: <code>python -m app.main</code>
          </li>
          <li>
            Open the Swagger documentation:{" "}
            <code>http://localhost:8001/docs</code>
          </li>
          <li>
            Test the endpoints:
            <ul className="list-disc pl-6 mt-2">
              <li>
                Upload a document using the <code>/api/documents</code> endpoint
              </li>
              <li>
                List available models using the <code>/api/models</code>{" "}
                endpoint
              </li>
              <li>
                Ask a question using the <code>/api/chat/ask</code> endpoint
              </li>
            </ul>
          </li>
        </ol>
        <p className="mb-4">
          You can also use tools like Postman or curl to test the API endpoints.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4">
          Now that you have created the API endpoints, you can:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/tutorials/python/async"
              className="text-blue-600 hover:text-blue-800"
            >
              Learn about asynchronous processing
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
          <li>
            <Link
              href="/tutorials/testing"
              className="text-blue-600 hover:text-blue-800"
            >
              Set up testing for your API
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PythonEndpointsTutorial;
