import React from "react";
import Link from "next/link";

const VueIntegrationGuide = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Vue Integration Guide</h1>

      <div className="space-y-8">
        {/* Installation Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <div className="space-y-4">
            <p>
              To integrate the Document QA system with your Vue application,
              start by installing the client library:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded">
                npm install document-qa-client
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
                {`// src/services/documentQA.js
import { DocumentQAClient } from "document-qa-client";

// Initialize the client
export const documentQAClient = new DocumentQAClient({
  baseURL: import.meta.env.VITE_API_URL || "https://api.document-qa.com",
  apiKey: import.meta.env.VITE_API_KEY, // Optional if not using authentication
});`}
              </pre>
            </div>
            <p>
              For Vue 3 Composition API, create a composable to manage the
              client:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`// src/composables/useDocumentQA.js
import { ref } from 'vue';
import { documentQAClient } from '../services/documentQA';

export function useDocumentQA() {
  const isLoading = ref(false);
  const error = ref(null);
  
  async function uploadDocument(file) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await documentQAClient.uploadDocument(file);
      return result;
    } catch (err) {
      error.value = err.message || 'Upload failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function askQuestion(params) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await documentQAClient.askQuestion(params);
      return result;
    } catch (err) {
      error.value = err.message || 'Failed to get answer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    isLoading,
    error,
    uploadDocument,
    askQuestion
  };
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Document Upload Component */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Document Upload Component
          </h2>
          <div className="space-y-4">
            <p>Create a Vue 3 component for document uploads:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`<!-- src/components/DocumentUpload.vue -->
<template>
  <div class="upload-container">
    <input
      type="file"
      @change="handleFileChange"
      accept=".pdf,.txt,.doc,.docx"
      :disabled="isLoading"
    />
    <div v-if="isLoading" class="loading">Uploading document...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDocumentQA } from '../composables/useDocumentQA';

const props = defineProps({
  onSuccess: {
    type: Function,
    required: true
  }
});

const { isLoading, error, uploadDocument } = useDocumentQA();
const file = ref(null);

const handleFileChange = async (event) => {
  file.value = event.target.files[0];
  if (!file.value) return;
  
  try {
    const result = await uploadDocument(file.value);
    props.onSuccess(result);
  } catch (err) {
    // Error is already handled in the composable
    console.error('Upload failed:', err);
  }
};
</script>

<style scoped>
.upload-container {
  margin-bottom: 1rem;
}
.loading {
  margin-top: 0.5rem;
  color: #666;
}
.error {
  margin-top: 0.5rem;
  color: #e53e3e;
}
</style>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Question Answering Component */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Question Answering Component
          </h2>
          <div className="space-y-4">
            <p>
              Create a Vue 3 component for asking questions about documents:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`<!-- src/components/QuestionInput.vue -->
<template>
  <div class="question-container">
    <form @submit.prevent="handleSubmit">
      <input
        v-model="question"
        placeholder="Ask a question about the document..."
        :disabled="isLoading"
      />
      <button type="submit" :disabled="isLoading || !documentId">
        {{ isLoading ? "Processing..." : "Ask" }}
      </button>
    </form>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="answer" class="answer">
      <h3>Answer:</h3>
      <p>{{ answer }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDocumentQA } from '../composables/useDocumentQA';

const props = defineProps({
  documentId: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    default: null
  },
  model: {
    type: String,
    default: null
  }
});

const { isLoading, error, askQuestion } = useDocumentQA();
const question = ref('');
const answer = ref('');

const handleSubmit = async () => {
  if (!question.value.trim()) return;
  
  try {
    const result = await askQuestion({
      documentId: props.documentId,
      question: question.value,
      provider: props.provider,
      model: props.model
    });
    
    answer.value = result.answer;
  } catch (err) {
    // Error is already handled in the composable
    console.error('Question failed:', err);
  }
};
</script>

<style scoped>
.question-container {
  margin-top: 1rem;
}
form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}
.error {
  color: #e53e3e;
  margin-bottom: 1rem;
}
.answer {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 4px;
}
</style>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Complete Example */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Complete Example</h2>
          <div className="space-y-4">
            <p>Putting it all together in a complete Vue application:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`<!-- src/App.vue -->
<template>
  <div class="app-container">
    <h1>Document Q&A</h1>
    
    <div class="upload-section">
      <h2>Upload a Document</h2>
      <DocumentUpload :onSuccess="handleUploadSuccess" />
    </div>
    
    <div v-if="documentId" class="qa-section">
      <h2>Ask Questions about {{ documentName }}</h2>
      <QuestionInput :documentId="documentId" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DocumentUpload from './components/DocumentUpload.vue';
import QuestionInput from './components/QuestionInput.vue';

const documentId = ref(null);
const documentName = ref(null);

const handleUploadSuccess = (result) => {
  documentId.value = result.id;
  documentName.value = result.filename;
};
</script>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
}
h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.upload-section {
  margin-bottom: 2rem;
}
</style>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Advanced Features</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Model Selection</h3>
            <p>
              Create a component to allow users to select different LLM models:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`<!-- src/components/ModelSelector.vue -->
<template>
  <div class="model-selector">
    <h3>Select AI Model</h3>
    <div v-if="isLoading" class="loading">Loading models...</div>
    <div v-else>
      <div v-for="(providerModels, provider) in models" :key="provider" class="provider-group">
        <h4>{{ provider }}</h4>
        <div class="model-buttons">
          <button
            v-for="(modelName, modelId) in providerModels"
            :key="modelId"
            @click="selectModel(provider, modelId)"
            :class="{ active: isSelected(provider, modelId) }"
          >
            {{ modelName }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { documentQAClient } from '../services/documentQA';

const props = defineProps({
  onSelect: {
    type: Function,
    required: true
  }
});

const models = ref({});
const isLoading = ref(true);
const selectedProvider = ref(null);
const selectedModel = ref(null);

onMounted(async () => {
  try {
    const result = await documentQAClient.getModels();
    models.value = result.models;
    
    // Set default selection
    if (result.default_provider && result.default_model) {
      selectedProvider.value = result.default_provider;
      selectedModel.value = result.default_model;
      props.onSelect({
        provider: result.default_provider,
        model: result.default_model
      });
    }
  } catch (error) {
    console.error('Failed to load models:', error);
  } finally {
    isLoading.value = false;
  }
});

const selectModel = (provider, modelId) => {
  selectedProvider.value = provider;
  selectedModel.value = modelId;
  props.onSelect({ provider, model: modelId });
};

const isSelected = (provider, modelId) => {
  return selectedProvider.value === provider && selectedModel.value === modelId;
};
</script>

<style scoped>
.model-selector {
  margin-bottom: 2rem;
}
h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}
h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.provider-group {
  margin-bottom: 1rem;
}
.model-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #2563eb;
}
.loading {
  color: #666;
}
</style>`}
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
                {`// src/services/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData.code
    );
  }
  return response.json();
}

// Example usage in client implementation
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(\`\${baseURL}/api/upload\`, {
      method: 'POST',
      body: formData,
    });
    
    return handleApiResponse(response);
  } catch (error) {
    // Handle network errors
    if (!(error instanceof ApiError)) {
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
    throw error;
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Integration with Vue Router */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Integration with Vue Router
          </h2>
          <div className="space-y-4">
            <p>Set up routing for a multi-page Document QA application:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import DocumentQA from '../views/DocumentQA.vue';
import DocumentHistory from '../views/DocumentHistory.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/qa/:documentId?',
    name: 'DocumentQA',
    component: DocumentQA,
    props: true
  },
  {
    path: '/history',
    name: 'DocumentHistory',
    component: DocumentHistory
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;`}
              </pre>
            </div>
            <p>Example of a DocumentQA view that uses the router:</p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="bg-black text-white p-3 rounded overflow-x-auto">
                {`<!-- src/views/DocumentQA.vue -->
<template>
  <div class="document-qa">
    <h1>Document Q&A</h1>
    
    <div v-if="!documentId" class="upload-section">
      <h2>Upload a Document</h2>
      <DocumentUpload :onSuccess="handleUploadSuccess" />
    </div>
    
    <div v-else class="qa-section">
      <div class="document-info">
        <h2>{{ documentName }}</h2>
        <button @click="goToHome" class="secondary-button">Upload Different Document</button>
      </div>
      
      <ModelSelector :onSelect="handleModelSelect" />
      <QuestionInput 
        :documentId="documentId" 
        :provider="selectedProvider" 
        :model="selectedModel" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DocumentUpload from '../components/DocumentUpload.vue';
import QuestionInput from '../components/QuestionInput.vue';
import ModelSelector from '../components/ModelSelector.vue';
import { documentQAClient } from '../services/documentQA';

const router = useRouter();
const route = useRoute();

const props = defineProps({
  documentId: {
    type: String,
    default: null
  }
});

const documentId = ref(props.documentId);
const documentName = ref(null);
const selectedProvider = ref(null);
const selectedModel = ref(null);

onMounted(async () => {
  if (documentId.value) {
    try {
      // Fetch document details if ID is provided
      const document = await documentQAClient.getDocument(documentId.value);
      documentName.value = document.filename;
    } catch (error) {
      console.error('Failed to load document:', error);
      // Redirect to home if document not found
      router.push('/');
    }
  }
});

const handleUploadSuccess = (result) => {
  // Navigate to the QA page with the document ID
  router.push(\`/qa/\${result.id}\`);
};

const handleModelSelect = ({ provider, model }) => {
  selectedProvider.value = provider;
  selectedModel.value = model;
};

const goToHome = () => {
  router.push('/');
};
</script>`}
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
                  href="https://vuejs.org/guide/introduction.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Vue.js Official Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://pinia.vuejs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Pinia for State Management
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
                  href="/tutorials"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VueIntegrationGuide;
