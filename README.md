<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=40&duration=3000&pause=1000&color=A855F7&center=true&vCenter=true&width=700&lines=🧠+AI+Career+Agent;Your+Career%2C+Unlocked+🚀;Land+Your+Dream+Job+Faster" alt="Typing SVG" />

<br/>

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
</p>

<br/>

> **AI Career Agent** is a full-stack, AI-powered career intelligence platform designed for students and modern professionals. 
> Upload your resume and job description to instantly receive ATS optimization, skill gap analysis, live market insights, AI-generated cover letters, and personalized learning roadmaps.

</div>

---

## ✨ Capabilities

| Feature | Description |
|---|---|
| 📄 **Smart Resume Analysis** | Instantly match your uploaded resume (PDF/DOCX) against any Job Description. Retrieves an ATS Score, Skill Gap Analysis, and Selection Probability using LangChain and Gemini. |
| 💼 **Cover Letter Generator** | Generates an AI-tailored cover letter based on your exact experiences and the target job's requirements. |
| 📊 **Live Market Intelligence** | Fetches real-time salary, demand, and future scope using web scraping and Groq LLaMA 3.3. |
| 🗺️ **Learning Roadmaps** | Generates an interactive, week-by-week RAG-powered study plan complete with mini-projects. |
| 🧠 **Unified AI Chatbot** | A conversational agent that routes questions automatically. Ask anything from *"What's my ATS score?"* to *"What is a DevOps engineer?"* and get contextual, streamed responses. |

---

## 📚 Documentation Directory

For deep-dives into how the AI Career Agent is built, check out our comprehensive documentation in the `docs/` folder:

- 🏛️ **[Architecture overview](docs/architecture.md)** — Learn about the FastAPI + React setup and data flow.
- 📡 **[API Reference](docs/api_reference.md)** — Detailed definitions of our REST endpoints.
- 🤖 **[AI Agents Deep-Dive](docs/agents_overview.md)** — Discover how our 4 LangChain agents operate.
- 🐳 **[Deployment Guide](docs/deployment.md)** — Instructions on running the project using Docker.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- API Keys: `GEMINI_API_KEY`, `GROQ_API_KEY`, `SERPAPI_API_KEY` (optional)

### 1. Clone & Install
```bash
git clone https://github.com/codexankiiit31/Student-Career-Analyser-Agent.git
cd "AI Career Agent"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```
Create a `backend/.env` file with your keys:
```env
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
SERPAPI_API_KEY=your_key
```
Start the API:
```bash
uvicorn main:app --reload --port 8000
```
> API is now live at `http://localhost:8000`. Test via Interactive Docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
> Explore the UI at `http://localhost:3000`.

---

## 🏗️ Architecture Flow

```mermaid
graph TD
    User([👤 User]) -->|React UI| Frontend(Frontend App :3000)
    Frontend -->|HTTP / WebSockets| Backend(FastAPI Backend :8000)
    
    Backend -->|LangChain LCEL| Orchestrator{Agent Router}
    
    Orchestrator -->|Resume/JD| CareerAgent[📄 Career Agent]
    Orchestrator -->|Live Context| MarketAgent[📊 Market Agent]
    Orchestrator -->|Learning| RoadmapAgent[🗺️ Roadmap Agent]
    Orchestrator -->|Chat| QA[🗣️ Gemini Q&A]
    
    CareerAgent -.-> Gemini([Google Gemini Flash])
    MarketAgent -.->|Scraping| Groq([Groq LLaMA 3.3])
    RoadmapAgent -.-> FAISS[(FAISS Vector DB)]
```

---

<div align="center">
Made with 💜 by <b>Ankit</b> · <i>Star this repository if it helped you!</i>
</div>
