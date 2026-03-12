<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Syne&weight=800&size=56&duration=2800&pause=1200&color=7C3AED&center=true&vCenter=true&width=780&lines=🧠+AI+Career+Agent;Your+Career%2C+Unlocked+✦;Land+Your+Dream+Job+Faster+🚀" alt="AI Career Agent" />

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Lora&size=20&duration=4000&pause=2000&color=06B6D4&center=true&vCenter=true&width=640&lines=Full-stack+AI+platform+for+Gen+Z+%26+early-career+professionals" alt="tagline" />

<br/><br/>

<img src="https://img.shields.io/badge/FastAPI-00D084?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0d1220" />
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0d1220" />
<img src="https://img.shields.io/badge/Google_Gemini-A78BFA?style=for-the-badge&logo=google&logoColor=white&labelColor=0d1220" />
<img src="https://img.shields.io/badge/Groq_LLaMA-FB923C?style=for-the-badge&logo=meta&logoColor=white&labelColor=0d1220" />
<img src="https://img.shields.io/badge/LangChain-34D399?style=for-the-badge&logo=chainlink&logoColor=white&labelColor=0d1220" />
<img src="https://img.shields.io/badge/Python-FBBF24?style=for-the-badge&logo=python&logoColor=white&labelColor=0d1220" />

<br/><br/>

<img src="https://img.shields.io/badge/Status-Active-10b981?style=flat-square&labelColor=0d1220" />
&nbsp;
<img src="https://img.shields.io/badge/License-MIT-a855f7?style=flat-square&labelColor=0d1220" />
&nbsp;
<img src="https://img.shields.io/badge/PRs-Welcome-ec4899?style=flat-square&labelColor=0d1220" />
&nbsp;
<img src="https://img.shields.io/badge/Made_with-Love_💜-ef4444?style=flat-square&labelColor=0d1220" />

<br/><br/>

<p><strong>AI Career Agent</strong> is a full-stack intelligent career platform built for Gen Z students and early-career professionals.<br/>
Upload your resume, drop a job description, and let AI do the heavy lifting —<br/>
ATS scores &nbsp;·&nbsp; Skill gap analysis &nbsp;·&nbsp; Market insights &nbsp;·&nbsp; Personalized roadmaps &nbsp;·&nbsp; Career chatbot</p>

</div>

---

## ✨ Features at a Glance

<table>
<tr>
<td width="50%">

### 📄 Resume & Job Analyzer
- **ATS Score** — instant compatibility check
- **Skill Gap Analysis** — matching vs missing skills
- **Match Percentage** — resume ↔ job alignment
- **Selection Probability** — AI-powered hiring chance

</td>
<td width="50%">

### 💼 Cover Letter Generator
- Tailored to the job description
- Professional tone with customization
- Copy, Download & Print directly
- Uses your real resume context

</td>
</tr>
<tr>
<td width="50%">

### 📊 Market Intelligence
- Salary ranges (India 🇮🇳 + Global 🌍)
- Current demand level & future scope
- Core, tools, nice-to-have & declining skills
- Powered by live web scraping + Groq LLaMA

</td>
<td width="50%">

### 🗺️ Learning Roadmap
- Week-by-week interactive timeline
- Phase breakdown (Beginner → Advanced)
- Mini-projects for each week
- Pro tips + expected outcomes
- Download as `.txt`

</td>
</tr>
<tr>
<td colspan="2">

### 🧠 Unified AI Chatbot (bottom-right widget)
Routes every message to the right agent automatically:
`Resume Q&A` → `Market Lookup` → `Roadmap Preview` → `General Career Q&A`

</td>
</tr>
</table>

---

## 🏗️ App Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│                   React Frontend (Port 3000)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │Dashboard │ │  Job     │ │ Market   │ │ Roadmap  │ │ Chat │ │
│  │ (Bento) │ │Analyzer  │ │Analyzer  │ │Generator │ │Widget│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP / Streaming (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     API Endpoints                          │ │
│  │  POST /upload_resume   POST /analyze_resume                │ │
│  │  POST /generate_cover_letter   POST /api/market_analysis   │ │
│  │  POST /api/get_roadmap   POST /api/chat                    │ │
│  └──────────┬──────────┬───────────┬─────────────┬───────────┘ │
│             │          │           │             │             │
│      ┌──────▼──┐ ┌─────▼──┐ ┌─────▼───┐ ┌──────▼──────┐     │
│      │ Career  │ │ Market │ │ Roadmap │ │  Chatbot    │     │
│      │  Agent  │ │ Agent  │ │   LLM   │ │  Router     │     │
│      │(Gemini) │ │(Groq)  │ │(Gemini) │ │  Agent      │     │
│      └──────┬──┘ └─────┬──┘ └───┬─────┘ └──────┬──────┘     │
│             │          │        │               │             │
│      ┌──────▼──────────▼────────▼───────────────▼──────────┐ │
│      │          LangChain LCEL Pipelines                    │ │
│      │   Pydantic Models │ RAG (FAISS) │ Web Scraping       │ │
│      └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Working Workflow

```mermaid
flowchart TD
    A[👤 User Opens App] --> B{Choose Feature}

    B --> C[📄 Job Analyzer]
    B --> D[📊 Market Analyzer]
    B --> E[🗺️ Roadmap]
    B --> F[🤖 AI Chatbot]

    C --> C1[Upload Resume PDF/DOCX]
    C1 --> C2[Paste Job Description]
    C2 --> C3[🚀 Start Complete Analysis]
    C3 --> C4[Gemini AI → LCEL Pipeline]
    C4 --> C5[ATS Score + Skill Gap + Match %]
    C5 --> C6[Cover Letter Generated]
    C6 --> C7[✅ 4-Tab Results Dashboard]

    D --> D1[Enter Role + Location + Experience]
    D1 --> D2[SerpAPI Web Scraping]
    D2 --> D3[Groq LLaMA 3.3 Analysis]
    D3 --> D4[💰 Salary + 📈 Demand + 🛠️ Skills]

    E --> E1[Enter Career Goal + Duration]
    E1 --> E2[RAG Store — FAISS Retrieval]
    E2 --> E3[Gemini JSON Roadmap]
    E3 --> E4[📅 Interactive Week Timeline]
    E4 --> E5[📥 Download .txt]

    F --> F1[User Types Message]
    F1 --> F2[Router Agent Classifies Intent]
    F2 --> F3{Intent?}
    F3 --> F4[career_analysis → CareerAgent]
    F3 --> F5[market_analysis → MarketAgent]
    F3 --> F6[roadmap → RoadmapLLM]
    F3 --> F7[general → Gemini Q&A]
    F4 & F5 & F6 & F7 --> F8[💬 Streaming Reply]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router, Framer Motion, Lucide React |
| **Styling** | Vanilla CSS (Space Grotesk + Inter fonts, glassmorphism) |
| **Backend** | Python 3.11+, FastAPI, Uvicorn |
| **LLMs** | Google Gemini (primary), Groq LLaMA 3.3 (market) |
| **AI Framework** | LangChain LCEL, Pydantic v2, PydanticOutputParser |
| **RAG Pipeline** | FAISS vector store, LangChain text splitters |
| **Web Scraping** | SerpAPI, BeautifulSoup4, httpx |
| **Notifications** | React Toastify |
| **State** | React useState/useEffect (no Redux) |
| **Streaming** | FastAPI StreamingResponse → Fetch ReadableStream |

---

## 📁 Project Structure

```
AI Career Agent/
├── 📂 backend/
│   ├── main.py                   # FastAPI app + all endpoints
│   ├── .env                      # API keys (never commit!)
│   ├── 📂 agents/
│   │   ├── job_anayzer_agent.py  # CareerAgent (LCEL + Pydantic)
│   │   ├── market_insights_agent.py
│   │   ├── Roadmap_agent.py      # RAG + JSON roadmap
│   │   └── chatbot_router_agent.py  # Intent classifier + responder
│   ├── 📂 prompts/
│   │   ├── roadmap_prompt.txt    # JSON-structured
│   │   ├── chatbot_router_prompt.txt
│   │   ├── market_prompts.txt
│   │   └── job_anaylzer/         # unified, ats, cover_letter prompts
│   ├── 📂 scraping/
│   │   └── market_insights_scraping.py
│   ├── 📂 rag_Store/
│   │   └── ingest_roadmap.py     # FAISS ingestion
│   └── 📂 utils/
│       ├── llm_utils.py
│       ├── rag_chain.py
│       └── response_formetter.py
│
└── 📂 frontend/
    ├── 📂 src/
    │   ├── App.js                # Router + ChatWidget global
    │   ├── App.css               # Global design system tokens
    │   ├── 📂 pages/
    │   │   ├── Dashboard.jsx     # Bento grid landing
    │   │   ├── JobAnalyzer.jsx   # 4-tab analyzer
    │   │   ├── MarketAnalyzer.jsx
    │   │   └── RoadMap.jsx       # Interactive timeline
    │   ├── 📂 components/
    │   │   ├── Navbar/
    │   │   ├── ChatWidget/       # Floating AI chatbot
    │   │   ├── ResumeUploader/
    │   │   ├── JobDescriptionForm/
    │   │   ├── SkillsAnalysis/
    │   │   ├── ATSRecommendations/
    │   │   └── CoverLetterGenerator/
    │   └── 📂 Styles/            # Dark theme CSS per page
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- API keys: `GEMINI_API_KEY`, `GROQ_API_KEY`, `SERPAPI_API_KEY`

### 1️⃣ Clone the repo

```bash
git clone https://github.com/ankiiitraj/AI-Career-Agent.git
cd "AI Career Agent"
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
SERPAPI_API_KEY=your_serpapi_key_here
```

```bash
# Start backend
uvicorn main:app --reload --port 8000
```

> ✅ Backend running at `http://localhost:8000`
> 📖 API docs at `http://localhost:8000/docs`

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

> ✅ Frontend running at `http://localhost:3000`

---

## 🔑 API Keys Guide

| Key | Where to Get | Required? |
|-----|-------------|-----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ Yes |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | ✅ Yes |
| `SERPAPI_API_KEY` | [serpapi.com](https://serpapi.com) | ⚡ Optional |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload_resume` | Upload PDF/DOCX resume |
| `POST` | `/analyze_resume` | Full analysis (ATS + skills + match) |
| `POST` | `/generate_cover_letter` | AI cover letter |
| `POST` | `/api/market_analysis` | Market insights for a role |
| `POST` | `/api/get_roadmap` | Week-by-week learning roadmap |
| `POST` | `/api/chat` | Unified AI chatbot (streaming) |
| `GET`  | `/health` | Backend health check |
| `DELETE` | `/clear_data` | Wipe all stored data |

---

## 🎨 UI Design System

The frontend uses a custom **Gen Z dark theme**:

- 🎨 **Colours** — Neon purple `#7c3aed`, hot pink `#ec4899`, electric cyan `#06b6d4`
- 🪟 **Glassmorphism** — `rgba(255,255,255,0.04)` cards with blur
- ✨ **Aurora BG** — radial gradient blobs behind all pages
- 🅰️ **Fonts** — `Space Grotesk` (headings) + `Inter` (body)
- 💫 **Animations** — Framer Motion page transitions, Lucide icons

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-thing`
3. Commit changes: `git commit -m 'feat: add amazing thing'`
4. Push: `git push origin feature/amazing-thing`
5. Open a Pull Request 🎉

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with 💜 by **Ankit** · Powered by **Google Gemini** + **Groq LLaMA** + **LangChain**

</div>
