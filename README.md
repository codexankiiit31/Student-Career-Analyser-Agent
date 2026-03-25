<p align="center">
  <a href="https://github.com/codexankiiit31/Student-Career-Analyser-Agent">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=35&pause=1000&color=A855F7&center=true&vCenter=true&width=700&height=80&lines=🤖+AI+Career+Agent;Student+Career+Analyser;Your+Career%2C+Unlocked+🚀;Land+Your+Dream+Job+Faster!" alt="Typing SVG" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E44AD?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_LLaMA-FF6B35?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-10b981?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-a855f7?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-Welcome-ec4899?style=flat-square" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" />
</p>

---

> **AI Career Agent** is a full-stack, AI-powered career intelligence platform built for students and modern professionals. Upload your resume and a job description to instantly receive ATS optimization scores, skill gap analysis, real-time market insights, AI-generated cover letters, and personalized week-by-week learning roadmaps — all powered by a multi-agent LangChain architecture.

<br/>

---

## 🌐 Live Demo

| Service | URL | Platform |
|:---|:---|:---:|
| 🖥️ **Frontend** | [https://student-career-analyser.vercel.app](https://student-career-analyser-agent.vercel.app/) | Vercel |
| ⚙️ **Backend API** | [https://student-career-analyser-api.onrender.com](https://student-career-analyser-api.onrender.com) | Render |
| 📖 **Swagger Docs** | [https://student-career-analyser-api.onrender.com/docs](https://student-career-analyser-api.onrender.com/docs) | Render |

> ⚠️ The backend is hosted on Render's free tier — it may take **~30 seconds** to cold-start if inactive.

---

### ⚡ What can it do?

| | Feature | Powered By |
|:---:|:---|:---|
| 📄 | **Smart Resume Analysis** — ATS Score + Skill Gap + Selection Probability | LangChain + Gemini Flash |
| 💼 | **Cover Letter Generator** — Tailored to your resume & target role | Google Gemini |
| 📊 | **Live Market Intelligence** — Real-time salary, demand & scope | Groq LLaMA 3.3 + SerpAPI |
| 🗺️ | **Learning Roadmaps** — Week-by-week curriculum with mini-projects | FAISS RAG + Gemini |
| 🧠 | **Unified AI Chatbot** — Intent-routing, streamed conversational agent | LangChain LCEL |

---

## 📋 Table of Contents

- [🌐 Live Demo](#-live-demo)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 CI/CD Pipeline](#-cicd-pipeline)
- [☁️ Deployment](#️-deployment)
- [📂 Project Structure](#-project-structure)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [🤖 AI Agents Deep Dive](#-ai-agents-deep-dive)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🏗️ Architecture

The system is designed around a clean separation of concerns: a React frontend communicates exclusively via REST with a FastAPI backend, which delegates all intelligence to domain-specific LangChain agents.

```
┌─────────────────────────────────────────────────────────────────┐
│                        👤  USER                                  │
│               React App  (Vercel :443)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP / StreamingResponse
┌──────────────────────────▼──────────────────────────────────────┐
│              FastAPI Backend  (Render :443)                       │
│           Pydantic v2  ·  BackgroundTasks  ·  Uvicorn            │
└──────────────────────────┬──────────────────────────────────────┘
                           │  LangChain LCEL
┌──────────────────────────▼──────────────────────────────────────┐
│                    Agent Router / Orchestrator                    │
└────────┬──────────────┬──────────────┬──────────────┬───────────┘
         │              │              │              │
┌────────▼───┐  ┌───────▼────┐  ┌─────▼──────┐  ┌───▼────────┐
│   Career   │  │   Market   │  │  Roadmap   │  │  QA/Chat   │
│   Agent    │  │   Agent    │  │   Agent    │  │   Agent    │
└────────┬───┘  └───────┬────┘  └─────┬──────┘  └───┬────────┘
         │              │              │              │
    Gemini Flash   Groq LLaMA 3.3   FAISS RAG    Gemini Flash
                   + SerpAPI        Vector DB     (Streamed)
```

**Key architectural decisions:**

- **LCEL Pipe Syntax** (`prompt | model | parser`) enforces structured JSON outputs and minimizes hallucinations
- **BackgroundTasks** keep market analysis non-blocking — a `job_id` is returned immediately for polling
- **FAISS** is a local lightweight vector index for roadmap RAG (no external vector DB dependency)
- **ReadableStream** in the frontend delivers real-time word-by-word chatbot responses without WebSockets

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, CSS Modules |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2, Uvicorn |
| **AI Orchestration** | LangChain LCEL |
| **LLMs** | Google Gemini Flash · Groq LLaMA 3.3 |
| **Vector Database** | FAISS (Facebook AI Similarity Search) |
| **Web Scraping** | SerpAPI |
| **Document Parsing** | PyMuPDF (PDF) · python-docx (DOCX) |
| **Containerization** | Docker · Docker Compose |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **CI/CD** | GitHub Actions |

---

## 🚀 CI/CD Pipeline

This project uses **GitHub Actions** for a fully automated CI/CD pipeline. Every push to the `main` branch triggers the following workflow:

```
push to main
      │
      ▼
┌─────────────────────────┐
│   1. Run Tests & Lint   │  ← pytest (backend) + ESLint (frontend)
└────────────┬────────────┘
             │  ✅ all checks pass
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐  ┌──────────────┐
│  Deploy  │  │    Deploy    │
│ Frontend │  │   Backend    │
│  Vercel  │  │    Render    │
└──────────┘  └──────────────┘
```

**Pipeline stages:**

| Stage | Tool | What it does |
|:---|:---|:---|
| 🧪 **Test** | `pytest` + ESLint | Runs backend unit tests and frontend lint checks |
| 🏗️ **Build** | Vercel CLI / Render | Builds production artifacts for both services |
| 🚢 **Deploy Frontend** | Vercel | Auto-deploys React app on every successful test run |
| ⚙️ **Deploy Backend** | Render | Auto-deploys FastAPI service via Render deploy hook |

The workflow file lives at `.github/workflows/ci-cd.yml`. Both deployments run in **parallel** after tests pass, keeping total pipeline time minimal.

---

## ☁️ Deployment

### Frontend — Vercel

The React app is deployed on **Vercel** with zero-config automatic deployments.

**Live URL:** `https://student-career-analyser.vercel.app`

Key settings:
- **Build command:** `npm run build`
- **Output directory:** `build`
- **Root directory:** `frontend/`
- **Environment variable:** `REACT_APP_API_URL` → your Render backend URL

### Backend — Render

The FastAPI backend is deployed on **Render** as a web service.

**Live API:** `https://student-career-analyser-api.onrender.com`

Key settings:
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root directory:** `backend/`
- Environment variables: set `GEMINI_API_KEY`, `GROQ_API_KEY`, `SERPAPI_API_KEY` in Render's dashboard

> 💡 For production, set `CORS` origins in `main.py` to your Vercel frontend URL.

### Docker (Self-hosted)

Spin up the entire stack locally with one command:

```bash
docker-compose up --build
```

Both services start automatically — FastAPI on `:8000` and React on `:3000`.

> ⚠️ Ensure `backend/.env` exists before running Docker.

---

## 📂 Project Structure

```
Student-Career-Analyser-Agent/
│
├── 📁 .github/
│   └── workflows/
│       └── ci-cd.yml               # GitHub Actions CI/CD pipeline
│
├── 📁 backend/                     # Python FastAPI application
│   ├── main.py                     # App entrypoint & route definitions
│   ├── agents/
│   │   ├── career_agent.py         # Resume ↔ JD analysis & ATS scoring
│   │   ├── market_agent.py         # Live market scraping + Groq analysis
│   │   ├── roadmap_agent.py        # RAG-powered roadmap generation
│   │   └── chat_agent.py           # Conversational router / Q&A
│   ├── utils/                      # File parsers, FAISS index helpers
│   ├── requirements.txt
│   └── .env.example
│
├── 📁 frontend/                    # React 18 application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level page components
│   │   └── App.js
│   └── package.json
│
├── 📁 docs/                        # Detailed technical documentation
│   ├── architecture.md
│   ├── api_reference.md
│   ├── agents_overview.md
│   └── deployment.md
│
├── docker-compose.yml              # One-command full-stack startup
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- API Keys — see [Environment Variables](#-environment-variables)

**1. Clone the repository**

```bash
git clone https://github.com/codexankiiit31/Student-Career-Analyser-Agent.git
cd Student-Career-Analyser-Agent
```

**2. Backend setup**

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate      # macOS / Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env` with your API keys:

```env
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
SERPAPI_API_KEY=your_serpapi_key    # Optional — for live market data
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

> ✅ API live at `http://localhost:8000`  
> 📖 Swagger UI at `http://localhost:8000/docs`

**3. Frontend setup**

```bash
cd ../frontend
npm install
npm start
```

> ✅ App live at `http://localhost:3000`

---

## 🔑 Environment Variables

| Variable | Required | Description |
|:---|:---:|:---|
| `GEMINI_API_KEY` | ✅ | Google Gemini Flash — powers resume analysis & chatbot. Get from [Google AI Studio](https://aistudio.google.com/) |
| `GROQ_API_KEY` | ✅ | Groq — fast LLaMA 3.3 inference for market analysis. Get from [console.groq.com](https://console.groq.com/) |
| `SERPAPI_API_KEY` | ⚠️ Optional | Live job/salary scraping. Without it, market data falls back to static mode. Get from [serpapi.com](https://serpapi.com/) |
| `REACT_APP_API_URL` | ✅ (prod) | Backend API base URL — set in Vercel dashboard for production builds |

---

## 📡 API Reference

**Base URL:** `https://student-career-analyser-api.onrender.com`  
All endpoints accept/return `application/json` unless marked otherwise.

<details>
<summary><b>POST /upload_resume</b> — Parse a PDF or DOCX resume</summary>

**Body:** `multipart/form-data` with a `file` field  
**Response:**
```json
{ "filename": "resume.pdf", "text": "Extracted text content..." }
```
</details>

<details>
<summary><b>POST /analyze_resume</b> — ATS Score + Skill Gap Analysis</summary>

**Body:**
```json
{ "resume_text": "...", "job_description": "..." }
```
**Response:**
```json
{ "ats_score": 78, "missing_skills": ["Docker", "Kubernetes"], "selection_probability": "High" }
```
</details>

<details>
<summary><b>POST /generate_cover_letter</b> — AI-tailored cover letter</summary>

**Body:**
```json
{ "resume_text": "...", "job_description": "..." }
```
**Response:**
```json
{ "cover_letter": "Dear Hiring Manager, ..." }
```
</details>

<details>
<summary><b>POST /api/market_analysis</b> — Start live market data task</summary>

**Body:**
```json
{ "role": "Software Engineer", "location": "India", "experience": "Entry Level" }
```
**Response:**
```json
{ "job_id": "abc123" }
```
</details>

<details>
<summary><b>GET /api/market_analysis/status/{job_id}</b> — Poll task status</summary>

**Response:**
```json
{ "status": "completed", "data": { "avg_salary": "8-14 LPA", "demand": "High" } }
```
</details>

<details>
<summary><b>POST /api/get_roadmap</b> — Week-by-week learning roadmap</summary>

**Body:**
```json
{ "career_goal": "DevOps Engineer", "duration": "4 Weeks" }
```
**Response:** Nested JSON with phases, weekly tasks, and mini-project ideas.
</details>

<details>
<summary><b>POST /api/chat</b> — Streamed conversational agent</summary>

**Body:**
```json
{ "message": "What skills am I missing?", "history": [] }
```
**Response:** `StreamingResponse` — chunked word-by-word over HTTP.
</details>

> Full schemas: [`docs/api_reference.md`](./docs/api_reference.md)

---

## 🤖 AI Agents Deep Dive

The backend uses **4 specialized LangChain agents** built with LCEL pipe syntax (`prompt | model | output_parser`) to enforce structured outputs.

### 📄 Career Agent
| | |
|:---|:---|
| **Model** | Google Gemini Flash |
| **Input** | Resume text + Job Description |
| **Output** | ATS score (0–100), missing skills, matched keywords, selection probability |
| **Technique** | Structured prompt + `JsonOutputParser` for schema validation |

### 📊 Market Agent
| | |
|:---|:---|
| **Model** | Groq LLaMA 3.3 |
| **Input** | Role, location, experience level |
| **Output** | Salary range, demand score, top hiring companies, future scope |
| **Technique** | Runs as `BackgroundTask` — SerpAPI fetches live results, Groq summarizes into structured JSON |

### 🗺️ Roadmap Agent
| | |
|:---|:---|
| **Model** | Google Gemini Flash + FAISS |
| **Input** | Career goal + desired duration |
| **Output** | Week-by-week plan with topics, resources, and mini-projects |
| **Technique** | FAISS semantic search over curated career paths (RAG); retrieved context injected into prompt |

### 🗣️ QA / Chat Agent
| | |
|:---|:---|
| **Model** | Google Gemini Flash (streamed) |
| **Input** | User message + conversation history |
| **Output** | Intent-routed, context-aware streamed response |
| **Technique** | Router prompt classifies intent → delegates to the right sub-chain → streams the result |

> Implementation details: [`docs/agents_overview.md`](./docs/agents_overview.md)

---

## 📚 Documentation

| Document | Description |
|:---|:---|
| 🏛️ [`architecture.md`](./docs/architecture.md) | System design, data flow, and layer breakdown |
| 📡 [`api_reference.md`](./docs/api_reference.md) | Full REST endpoint schemas |
| 🤖 [`agents_overview.md`](./docs/agents_overview.md) | Deep dive into each LangChain agent |
| 🐳 [`deployment.md`](./docs/deployment.md) | Docker, Vercel, and Render deployment guide |

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo and clone it
git clone https://github.com/YOUR_USERNAME/Student-Career-Analyser-Agent.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes (use conventional commits)
git commit -m "feat: add your feature description"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

The CI pipeline will automatically run tests on your PR. Please ensure all checks pass before requesting a review.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Made with 💜 by **[Ankit](https://github.com/codexankiiit31)**

⭐ **Star this repo if it helped you on your career journey!**

</div>
