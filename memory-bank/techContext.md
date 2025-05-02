# Technical Context

## Latest Update [2024-02-27]

### Next.js Configuration

1. Current Configuration:

   - Using next.config.mjs (appropriate for TypeScript project)
   - API rewrites configured to proxy requests to backend
   - Experimental features: largePageDataBytes for large responses
   - Webpack configuration for proper file watching

2. Environment Variables:

   - NEXT_PUBLIC_API_URL: Backend API URL for client-side requests
   - BACKEND_URL: Backend API URL for server-side requests
   - NEXT_PUBLIC_BASE_URL: Base URL for the frontend application
   - NEXT_PUBLIC_ENABLE_METRICS_DASHBOARD: Feature flag for metrics dashboard
   - NEXT_PUBLIC_ENABLE_MODEL_SELECTION: Feature flag for model selection

3. Known Issues:
   - Non-critical warnings from @opentelemetry/instrumentation dependencies
   - EPERM error when accessing trace file during build
   - Performance metrics file not found in some cases

### Integration Components

- TypeScript client library created
- Framework-agnostic API design
- Multi-provider LLM support
- Documentation system

### Technology Stack

- Backend: FastAPI (Python 3.11+)
- Client: TypeScript with Axios
- Testing: Jest and pytest
- Documentation: Markdown with Mermaid

### Recent Changes [2024-02-23 15:45 UTC]

1. Created TypeScript client package
2. Implemented API integration layer
3. Added framework examples (React, Vue)
4. Updated security configuration
5. Enhanced error handling

## Vector Search Implementation [2025-04-30 3:54:00 AM EDT]

- **Purpose:** Implemented semantic search for context retrieval.
- **Vector Database:**
  - **Service:** Pinecone (Managed Service)
  - **Client Library:** `@pinecone-database/pinecone`
  - **Initialization:** `src/lib/pinecone-client.ts`
  - **Configuration:** Requires `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME` environment variables.
- **Embedding Model:**
  - **Service:** OpenAI API
  - **Model:** `text-embedding-3-small` (1536 dimensions)
  - **Client Library:** `openai`
  - **Implementation:** `generateEmbedding` function in `src/lib/llm-service.ts`.
  - **Configuration:** Requires `OPENAI_API_KEY` environment variable.
- **Integration:**
  - `/api/upload/route.ts`: Chunks, embeds, and upserts document content to Pinecone.
  - `/api/ask/route.ts`: Embeds question, queries Pinecone for similar chunks, uses results for context.

---

## Updates [2024-02-22]

- Backend setup completed and verified
- All LLM providers successfully integrated
- Document processing pipeline operational
- API endpoints responding correctly

## Project Structure [2024-02-22]

```tree
document-qa/
├── backend/           # FastAPI backend (✅ Complete)
│   ├── app/          # Application code
│   │   ├── main.py   # Entry point
│   │   ├── api/      # API routes
│   │   └── services/ # Business logic
│   └── tests/        # Backend tests
├── frontend/         # Next.js frontend
│   ├── src/         # Source directory
│   │   ├── app/     # Next.js app directory
│   │   ├── components/  # React components
│   │   │   ├── ui/     # Shadcn components
│   │   │   └── ...     # Custom components
│   │   └── lib/     # Utilities and types
│   └── public/      # Static assets
└── memory-bank/     # Project documentation
```

## Tech Stack [2024-02-22]

### Frontend

- Next.js 14
- React
- TailwindCSS
- TypeScript
- Shadcn/ui
  - Core components:
    - Button
    - Card
    - Input
    - Dialog
    - Toast
    - Select
  - Dependencies:
    - @radix-ui/\* components
    - class-variance-authority
    - clsx
    - tailwind-merge
    - tailwindcss-animate
    - lucide-react

### Backend (✅ Implemented)

- FastAPI (Verified)
- Python 3.11 (Installed)
- LLM Providers (All Operational):
  - Groq API (v0.4.2)
    - Default model: llama-3.2-3b-preview
    - Status: Active and responding
  - Together API (v0.2.8)
    - Model: Meta-Llama-3.1-8B-Instruct-Turbo
    - Status: Active and responding
    - Previous 503 errors resolved
    - Response time: ~4-5s
  - Deepseek API (v1.0.0)
    - Model: deepseek-chat
    - Status: Active and responding
    - Response time: ~10.6s
  - Gemini API (v0.3.2)
    - Model: gemini-1.5-flash-8b
    - Status: Active and responding
    - Response time: ~0.9s
  - OpenAI API (v1.12.0)
    - Model: gpt-4o-mini
    - Status: Active and responding
    - Response time: ~4.4s
- Document Processing (Verified):
  - python-docx
    :start_line:128

---

- python-magic
- aiofiles
- boto3 (for S3 storage)
- PyPDF2 (for PDF extraction)
- python-docx (for DOCX extraction)
- python-magic (for MIME type detection)

### Backend Services (✅ Implemented)

- **LLM Service (`llm.py`)**: Manages interactions with multiple LLM providers (Groq, Together, Deepseek, Gemini, OpenAI). Handles model selection, text chunking, prompt creation, and performance logging to S3.
- **Document Storage (`document_storage.py`)**: Handles saving, retrieving, and deleting documents in an S3 bucket, using a "Doc-Chat" prefix for organization.
- **Document Service (`document.py`)**: Manages document processing, including local file saving, content extraction from various formats (TXT, PDF, DOCX) with an LLM fallback, document listing, and caching of content and paths.

### Development Tools (✅ Configured)

- uvicorn (ASGI server)
- python-multipart
- python-dotenv
- pydantic
- pydantic-settings

## API Endpoints [2024-02-22]

### Backend Routes (✅ Operational)

- `/api/upload` - Document upload (Tested)
- `/api/ask` - Question answering (Verified)
- `/api/models` - Model listing (Active)
- `/api/documents` - Document management (Working)

### Frontend Routes

- `/` - Main application
- `/api/ask` - Question proxy
- `/api/models` - Models proxy
- `/api/upload` - Upload proxy

## Configuration [2024-02-22]

### Environment Variables (✅ Configured)

Required in `.env` (All verified):

- `GROQ_API_KEY` (Active)
- `TOGETHER_API_KEY` (Set)
- `DEEPSEEK_API_KEY` (Set)
- `GEMINI_API_KEY` (Set)
- `OPENAI_API_KEY` (Set)

### Model Configuration (✅ Implemented)

```python
AVAILABLE_MODELS = {
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
```

## Development Setup [2024-02-22]

### Backend (✅ Complete)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Security Considerations [2024-02-22]

### API Security (✅ Implemented)

- API keys stored in environment variables
- No API keys exposed to frontend
- Rate limiting implemented
- Input validation on all endpoints

### Document Security (✅ Verified)

- Temporary file storage
- MIME type validation
- File size limits
- Secure file handling

### Model Security (✅ Active)

- Provider-specific error handling
- Response validation
- Secure API communication
- Model access control

## UI/UX Design System

### Colors

1. **Primary Palette**

   - Primary: hsl(221.2 83.2% 53.3%)
   - Primary Foreground: hsl(210 40% 98%)
   - Secondary: hsl(210 40% 96.1%)
   - Secondary Foreground: hsl(222.2 47.4% 11.2%)

2. **Accent Colors**

   - Accent: hsl(210 40% 96.1%)
   - Accent Foreground: hsl(222.2 47.4% 11.2%)
   - Muted: hsl(210 40% 96.1%)
   - Muted Foreground: hsl(215.4 16.3% 46.9%)

3. **Status Colors**
   - Destructive: hsl(0 84.2% 60.2%)
   - Success: hsl(142.1 76.2% 36.3%)
   - Warning: hsl(35.5 91.7% 32.9%)

### Typography

1. **Font Families**

   - Primary: Inter
   - System: system-ui, -apple-system
   - Monospace: ui-monospace, monospace

2. **Font Sizes**

   - xs: 0.75rem
   - sm: 0.875rem
   - base: 1rem
   - lg: 1.125rem
   - xl: 1.25rem
   - 2xl: 1.5rem
   - 3xl: 1.875rem
   - 4xl: 2.25rem

3. **Font Weights**
   - normal: 400
   - medium: 500
   - semibold: 600
   - bold: 700

### Spacing

1. **Base Units**

   - 0: 0px
   - px: 1px
   - 0.5: 0.125rem
   - 1: 0.25rem
   - 2: 0.5rem
   - 4: 1rem
   - 6: 1.5rem
   - 8: 2rem

2. **Component Spacing**
   - Card Padding: 1.5rem
   - Input Padding: 0.5rem
   - Button Padding: 0.5rem 1rem
   - Dialog Spacing: 1rem
   - Toast Spacing: 0.75rem

### Animations

1. **Transitions**

   - Default: 150ms cubic-bezier(0.4, 0, 0.2, 1)
   - Slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
   - Fast: 100ms cubic-bezier(0.4, 0, 0.2, 1)

2. **Effects**
   - Hover Scale: scale(1.02)
   - Active Scale: scale(0.98)
   - Focus Ring: ring-2 ring-offset-2
   - Shadow: 0 1px 3px rgba(0,0,0,0.1)

### Component Variants

1. **Buttons**

   - Primary: Solid background
   - Secondary: Light background
   - Outline: Border only
   - Ghost: No background
   - Destructive: Red variant

2. **Cards**

   - Default: Light background
   - Bordered: With border
   - Elevated: With shadow
   - Interactive: With hover
   - Gradient: With gradient border

3. **Inputs**
   - Default: Light background
   - Filled: Solid background
   - Flushed: Bottom border only
   - Outline: Full border
   - Unstyled: No styling

## Development Environment

### Directory Structure

1. **Frontend Organization**
   - /frontend
     - /src
       - /app
       - /components
         - /ui (shadcn components)
         - Custom components
       - /lib
     - Configuration files

### Configuration Files

1. **Frontend**

   - next.config.mjs
   - tailwind.config.ts
   - postcss.config.mjs
   - tsconfig.json
   - components.json (shadcn)

2. **Project Root**
   - .gitignore
   - README.md
   - vercel.json

## Current Status

### Component Setup

1. **Core Components**

   - ✓ Button component
   - ✓ Card component
   - ✓ Input component
   - ✓ Dialog component
   - ✓ Toast system

2. **Styling System**
   - ✓ TailwindCSS setup
   - ✓ CSS variables defined
   - ✓ Theme configuration
   - ✓ Animation utilities

### Next Steps

1. **UI Enhancement**

   - Add gradient backgrounds
   - Implement hover effects
   - Add loading states
   - Enhance animations

2. **Component Refinement**

   - Improve file upload
   - Enhance chat interface
   - Add loading indicators
   - Polish interactions

3. **Documentation**
   - Component API docs
   - Style guide
   - Theme customization
   - Best practices

## Deployment

### Vercel Setup

- Backend deployed as serverless functions
- Frontend deployed as static/SSR app
- Automatic CI/CD from main branch
- Environment variables managed in Vercel dashboard

### Configuration

- vercel.json for backend routing
- next.config.js for frontend
- Environment variables:
  - GROQ_API_KEY
  - UPLOAD_DIR
  - MAX_FILE_SIZE

## API Structure

### Document Management

- POST /api/documents
- GET /api/documents/{id}

### Chat Interface

- POST /api/chat
- GET /api/chat/history

## Data Flow

1. User uploads document
2. Document stored in temporary storage
3. User asks question
4. Backend retrieves context
5. LLM generates response
6. Frontend displays result

## Security

- File type validation
- Size limits
- API key protection
- Rate limiting

## Performance

- Response caching
- Lazy loading
- Static generation where possible

## Testing

- Unit tests
- Integration tests
- E2E testing
- Performance testing

## Monitoring

- Vercel Analytics
- Error tracking
- Performance metrics
- Usage statistics

## Development Status

### Completed

- Next.js 14 setup
- TailwindCSS installation
- Basic component structure
- TypeScript configuration
- Shadcn/ui package installation
  - Core components installed
  - Theme configuration done
  - CSS variables defined
  - All required dependencies installed
  - Component library expanded

### In Progress

- Investigating Shadcn/ui styling issues
  - Components installed but not rendering correctly
  - Configuration appears correct but ineffective
  - Standard solutions unsuccessful
  - Root cause investigation needed

### Blocked

- Component migration to Shadcn/ui (blocked by styling issues)
- UI system refinement (blocked by styling issues)
- Theme implementation (blocked by styling issues)

### Investigation Areas

1. **Build Pipeline**

   - Next.js configuration
   - PostCSS processing
   - Tailwind compilation
   - CSS module resolution

2. **Package Integration**

   - Dependency versions
   - Module resolution
   - Import/export paths
   - Package conflicts

3. **Development Environment**
   - Build tool setup
   - Development server
   - Hot reloading
   - Cache clearing

## Styling System

### Current Setup

- Tailwind CSS for utility classes
- shadcn/ui for component library
- CSS Modules for component-specific styles
- CSS Variables for theming

### Known Issues

1. **Style Application Failure**

   - shadcn/ui and Tailwind styles not being applied
   - Components rendering with default browser styles
   - Theme toggle present but not affecting styles
   - Dark mode implementation incomplete

2. **Investigation Areas**

   - PostCSS configuration
   - Tailwind configuration
   - CSS module compilation
   - Style import order
   - CSS variable scope
   - Theme provider setup

3. **Attempted Solutions**

   - Updated Tailwind config
   - Reinstalled shadcn components
   - Modified theme provider
   - Simplified theme toggle
   - None resolved core issue

4. **Next Investigation Steps**
   - Check CSS compilation output
   - Verify style injection order
   - Inspect runtime CSS application
   - Review build process
   - Examine style specificity

### styling dependencies

```json
{
  "dependencies": {
    "next-themes": "^0.4.4",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "@radix-ui/react-slot": "^1.0.2"
  }
}
```

### Build Process

1. PostCSS processes Tailwind directives
2. Next.js handles CSS Modules
3. Runtime theme application via next-themes
4. Component styles via shadcn/ui

### Critical Paths

1. globals.css → Tailwind directives
2. components/ui/\* → shadcn/ui components
3. Providers.tsx → Theme management
4. layout.tsx → Root styling application

## Required Investigation

1. Style Processing Pipeline

   - Verify PostCSS output
   - Check Tailwind class generation
   - Inspect CSS variable resolution
   - Monitor style injection sequence

2. Runtime Behavior

   - Theme provider initialization
   - Style application timing
   - Class name generation
   - Style specificity conflicts

3. Build Configuration
   - Next.js style loading
   - Module resolution
   - CSS optimization
   - Style extraction

## Theme System

### Theme Toggle Component

```typescript
// Core structure
<Button
  variant="outline"
  size="icon"
  onClick={toggleTheme}
  className="w-10 h-10 rounded-full p-2 ..."
>
  {theme === "dark" ? <Moon /> : <Sun />}
</Button>
```

1. **Component Structure**

   - Client-side component with useTheme hook
   - Mounted state for hydration handling
   - Tooltip wrapper for hover text
   - Callback for theme toggling

2. **Styling Approach**

   - Tailwind classes for core styling
   - CSS variables for theme colors
   - Flex for icon centering
   - Transform for container positioning

3. **Theme Provider Setup**
   - Attribute-based theme switching
   - Light theme as default
   - System theme disabled
   - Smooth transitions enabled

### Implementation Notes

1. **Positioning**

   ```tsx
   <div className="ml-[50%] mt-[10px]">
     <ThemeToggle />
   </div>
   ```

2. **Button Styling**

   ```css
   .theme-toggle {
     width: 2.5rem; /* w-10 */
     height: 2.5rem; /* h-10 */
     padding: 0.5rem; /* p-2 */
     border-radius: 9999px; /* rounded-full */
   }
   ```

3. **Icon Handling**

   ```tsx
   {
     theme === "dark" ? (
       <Moon className="h-5 w-5" />
     ) : (
       <Sun className="h-5 w-5" />
     );
   }
   ```

## Dependencies

### Backend dependencies

- FastAPI for API framework
- Groq for LLM integration
- PyPDF2 for PDF processing
- python-magic for file type detection
- python-dotenv for environment management
- aiofiles for async file operations

### Frontend dependencies

- Next.js 14
- Tailwind CSS
- shadcn/ui components
- TypeScript

## Configurations

### Environment Variables

```plaintext
GROQ_API_KEY=your-api-key
MODEL_NAME=llama-3.2-3b-preview
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

### File Types

- Supported extensions: txt, pdf, doc, docx
- MIME type validation
- Hash verification for uploads

## API Integration

### Groq LLM

- Model: llama-3.2-3b-preview
- Token limit: 7000
- Temperature: 0.7
- Max response tokens: 150

### Document Processing

- Chunk size: 500 characters
- Max chunks: 8
- Context length: 4000 characters
- Cache TTL: 5 minutes (content), 1 hour (responses)

## Development Setup

### Requirements

- Python 3.11+
- Node.js 18+
- Git
- Virtual environment
- PyPDF2 library
- python-magic library

### Installation

1. Clone repository
2. Create virtual environment
3. Install backend dependencies
4. Install frontend dependencies
5. Create .env file
6. Set up upload directory

## Deployments

### Backend deployment

- Python dependencies in requirements.txt
- Environment variables in .env
- Upload directory configuration
- Error logging setup

### Frontend deployment

- Next.js configuration
- Vercel deployment
- API route handling
- Environment configuration

## LLM Providers and Models

The system supports multiple LLM providers:

1. Groq

   - Models: llama-3.2-3b-preview, gpt-40-mini
   - API Key: Required in .env as GROQ_API_KEY
   - Integration Notes:
     - Uses synchronous client.chat.completions.create()
     - Requires explicit string conversion of response content
     - Version 0.4.2 required for stability
     - No proxy configuration supported

2. Together.ai

   - Models: meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-128K
   - API Key: Required in .env as TOGETHER_API_KEY
   - Integration Notes:
     - Uses module-level API key setting
     - Synchronous completion method

3. DeepSeek

   - Models: deepseek-chat
   - API Key: Required in .env as DEEPSEEK_API_KEY
   - Integration Notes:
     - Uses DeepSeekAPI class
     - Asynchronous chat.create method

4. Google Gemini

   - Models: gemini-1.5-flash-8b
   - API Key: Required in .env as GEMINI_API_KEY
   - Integration Notes:
     - Uses GenerativeModel class
     - Asynchronous generate_content method

5. OpenAI
   - Models: gpt-4o-mini
   - API Key: Required in .env as OPENAI_API_KEY
   - Integration Notes:
     - Uses AsyncOpenAI client
     - Asynchronous chat.completions.create method

Default Configuration:

- Default Provider: groq
- Default Model: llama-3.2-3b-preview

## LLM Dependencies

Key Python packages:

- fastapi==0.109.2
- uvicorn==0.27.1
- groq==0.4.2 (specific version required)
- httpx==0.26.0 (required by groq)
- together==0.2.8
- deepseek==1.0.0
- google-generativeai==0.3.2
- openai==1.12.0
- pydantic==2.6.1
- python-multipart==0.0.9
- python-dotenv==1.0.1
- aiofiles==23.2.1
- python-magic==0.4.27

## Known Issues

1. Package Version Compatibility

   - Groq requires version 0.4.2 for stability
   - Groq client doesn't support proxy configuration
   - Some packages missing type stubs (together, deepseek, google.generativeai)

2. Async/Sync Operations

   - Groq uses synchronous completions
   - Together uses synchronous completions
   - Other providers use async methods
   - Mixed async/sync handling required

3. Response Handling
   - Different response structures per provider
   - Type conversion needed for some responses
   - Error handling varies by provider

## Best Practices

1. Provider Initialization

   - Check API key availability before initialization
   - Use provider-specific client classes
   - Handle missing API keys gracefully
   - Document provider-specific requirements

2. Response Processing

   - Convert responses to strings explicitly
   - Handle provider-specific response structures
   - Implement proper error handling
   - Cache responses when appropriate

3. Error Recovery
   - Log provider-specific errors
   - Implement fallback mechanisms
   - Maintain provider status
   - Monitor rate limits

## Server Configuration

### Python Module Imports

- Backend uses relative imports from `app` package
- Server must be started from correct directory for imports to work
- PYTHONPATH must include the backend directory
- Module structure:
  ```
  backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── api/
    │   ├── core/
    │   └── services/
    └── requirements.txt
  ```

### Server Startup Requirements

- Must run server from `backend` directory
- Virtual environment must be activated
- All dependencies must be installed
- Environment variables must be loaded
- Correct working directory for imports

### Known Issues

- ModuleNotFoundError for 'app' indicates wrong working directory
- ImportError indicates package/class not found in module
- Package version mismatches can cause import failures
- Proxy configuration can affect client initialization

## LLM Service Integration

### Provider Implementations

1. Together AI

   ```python
   # Client Initialization
   together.base_url = "https://api.together.ai"

   # Completion Request
   response = together.Complete.create(
       prompt=prompt,
       model=model_name
   )
   return response["output"]["text"]
   ```

2. Deepseek

   ```python
   # Client Initialization
   client = OpenAI(
       api_key=settings.DEEPSEEK_API_KEY,
       base_url="https://api.deepseek.com/v1"
   )

   # Chat Completion
   response = client.chat.completions.create(
       model=model_name,
       messages=[
           {"role": "system", "content": "You are a helpful assistant"},
           {"role": "user", "content": prompt}
       ],
       stream=False
   )
   return str(response.choices[0].message.content)
   ```

3. Groq

   ```python
   # Client Initialization
   client = Groq(api_key=settings.GROQ_API_KEY)

   # Chat Completion
   response = client.chat.completions.create(
       messages=[{"role": "user", "content": prompt}],
       model=model_name
   )
   return str(response.choices[0].message.content)
   ```

4. OpenAI

   ```python
   # Client Initialization
   client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

   # Chat Completion
   response = await client.chat.completions.create(
       model=model_name,
       messages=[{"role": "user", "content": prompt}]
   )
   return str(response.choices[0].message.content)
   ```

5. Gemini

   ```python
   # Client Initialization
   configure_genai(api_key=settings.GEMINI_API_KEY)
   client = GenerativeModel("gemini-1.5-flash-8b")

   # Content Generation
   response = client.generate_content(prompt)
   return str(response.text)
   ```

### Error Handling

1. Client Initialization

   ```python
   try:
       if provider == "together":
           together.base_url = "https://api.together.ai"
           self.clients[provider] = together
       elif provider == "deepseek":
           self.clients[provider] = OpenAI(
               api_key=settings.DEEPSEEK_API_KEY,
               base_url="https://api.deepseek.com/v1"
           )
       # ... other providers ...

       self.available_providers.append(provider)
       logger.debug(f"{provider} client initialized successfully")
   except Exception as e:
       logger.error(f"Failed to initialize {provider} client: {str(e)}")
   ```

2. Completion Requests

   ```python
   try:
       if self.current_provider == "together":
           response = together.Complete.create(
               prompt=prompt,
               model=self.current_model
           )
           return response["output"]["text"]
       elif self.current_provider == "deepseek":
           response = client.chat.completions.create(
               model=self.current_model,
               messages=[
                   {"role": "system", "content": "You are a helpful assistant"},
                   {"role": "user", "content": prompt}
               ],
               stream=False
           )
           return str(response.choices[0].message.content)
       # ... other providers ...
   except Exception as e:
       logger.error(f"Error getting completion from {self.current_provider}: {str(e)}")
       raise ValueError(f"Failed to get response: {str(e)}")
   ```

### Type Safety

```python
# Type definitions
self.clients: Dict[str, Union[Groq, OpenAI, AsyncOpenAI, GenerativeModel, Any]] = {}
self.current_provider: str
self.current_model: str

# Type-safe provider check
if not self.current_provider or not self.current_model:
    raise ValueError("No model selected")

# Type-safe client access
client = self.clients.get(self.current_provider)
if not client:
    raise ValueError(f"Provider {self.current_provider} not initialized")
```

## Next.js Configuration

### API Configuration

```javascript
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8001/api/:path*",
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: [],
    largePageDataBytes: 128 * 100000, // 12.8MB limit for large responses
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};
```

Key Configuration Points:

1. API Proxying

   - All `/api/*` routes proxied to backend server
   - Handles CORS automatically
   - Maintains session state

2. Large Response Handling

   - Increased page data limit to 12.8MB
   - Handles large LLM responses
   - Prevents response size errors

3. Development Optimization
   - Webpack file watching configured
   - 1-second polling interval
   - 300ms aggregation timeout

### Known Configuration Issues

1. Response Size Handling

   - Standard response limits may be too small
   - Large LLM responses need special handling
   - Experimental features used for size limits

2. API Timeouts

   - Default timeouts may be insufficient
   - LLM responses can be slow
   - Need careful timeout management

3. Development Performance
   - File watching needs optimization
   - Build times can be slow
   - Cache management important

## Frontend Components

### Model Selection

- **Implementation**: React component with unified model list
- **State Management**: Local state with context propagation
- **API Integration**: Fetches models list and handles selection
- **Error Handling**: Graceful fallback and user feedback

### Key Features

1. Unified Model List

   - Single selection interface
   - Clear model descriptions
   - Automatic provider handling

2. Error Management
   - Invalid model detection
   - Clear error messages
   - Fallback mechanisms

## Backend Services

### Provider Management

- **Implementation**: Automatic provider detection
- **Mapping**: Model to provider mapping
- **Validation**: Model availability checks
- **Error Handling**: Graceful degradation

### Key Features

1. Provider Detection

   - Automatic model mapping
   - Provider availability checks
   - Fallback strategies

2. Error Handling
   - Clear error messages
   - Automatic retries
   - Default model fallback

## API Endpoints

### Model Selection

```typescript
// Request
interface ModelRequest {
  model: string; // Model identifier
}

// Response
interface ModelResponse {
  success: boolean;
  model: string;
  error?: string;
}
```

### Error Handling

```typescript
interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}
```

## Technology Stack

### Backend

- FastAPI (Python 3.11+)
- Uvicorn ASGI server
- Python dependencies managed via requirements.txt

### Client Library

- TypeScript
- Axios for HTTP requests
- Jest for testing
- Built with tsc

### Supported Frameworks

- React
- Vue
- Any JavaScript/TypeScript framework

## Development Setup

### Backend Requirements

```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### Client Library Setup

```bash
cd client
npm install
npm run build
```

## Technical Constraints

### File Processing

- Maximum file size: 10MB
- Supported formats: PDF, TXT, DOC, DOCX
- Temporary file storage

### API Limitations

- Rate limit: 60 requests per minute
- Stateless architecture
- No persistent storage

## Dependencies

### Backend Dependencies

- fastapi
- uvicorn
- python-multipart
- python-dotenv
- pydantic-settings

### Client Dependencies

- axios: ^1.6.7
- typescript: ^5.3.3
- jest: ^29.7.0
- ts-jest: ^29.1.2

## Integration Methods

### Direct API Integration

```typescript
import { DocumentQAClient } from "document-qa-client";

const client = new DocumentQAClient({
  baseURL: process.env.DOCUMENT_QA_API_URL,
});
```

### Environment Configuration

Required environment variables:

```env
DOCUMENT_QA_API_URL=http://api-url:8001
FRONTEND_URL=http://your-app-url
ADDITIONAL_ALLOWED_ORIGIN=http://another-app-url
```

## API Structure

### Endpoints

- `/api/upload` - Document upload
- `/api/ask` - Question answering
- `/api/documents` - Document management
- `/api/models` - Model management

### Response Format

```typescript
interface APIResponse<T> {
  data: T;
  error?: string;
  metadata?: Record<string, any>;
}
```

## Security Implementation

### CORS Configuration

- Configurable origins via environment variables
- Credentials support
- Method restrictions

### File Validation

- MIME type checking
- Size validation
- Malware scanning (planned)

### Authentication

- API key support
- Bearer token support (planned)
- Rate limiting per API key

## Monitoring

### Metrics

- Request count
- Response times
- Error rates
- File upload statistics

### Logging

- API access logs
- Error logs
- Performance metrics
- Security events

## Testing Strategy

### Backend Tests

- Unit tests with pytest
- Integration tests
- API endpoint tests

### Client Tests

- Jest unit tests
- Integration tests
- Type checking

## Deployment

### Backend Deployment

- Vercel serverless functions
- Environment variable configuration
- CORS setup

### Client Library Distribution

- npm package
- TypeScript types included
- Minified bundle

## Performance Metrics Implementation

### Backend Technologies

1. Python Services

   - FastAPI for API endpoints
   - aiofiles for async file operations
   - datetime for timestamp generation
   - typing for type annotations
   - json for data serialization

2. File Storage
   - Markdown format for metrics storage
   - UTF-8 encoding
   - Append-only operations
   - Atomic writes

### Frontend Technologies

1. React Components

   - Next.js 13+ framework
   - TypeScript for type safety
   - Recharts for visualization
   - Tailwind CSS for styling
   - shadcn/ui for UI components

2. State Management
   - React hooks (useState, useEffect)
   - Custom hooks for metrics
   - Interval-based polling
   - Error boundary implementation

### API Integration

1. Endpoints

   ```typescript
   // GET /api/performance-logs
   interface MetricsResponse {
     logs: PerformanceLog[];
     error?: string;
   }
   ```

2. Data Structures

   ```typescript
   interface DocumentMetrics {
     sizeKB: number;
     totalChunks: number;
     selectedChunks: number;
     chunkSize: number;
     contextLength: number;
   }

   interface TimingMetric {
     step: string;
     duration: number;
     percentage: number;
   }
   ```

### Performance Optimizations

1. Backend

   - Async file operations
   - Buffered writes
   - Memory-efficient parsing
   - Error recovery mechanisms

2. Frontend
   - Lazy loading components
   - Memoized calculations
   - Debounced updates
   - Virtual scrolling

### Development Tools

1. Testing

   - test_metrics.py for backend testing
   - Jest for frontend testing
   - Cypress for E2E testing
   - Postman for API testing

2. Monitoring
   - Console logging
   - Error tracking
   - Performance profiling
   - Memory monitoring

### Security Considerations

1. File Access

   - Restricted directory access
   - Sanitized file paths
   - Size limits
   - Format validation

2. API Security
   - Rate limiting
   - Input validation
   - Error handling
   - CORS configuration

### Deployment Requirements

1. Server

   - Python 3.8+
   - Node.js 18+
   - FastAPI server
   - Next.js server

2. File System
   - Write permissions
   - Adequate storage
   - Backup strategy
   - Cleanup routine

### Dependencies

1. Backend

   ```python
   fastapi==0.68.0
   aiofiles==0.8.0
   python-multipart==0.0.5
   python-dotenv==0.19.0
   ```

2. Frontend
   ```json
   {
     "recharts": "^2.10.0",
     "tailwindcss": "^3.3.0",
     "@radix-ui/react-tabs": "^1.0.0",
     "lucide-react": "^0.294.0"
   }
   ```

### Configuration

1. Environment Variables

   ```env
   METRICS_LOG_PATH=performance_logs
   METRICS_FILE_NAME=performance_metrics.md
   METRICS_RETENTION_DAYS=30
   METRICS_MAX_FILE_SIZE_MB=10
   ```

2. Constants
   ```typescript
   const POLL_INTERVAL = 5000;
   const MAX_METRICS_ENTRIES = 1000;
   const CHART_UPDATE_DELAY = 100;
   ```

### Error Handling

1. Backend Errors

   ```python
   class MetricsError(Exception):
       """Base class for metrics-related errors."""
       pass

   class MetricsFileError(MetricsError):
       """Error accessing metrics file."""
       pass
   ```

2. Frontend Errors
   ```typescript
   interface MetricsError {
     code: string;
     message: string;
     details?: unknown;
   }
   ```

### Monitoring Patterns

1. System Health

   ```python
   async def check_metrics_health():
       """Check metrics system health."""
       try:
           file_size = await get_metrics_file_size()
           last_write = await get_last_write_time()
           return {"status": "healthy", "size": file_size, "lastWrite": last_write}
       except Exception as e:
           return {"status": "error", "message": str(e)}
   ```

2. Performance Tracking
   ```typescript
   const useMetricsMonitor = () => {
     const [health, setHealth] = useState<HealthStatus>();
     useEffect(() => {
       const checkHealth = async () => {
         const status = await fetchMetricsHealth();
         setHealth(status);
       };
       const interval = setInterval(checkHealth, 30000);
       return () => clearInterval(interval);
     }, []);
     return health;
   };
   ```

## Technologies Used

### Backend

- FastAPI
- Python 3.8+
- Multiple LLM Providers:
  - Groq
  - Together
  - Deepseek
  - Gemini
  - OpenAI
- aiofiles for async file operations
- Logging system with configurable levels

### Frontend

- React
- TypeScript
- Recharts for data visualization
- Tailwind CSS
- React Query for data fetching

## Development Setup

- Backend running on port 8001
- Frontend development server on port 3000
- Environment variables managed via .env files
- Logging directory at backend/logs
- Performance metrics stored in frontend/performance_logs

## Technical Constraints

1. API Rate Limits:

   - Provider-specific rate limits
   - Caching implementation to reduce API calls
   - Retry mechanisms with exponential backoff

2. Performance:

   - Document size limitations
   - Context window constraints
   - Memory usage optimization needed
   - Real-time metrics collection overhead

3. Security:
   - API key management
   - Environment variable protection
   - Input validation
   - Error message sanitization

## Dependencies

### Backend Dependencies

```python
groq==0.3.0
together==0.2.0
openai==1.0.0
google-generativeai==0.3.0
fastapi==0.100.0
python-dotenv==1.0.0
aiofiles==23.2.1
```

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.5",
  "recharts": "^2.10.0",
  "tailwindcss": "^3.3.0",
  "react-query": "^3.39.0"
}
```

## Architecture

1. Service Layer:

   - LLMService for provider management
   - DocumentService for file operations
   - MetricsService for performance tracking

2. API Layer:

   - RESTful endpoints
   - WebSocket for real-time updates
   - Error handling middleware
   - Request validation

3. Frontend Architecture:
   - Component-based structure
   - Global state management
   - Error boundary implementation
   - Responsive design

## Current Implementation Focus

- Performance metrics dashboard
- Real-time data visualization
- Error handling improvements
- Provider fallback mechanisms

## AWS Integration [2024-02-25]

### S3 Configuration

1. AWS Settings:

   ```python
   # Environment Variables
   AWS_ACCESS_KEY_ID = "..."  # Set in .env
   AWS_SECRET_ACCESS_KEY = "..."  # Set in .env
   AWS_REGION = "us-east-1"  # Default region
   S3_BUCKET = "..."  # Set in .env
   S3_PERFORMANCE_LOGS_PREFIX = "performance_logs/"
   ```

2. S3 Client Configuration:

   ```python
   # LLMService initialization
   self.s3_client = boto3.client(
       's3',
       aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
       aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
       region_name=settings.AWS_REGION
   )
   ```

3. Metrics Storage Format:

   ```json
   {
     "timestamp": "YYYY-MM-DD_HH-MM-SS",
     "model": "model_name",
     "provider": "provider_name",
     "question": "user_query",
     "document_metrics": {
       "size_kb": 0.0,
       "total_chunks": 0,
       "selected_chunks": 0,
       "chunk_size": 500,
       "context_length": 0
     },
     "llm_timing": [
       {
         "name": "step_name",
         "value": 0.0,
         "percentage": 0.0
       }
     ],
     "doc_timing": [
       {
         "name": "step_name",
         "value": 0.0,
         "percentage": 0.0
       }
     ],
     "total_llm_time": 0.0,
     "total_doc_time": 0.0
   }
   ```

4. Migration Script:
   ```python
   # Located at document-qa-backend/scripts/migrate_metrics.py
   # Reads from performance_logs/performance_metrics.md
   # Uploads to S3 with timestamp-based keys
   # Maintains local backup
   ```

## Testing Infrastructure [2024-02-26]

### Test Framework

1. Core Components:

   - pytest
   - pytest-asyncio
   - pytest-mockito
   - pytest-cov

2. Configuration:

   ```toml
   [tool.pytest.ini_options]
   asyncio_default_fixture_loop_scope = "function"
   ```

3. Test Types:

   - Unit Tests
   - Integration Tests
   - Regression Tests
   - Async Tests

4. Test Patterns:
   - Mock LLM Services
   - File Fixtures
   - Async/Sync Test Separation
   - Error Scenario Testing

### Test Files

1. test_regression.py:

   - Document Upload Tests
   - Document Listing Tests
   - Q&A Functionality Tests
   - Security Tests
   - File Integrity Tests

2. test_document_service.py:
   - Document Save Tests (async)
   - Extension Validation Tests (async)
   - Document List Tests (async)

### Dependencies

1. Core Dependencies:

   - pypdf>=3.0.0 (upgraded from PyPDF2)
   - python-magic==0.4.27
   - pytest==8.2.0
   - pytest-asyncio==0.25.2
   - pytest-mockito==0.0.4

2. Development Dependencies:
   - pytest-cov
   - pytest-asyncio
   - black
   - flake8
   - mypy

### Test Environment

1. Configuration:

   - PYTHONPATH=.
   - TESTING=true
   - Custom test fixtures
   - Mock services

2. File Structure:

   - tests/
     - test_regression.py
     - test_document_service.py
     - conftest.py
     - fixtures/

3. Mock Services:
   - LLM Service
   - Document Service
   - File Storage

### Performance Metrics

1. Response Times:

   - Gemini 1.5 Flash 8B: ~0.9s
   - GPT-4O Mini: ~4.4s
   - Deepseek Chat: ~10.6s
   - Meta Llama 3.1 8B: 503 errors

2. Test Coverage:
   - 5 passing tests
   - 3 skipped tests (async)
   - Core functionality covered
   - Error scenarios tested

### Known Technical Debt

1. Testing:

   - Async test infrastructure incomplete
   - Import resolution issues
   - Meta Llama availability problems
   - Load testing missing

2. Configuration:
   - Environment variable management
   - Test data cleanup
   - Mock service improvements
   - Performance monitoring

### Next Technical Steps

1. Testing:

   - Implement async test infrastructure
   - Add load testing capabilities
   - Create performance benchmarks
   - Set up continuous testing

2. Configuration:

   - Improve environment management
   - Enhance mock services
   - Add performance monitoring
   - Implement caching

3. Documentation:
   - Update test setup guide
   - Document mock patterns
   - Add troubleshooting steps
   - Create performance guide

## [2024-02-26] Critical Working Dependencies (PRESERVE - DO NOT MODIFY)

### Reference Commit: `5308538`

#### 1. Core Dependencies

```plaintext
# CRITICAL: These exact versions are required for CI to pass
fastapi==0.109.2
uvicorn==0.27.1
python-multipart==0.0.9
python-dotenv==1.0.1
groq==0.4.2
together>=1.0.0
deepseek==1.0.0
google-generativeai==0.3.2
openai==1.12.0
pydantic>=2.6.3
pydantic-settings==2.1.0
```

#### 2. Testing Dependencies

```plaintext
# CRITICAL: These exact versions are required for tests to pass
pytest==8.2.0
pytest-asyncio==0.25.2
pytest-mockito==0.0.4
httpx==0.27.2
```

#### 3. System Dependencies

```plaintext
# CRITICAL: These exact packages are required
python3-dev
libmagic1
tesseract-ocr
poppler-utils
```

### Test Configuration Details

#### 1. Mock Service Pattern

```python
# CRITICAL: This exact mocking pattern must be maintained
@patch('app.api.routes.llm_service')
def test_qa_regression(self, mock_llm: MagicMock):
    async def mock_get_answer(*args, **kwargs):
        return "This is a mock answer"
    mock_llm.get_answer = mock_get_answer
    mock_llm.available_providers = ["mock_provider"]
    mock_llm.current_provider = "mock_provider"
    mock_llm.current_model = "mock_model"
```

#### 2. Test Client Setup

```python
# CRITICAL: This exact fixture pattern must be maintained
@pytest.fixture
def test_client() -> TestClient:
    return TestClient(app)

@pytest.fixture
def test_files() -> Generator[List[str], None, None]:
    files = []
    # Create and cleanup test files
    yield files
    for file in files:
        os.unlink(file)
```

### Environment Configuration

#### 1. Required Environment Variables

```plaintext
# CRITICAL: These must be set for tests
TESTING="true"
GROQ_API_KEY="test_groq_key"
TOGETHER_API_KEY="test_together_key"
DEEPSEEK_API_KEY="test_deepseek_key"
GEMINI_API_KEY="test_gemini_key"
OPENAI_API_KEY="test_openai_key"
AWS_ACCESS_KEY_ID="test_aws_key_id"
AWS_SECRET_ACCESS_KEY="test_aws_secret_key"
AWS_DEFAULT_REGION="us-east-1"
```

#### 2. Python Configuration

- Version: 3.11 (exact)
- PYTHONPATH: Must include workspace root
- Virtualenv: Fresh environment recommended

### Warning Signs

Watch for these indicators that the configuration might be breaking:

1. Any dependency version changes
2. Modified test patterns
3. Changed environment variables
4. Altered mock configurations
5. Modified system dependencies

### Debugging Steps

If tests fail:

1. Verify exact dependency versions
2. Check system dependencies
3. Confirm environment variables
4. Validate mock configurations
5. Compare against commit `5308538`

### Blog Content Implementation

1. Technical Structure:

   - Next.js App Router pages under `/blog`
   - Static site generation for blog content
   - Markdown processing with MDX
   - SEO metadata for each article
   - Performance metrics integration

2. Content Organization:

   ```tree
   /app/blog/
   ├── page.tsx           # Blog index
   ├── [slug]/            # Dynamic routes
   │   └── page.tsx       # Individual articles
   └── components/        # Blog-specific components
       ├── ArticleCard.tsx
       └── BlogLayout.tsx
   ```

3. SEO Configuration:
   ```typescript
   export const metadata: Metadata = {
     title: "Document Analysis Blog - InQDoc",
     description: "Learn about AI-powered document analysis...",
     keywords: "document analysis, AI document search...",
     // ... other metadata
   };
   ```

## Quiz Creation Mode Implementation [2025-05-02 18:02:22]

### Database Schema

- **Database Service:** PostgreSQL
- **ORM:** Prisma (prisma-client-js)
- **Schema Location:** `document-qa-frontend/prisma/schema.prisma`
- **Models Added:**
  - `Quiz`: Stores quiz metadata (title, description, difficulty, etc.) with relations to User and Document
  - `QuizQuestion`: Stores individual questions of different types with correct answers
  - `QuizResponse`: Records user answers to individual questions
  - `QuizResult`: Stores quiz completion data including score and sharing options

### API Routes

- **Framework:** Next.js API Routes (App Router)
- **Authentication:** NextAuth.js with Prisma adapter
- **Routes Implemented:**
  - `/api/quiz/generate` [POST]: LLM-based quiz generation from document content
  - `/api/quiz/[quizId]` [GET]: Retrieves quiz and questions
  - `/api/quiz/[quizId]` [POST]: Submits answers and processes grading
  - `/api/quiz/[quizId]/results` [GET]: Retrieves quiz results
  - `/api/quiz/[quizId]/results` [POST]: Updates sharing settings
  - `/api/quiz` [GET]: Lists all quizzes for the user

### Frontend Components

- **Framework:** React (with Next.js)
- **UI Library:** shadcn/ui components
- **Components:**
  - `QuizGenerator.tsx`: Creates quizzes with document selection and parameters
  - `QuizDisplay.tsx`: Renders quiz questions with multiple answer types
  - `QuizResults.tsx`: Shows detailed performance with sharing controls
- **Pages:**
  - `/quiz/new`: Quiz creation interface
  - `/quiz/[quizId]`: Quiz taking interface
  - `/quiz/[quizId]/results`: Results viewing interface

### LLM Integration

- **Service:** Uses the existing LLM fallback system
- **Prompt Engineering:**
  - Quiz generation prompt templates in `/api/quiz/generate/route.ts`
  - Answer evaluation prompt templates in `/api/quiz/[quizId]/route.ts`
- **Token Handling:** Manages token limits for document content when generating questions

### Navigation

- Added "Quiz Mode" link to the Resources dropdown in `Navigation.tsx`
- Integrated with existing authorization flow to ensure authenticated access
