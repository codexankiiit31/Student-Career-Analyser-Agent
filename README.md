# 🤖 AI Career Agent — Student Career Analyser

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=40&duration=3000&pause=1000&color=A855F7&center=true&vCenter=true&width=700&lines=🧑‍🚀+AI+Career+Agent;Your+Career%2C+Unlocked+🚀;Land+Your+Dream+Job+Faster" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E44AD?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_LLaMA-FF6B35?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-10b981?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-a855f7?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-Welcome-ec4899?style=flat-square" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
</p>

---

> **AI Career Agent** is a full-stack, AI-powered career intelligence platform built for students and modern professionals. Upload your resume and a job description to instantly receive ATS optimization scores, skill gap analysis, real-time market insights, AI-generated cover letters, and personalized week-by-week learning roadmaps — all powered by a multi-agent LangChain architecture.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [🤖 AI Agents Deep Dive](#-ai-agents-deep-dive)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Smart Resume Analysis** | Upload a PDF or DOCX resume and match it against any Job Description. Get an ATS Score, Skill Gap Analysis, and selection probability — powered by LangChain + Google Gemini. |
| 💼 **AI Cover Letter Generator** | Generates a fully personalized cover letter tailored to your exact experience and the target role's requirements. |
| 📊 **Live Market Intelligence** | Fetches real-time salary data, job demand trends, and future career scope using SerpAPI + Groq LLaMA 3.3. Runs as a background task to keep the UI fast. |
| 🗺️ **RAG-Powered Learning Roadmaps** | Creates an interactive, week-by-week study plan complete with mini-projects — built with FAISS vector search over curated career path data. |
| 🧠 **Unified AI Chatbot** | A conversational router agent that automatically detects intent. Ask *"What skills am I missing?"* or *"What does a DevOps engineer do?"* and get streamed, contextual answers. |

---

## 🏗️ Architecture

The system is designed around a clean separation of concerns: a React frontend communicates exclusively via REST with a FastAPI backend, which delegates all intelligence to a suite of domain-specific LangChain agents.

```
                          ┌──────────────────────────────────┐
                          │        👤 User (React UI)         │
                          │     http://localhost:3000          │
                          └──────────────┬───────────────────┘
                                         │ HTTP / Streaming
                          ┌──────────────▼───────────────────┐
                          │      FastAPI Backend              │
                          │   http://localhost:8000            │
                          │  (Pydantic v2 + BackgroundTasks)  │
                          └──────────────┬───────────────────┘
                                         │ LangChain LCEL
                          ┌──────────────▼───────────────────┐
                          │       Agent Router / Orchestrator  │
                          └──┬──────────┬──────────┬─────────┘
                             │          │          │          │
              ┌──────────────▼┐ ┌───────▼──┐ ┌────▼──────┐ ┌▼──────────┐
              │  Career Agent │ │  Market  │ │  Roadmap  │ │  QA Agent │
              │  (Resume/JD)  │ │  Agent   │ │   Agent   │ │  (Chat)   │
              └──────┬────────┘ └────┬─────┘ └─────┬─────┘ └─────┬─────┘
                     │               │              │              │
              ┌──────▼──────┐ ┌──────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
              │Google Gemini│ │Groq LLaMA3.3│ │FAISS (RAG)│ │   Gemini  │
              │  Flash API  │ │ + SerpAPI   │ │Vector DB  │ │  Streamed │
              └─────────────┘ └─────────────┘ └───────────┘ └───────────┘
```

**Key architectural decisions:**

- **LCEL Pipe Syntax** (`prompt | model | parser`) strictly enforces structured JSON outputs and reduces hallucinations.
- **BackgroundTasks** keep the market analysis non-blocking — a job ID is returned immediately and polled for results.
- **FAISS** serves as a local, lightweight vector index for semantic search over career roadmap data (no external vector DB needed).
- **ReadableStream decoding** in the frontend provides real-time word-by-word chatbot streaming without WebSockets.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, CSS Modules |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, Uvicorn |
| **AI Orchestration** | LangChain (LCEL) |
| **LLMs** | Google Gemini Flash (resume/chat), Groq LLaMA 3.3 (market data) |
| **Vector DB** | FAISS (Facebook AI Similarity Search) |
| **Web Scraping** | SerpAPI |
| **Document Parsing** | PyMuPDF (PDF), python-docx (DOCX) |
| **Containerization** | Docker, Docker Compose |

---

## 📂 Project Structure

```
Student-Career-Analyser-Agent/
│
├── backend/                    # Python FastAPI application
│   ├── main.py                 # App entrypoint, all route definitions
│   ├── agents/                 # LangChain agent modules
│   │   ├── career_agent.py     # Resume ↔ JD analysis, ATS scoring
│   │   ├── market_agent.py     # Live market scraping + Groq analysis
│   │   ├── roadmap_agent.py    # RAG-powered roadmap generation
│   │   └── chat_agent.py       # Conversational router / Q&A
│   ├── utils/                  # File parsers, FAISS index helpers
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # React 18 application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   └── App.js
│   └── package.json
│
├── docs/                       # Detailed documentation
│   ├── architecture.md
│   ├── api_reference.md
│   ├── agents_overview.md
│   └── deployment.md
│
├── docker-compose.yml          # One-command full-stack startup
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- API Keys (see [Environment Variables](#-environment-variables))

### Local Setup

#### 1. Clone the repository

```bash
git clone https://github.com/codexankiiit31/Student-Career-Analyser-Agent.git
cd Student-Career-Analyser-Agent
```

#### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
SERPAPI_API_KEY=your_serpapi_key   # Optional — needed for live market data
```

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

> ✅ API is live at `http://localhost:8000`
> 📖 Interactive Swagger docs at `http://localhost:8000/docs`

#### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

> ✅ UI is live at `http://localhost:3000`

---

### Docker Setup

Run the entire stack with a single command:

```bash
docker-compose up --build
```

This spins up both the FastAPI backend (`port 8000`) and the React frontend (`port 3000`) in isolated containers.

> ⚠️ Make sure your `.env` file exists in `backend/` before running Docker.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini Flash API key — powers resume analysis and the chatbot. Get it from [Google AI Studio](https://aistudio.google.com/). |
| `GROQ_API_KEY` | ✅ Yes | Groq API key for fast LLaMA 3.3 inference — used for market analysis. Get it from [console.groq.com](https://console.groq.com/). |
| `SERPAPI_API_KEY` | ⚠️ Optional | SerpAPI key for live job/salary scraping. Without this, market analysis falls back to a static mode. Get it from [serpapi.com](https://serpapi.com/). |

---

## 📡 API Reference

Base URL: `http://localhost:8000`

All endpoints accept and return `application/json` unless noted.

### `POST /upload_resume`
Parses an uploaded PDF or DOCX file and extracts raw text.
- **Body**: `multipart/form-data` — `file` field
- **Response**: `{ "filename": "resume.pdf", "text": "..." }`

### `POST /analyze_resume`
Runs the Career Agent to compare resume text against a Job Description.
- **Body**: `{ "resume_text": "...", "job_description": "..." }`
- **Response**: `{ "ats_score": 78, "missing_skills": [...], "selection_probability": "High", ... }`

### `POST /generate_cover_letter`
Generates an AI-tailored cover letter.
- **Body**: `{ "resume_text": "...", "job_description": "..." }`
- **Response**: `{ "cover_letter": "Dear Hiring Manager, ..." }`

### `POST /api/market_analysis`
Starts a background task to scrape and analyze live market data.
- **Body**: `{ "role": "Software Engineer", "location": "India", "experience": "Entry Level" }`
- **Response**: `{ "job_id": "abc123" }`

### `GET /api/market_analysis/status/{job_id}`
Polls the status of a market analysis background task.
- **Response**: `{ "status": "completed", "data": { "avg_salary": "...", "demand": "...", ... } }`

### `POST /api/get_roadmap`
Generates a structured, week-by-week learning roadmap.
- **Body**: `{ "career_goal": "DevOps Engineer", "duration": "4 Weeks" }`
- **Response**: Nested JSON with phases, weekly tasks, and mini-project suggestions.

### `POST /api/chat`
Streams a response from the conversational router agent.
- **Body**: `{ "message": "What skills am I missing?", "history": [...] }`
- **Response**: `StreamingResponse` — chunked word-by-word over HTTP.

> For full request/response schemas, see [`docs/api_reference.md`](./docs/api_reference.md).

---

## 🤖 AI Agents Deep Dive

The backend is built around **4 specialized LangChain agents**, each constructed with LCEL pipe syntax (`prompt | model | output_parser`) to enforce structured outputs.

### 📄 Career Agent
- **Model**: Google Gemini Flash
- **Input**: Resume text + Job Description
- **Output**: ATS score (0–100), list of missing skills, matched keywords, selection probability
- **How**: Structured prompt forces JSON output; `JsonOutputParser` validates the schema.

### 📊 Market Agent
- **Model**: Groq LLaMA 3.3
- **Input**: Role name, location, experience level
- **Output**: Average salary range, market demand score, top hiring companies, future scope
- **How**: Runs as a `BackgroundTask`. SerpAPI fetches live search results; Groq parses and summarizes them into structured data.

### 🗺️ Roadmap Agent
- **Model**: Google Gemini Flash + FAISS
- **Input**: Career goal + desired duration
- **Output**: Week-by-week learning plan with topics, resources, and mini-projects
- **How**: FAISS performs a semantic search over a curated career paths knowledge base (RAG). Retrieved context is injected into the prompt to ground the roadmap in real curriculum data.

### 🗣️ QA / Chat Agent
- **Model**: Google Gemini Flash (streamed)
- **Input**: User message + conversation history
- **Output**: Intent-routed, context-aware response streamed word-by-word
- **How**: A router prompt classifies the user's intent (career advice, general knowledge, resume-specific) and delegates to the appropriate sub-chain before streaming back the result.

> See [`docs/agents_overview.md`](./docs/agents_overview.md) for implementation details.

---

## 📚 Documentation

Full technical documentation lives in the [`docs/`](./docs/) folder:

| Document | Description |
|---|---|
| 🏛️ [`architecture.md`](./docs/architecture.md) | System design, data flow, and layer breakdown |
| 📡 [`api_reference.md`](./docs/api_reference.md) | Complete REST endpoint definitions |
| 🤖 [`agents_overview.md`](./docs/agents_overview.md) | Deep dive into each LangChain agent |
| 🐳 [`deployment.md`](./docs/deployment.md) | Docker and production deployment guide |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'feat: add your feature'`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please follow conventional commit messages and make sure to update tests/docs if applicable.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">Made with 💜 by <strong>Ankit</strong> · If this project helped you, please give it a ⭐!</p>
