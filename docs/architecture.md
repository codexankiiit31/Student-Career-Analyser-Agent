# 🏛️ Architecture Overview

The AI Career Agent is a modern full-stack web application designed for high performance, modularity, and seamless integration with multiple Large Language Models (LLMs).

## High-Level System Design

1. **Frontend**: React 18
2. **Backend Engine**: FastAPI (Python 3.11+)
3. **AI Orchestration**: LangChain
4. **Primary LLMs**: Google Gemini (Speed & Context), Groq LLaMA 3.3 (Market Analysis)
5. **Vector Database**: FAISS (Facebook AI Similarity Search)

## Workflow Breakdown

### 1. User Interaction Layer (Frontend)
The React application communicates with the backend exclusively via RESTful JSON endpoints. 
- Global state is handled via React's `useState` and `useEffect`. 
- Real-time chatbot responses are fetched using JavaScript's native byte `ReadableStream` decoding.

### 2. API Gateway & Validation Layer (FastAPI)
- Uses `Pydantic v2` heavily to ensure structured request bodies (e.g., parsing user career goals).
- Background tasks (via FastAPI `BackgroundTasks`) are utilized for heavy operations like web scraping so that the primary event loop isn't blocked.

### 3. AI Agent Layer (LangChain)
All intelligent operations are abstracted into domain-specific "Agents".
- The system employs **LCEL (LangChain Expression Language)** pipe syntax (`prompt | model | parser`) to strictly enforce JSON outputs and minimize hallucinations.
- FAISS is used as a local lightweight vector index to perform semantic searches over the roadmap career paths.
