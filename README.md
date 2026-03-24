<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=40&duration=3000&pause=1000&color=A855F7&center=true&vCenter=true&width=700&lines=🧠+CareerAI;Your+Career%2C+Unlocked+🚀;Land+Your+Dream+Job+Faster" alt="Typing SVG" />

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E44AD?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_LLaMA_3.3-FF6B35?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-10b981?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-a855f7?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-Welcome-ec4899?style=flat-square" />
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=flat-square" />
</p>

<br/>

> **CareerAI** is a full-stack AI career intelligence platform built for students and early-career professionals.  
> Upload your resume, drop a job description, and let AI handle the rest — ATS scores, skill gap analysis, live market insights, personalized learning roadmaps, and a smart career chatbot. All in one place.

</div>

---
<<<<<<< HEAD
## ✨ Features at a Glance
=======

## 🚀 At a Glance
>>>>>>> f009251 (feat: massive update including new agents, UI improvements, and Docker MLOps setup)

| Metric | Value |
|--------|-------|
| ⚡ Avg ATS Score Boost | **+37%** after optimization |
| 🎯 Skills Matched Accuracy | **92%** in gap detection |
| 🤖 AI Models | **Gemini AI** + **Groq LLaMA 3.3** |
| 💌 Cover Letter | AI-tailored **in seconds** |

---

## ✨ Features

### 📄 Resume & Job Analyzer *(Most Used)*
The core feature. Upload your resume and paste a job description — the AI does a complete end-to-end analysis:
- **ATS Score** — instant compatibility check (0–100)
- **Skill Gap Analysis** — matched vs. missing skills at a glance
- **Match Percentage** — resume ↔ job alignment score
- **ATS Optimization** — rewrite suggestions to beat filters
- **Cover Letter** — AI-generated, tailored to the specific JD in seconds

---

### 📊 Market Intelligence *(Live Web Scraping)*
Search any career role and get a real-time market report powered by live web scraping + Groq LLaMA 3.3:
- 💰 **Salary Ranges** — India 🇮🇳 and Global 🌍
- 📈 **Demand Level** — High / Medium / Low with trend summaries
- 🛠️ **Skills Breakdown** — Core, Tools, Nice-to-Have, and Declining
- 🔮 **Future Scope** — AI-generated career outlook and advice

---

### 🗺️ Learning Roadmap *(Week by Week)*
Give it your career goal and duration — it builds you a structured, interactive learning timeline:
- 📅 Phase-based plan: **Beginner → Intermediate → Advanced**
- 📁 Mini-projects for every week to build real experience
- 📚 Curated resources per week
- ⚡ Pro Tips + Expected Outcomes
- 📥 **Download as PDF**

---

### 🧠 AI Career Chatbot *(New — Bottom-Right Widget)*
Ask anything. The chatbot automatically routes your message to the right agent:

| Your Message | Routed To |
|---|---|
| "What skills am I missing?" | CareerAgent (your resume data) |
| "What's the salary for ML Engineer?" | MarketAgent (live data) |
| "How do I become a DevOps engineer?" | RoadmapLLM |
| "What should I focus on for interviews?" | General Career Q&A (Gemini) |

All responses are **streamed word by word** for a real-time feel.

---

### ⚡ Live Processing Terminal *(New)*
See exactly how the AI thinks and processes your requests in real-time.
- **WebSocket Streaming** — Backend agent thought processes are streamed directly to the UI.
- **Transparency** — Watch the AI route your query, search knowledge bases, and scrape live data.
- **Debugging & Telemetry** — Built-in telemetry to monitor system health and agent performance.

---

## ⚙️ How It Works

```
01  Upload Resume              02  Paste Job Description        03  Get Full AI Report
────────────────────          ────────────────────────          ────────────────────────
Drop your PDF or DOCX —       Add any JD from LinkedIn,         Instant ATS score, match %,
we extract every detail       Naukri, or anywhere else.         missing skills, cover letter
automatically.                                                  & learning roadmap.
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       React Frontend (Port 3000)                  │
│ Dashboard │ App Tools │ Market │ Roadmap │ Chatbot │ Live Terminal│
└──────────────┬────────────────────────────────────────────┬──────┘
               │ REST API (JWT Auth)                        │ WebSocket
               ▼                                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)                    │
│                                                                  │
│  /upload_resume   /analyze_resume   /generate_cover_letter       │
│  /api/market_analysis  →  BackgroundTasks (non-blocking)         │
│  /api/market_analysis/status/{job_id}  →  Polling endpoint       │
│  /api/get_roadmap   /api/chat  (Streaming)   ws://agent_logs     │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  ┌─────────┐  │
│  │ CareerAgent │  │ MarketAgent  │  │ RoadmapLLM│  │Chatbot  │  │
│  │  (Gemini)   │  │(Groq LLaMA) │  │ (Gemini)  │  │ Router  │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  └────┬────┘  │
│         │                │                 │             │        │
│  ┌──────▼────────────────▼─────────────────▼─────────────▼─────┐ │
│  │  LangChain LCEL │ Pydantic v2 │ FAISS RAG │ ThreadPoolExecutor│ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Supabase (Auth + User Data)     SerpAPI + BeautifulSoup4        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v6, Framer Motion, Lucide React |
| **Styling** | Vanilla CSS, Space Grotesk + Inter fonts, Glassmorphism |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, BackgroundTasks |
| **Auth & DB** | Supabase (JWT Auth + PostgreSQL user data) |
| **LLMs** | Google Gemini 2.0 Flash (primary), Groq LLaMA 3.3 (market) |
| **AI Framework** | LangChain LCEL, Pydantic v2, PydanticOutputParser |
| **RAG Pipeline** | FAISS vector store, Google Gemini Embeddings |
| **Web Scraping** | SerpAPI, BeautifulSoup4, concurrent.futures (parallel) |
| **Streaming** | FastAPI StreamingResponse → Fetch ReadableStream |
| **Real-Time Logs** | WebSockets (`ws://`) via FastAPI to React |

---

## 📁 Project Structure

```
AI Career Agent/
├── 📂 backend/
│   ├── main.py                      # FastAPI app, all endpoints, BackgroundTasks job store
│   ├── auth.py                      # JWT auth helpers
│   ├── .env                         # API keys (never commit!)
│   ├── 📂 agents/
│   │   ├── job_analyzer_agent.py    # CareerAgent: ATS + skills + cover letter (Gemini)
│   │   ├── market_insights_agent.py # MarketAgent: live salary + demand (Groq)
│   │   ├── Roadmap_agent.py         # RoadmapLLM: FAISS RAG + Gemini JSON
│   │   └── chatbot_router_agent.py  # Intent classification + multi-agent routing
│   ├── 📂 database/                 
│   │   ├── supabase_client.py       # Supabase connection
│   │   ├── users.json               # Local user store fallback
│   │   └── memory_store.json        # Chat memory store
│   ├── 📂 logs/                     # Application & agent processing logs
│   ├── 📂 scraping/
│   │   └── market_insights_scraping.py  # SerpAPI + parallel BeautifulSoup4
│   ├── 📂 rag_Store/
│   │   └── ingest_roadmap.py        # FAISS vector store ingestion
│   ├── 📂 routers/
│   │   └── auth_router.py           # /auth/register, /auth/token
│   └── 📂 utils/
│       ├── llm_utils.py
│       ├── rag_chain.py
│       ├── ws_logger.py             # WebSocket live logging terminal
│       └── response_formatter.py
│
└── 📂 frontend/
    └── 📂 src/
        ├── App.js                   # Router + ErrorBoundary + ToastContainer
        ├── 📂 pages/
        │   ├── Dashboard.jsx        # Bento grid landing
        │   ├── JobAnalyzer.jsx      # 4-tab analyzer (Upload → Skills → ATS → Cover Letter)
        │   ├── MarketAnalyzer.jsx   # Polling-based market intelligence
        │   ├── RoadMap.jsx          # Interactive week-by-week timeline + PDF download
        │   ├── Login.jsx            # User authentication login
        │   └── Register.jsx         # User authentication registration
        ├── 📂 components/
        │   ├── ErrorBoundary.jsx    # Global crash protection
        │   ├── ProtectedRoute.jsx   # Route guard for authenticated users
        │   ├── Navbar/
        │   ├── ChatWidget/          # Floating AI chatbot (bottom-right)
        │   ├── LiveTerminal/        # Real-time WebSocket processing logs
        │   ├── ResumeUploader/
        │   ├── JobDescriptionForm/
        │   ├── SkillsAnalysis/
        │   ├── ATSRecommendations/
        │   └── CoverLetterGenerator/
        └── 📂 services/
            └── api.js               # Axios instance, JWT interceptor, all API calls
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- API Keys: `GEMINI_API_KEY`, `GROQ_API_KEY`, `SERPAPI_API_KEY`, Supabase credentials

### 1️⃣ Clone

```bash
git clone https://github.com/codexankiiit31/Student-Career-Analyser-Agent.git
cd "AI Career Agent"
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies using uv (recommended for speed)
pip install uv
uv pip install -r requirements.txt
```

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
SERPAPI_API_KEY=your_serpapi_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SECRET_KEY=your_jwt_secret
```

```bash
# Start backend
uvicorn main:app --reload --port 8000
```

> ✅ Backend running at `http://localhost:8000`  
> 📖 Interactive API docs at `http://localhost:8000/docs`

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

> ✅ Frontend running at `http://localhost:3000`

---

## 🔑 API Keys

| Key | Where to Get | Required? |
|-----|-------------|-----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ Yes |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | ✅ Yes |
| `SERPAPI_API_KEY` | [serpapi.com](https://serpapi.com) | ✅ Yes (Market feature) |
| `SUPABASE_URL` + `SUPABASE_KEY` | [supabase.com](https://supabase.com) | ✅ Yes (Auth + DB) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/token` | Login → JWT token |
| `POST` | `/upload_resume` | Upload PDF/DOCX resume |
| `POST` | `/analyze_job` | Save job description |
| `GET`  | `/analyze_resume` | Full analysis (ATS + skills + match) |
| `GET`  | `/generate_cover_letter` | AI-tailored cover letter |
| `POST` | `/api/market_analysis` | Start background market scraping job → `job_id` |
| `GET`  | `/api/market_analysis/status/{job_id}` | Poll background job status |
| `POST` | `/api/get_roadmap` | Week-by-week career roadmap |
| `POST` | `/api/chat` | Unified AI chatbot (streaming) |
| `GET`  | `/health` | Backend health check |
| `DELETE` | `/clear_data` | Wipe user's stored data |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request 🎉

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with 💜 by **Ankit Kumar** · Powered by **Google Gemini** + **Groq LLaMA 3.3** + **LangChain**

<br/>

⭐ **If this project helped you, drop a star!** ⭐

</div>
