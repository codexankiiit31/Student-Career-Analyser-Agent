import os
from dotenv import load_dotenv
load_dotenv()  # ── Load environment variables before importing anything else

from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, Form, HTTPException, Depends, Request, BackgroundTasks, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import uvicorn
import logging
import threading

from fastapi.security import OAuth2PasswordRequestForm
from auth import (
    Token,
    User,
    get_current_user,   # dependency that protects routes
)

from database.supabase_client import get_supabase_client

# Import the auth router — it owns /auth/register and /auth/token
from routers.auth_router import router as auth_router

# Configure global file logging
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("logs/app.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# ============================================
# AGENTS
# ============================================

from agents.job_analyzer_agent import CareerAgent
from agents.market_insights_agent import MarketAnalysisAgent
from agents.Roadmap_agent import RoadmapLLM
from agents.chatbot_router_agent import ChatbotRouterAgent

from utils.ws_logger import ws_manager

from utils.response_formatter import (
    extract_and_clean_text,
    format_cover_letter,
    format_error_response
)


# ============================================
# LIFESPAN — agent startup / shutdown
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all heavy agents once at startup and attach to app.state."""
    logger.info("Starting up — initializing agents...")
    app.state.career_agent = CareerAgent()
    app.state.market_agent = MarketAnalysisAgent()
    app.state.chatbot_router = ChatbotRouterAgent()
    yield
    # Shutdown cleanup (extend as needed)
    logger.info("Shutting down — agents released.")


# ============================================
# APP INIT
# ============================================

app = FastAPI(
    title="AI Career Intelligence Platform",
    version="4.0",
    description="Chat-based AI career assistant with routing, memory, and multi-agent execution",
    lifespan=lifespan
)

# ==============================================================
# INCLUDE ROUTERS
# ==============================================================
#
# Instead of writing /register and /token routes directly here,
# we organise them into routers/auth_router.py and include them.
#
# app.include_router() mounts that router into our app so that
# all its routes are available, just as if they were written here.
#
# The router has prefix="/auth", so the endpoints become:
#   POST /auth/register
#   POST /auth/token
#
app.include_router(auth_router)

# Allow the React frontend to call this backend.
# In production, set FRONTEND_URL to your deployed React domain (e.g. https://your-app.vercel.app)
import os

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://student-career-analyser-agent.vercel.app",
    "https://student-career-analyser-agent-git-main-codexankiiit31s-projects.vercel.app",
]

# Add production frontend URL if it exists
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# FILE STORAGE (RESUME / JOB)
# ============================================

# We now use Supabase's `user_data` table instead of local files.

# ============================================
# CHAT MEMORY (PER SESSION)
# ============================================

CHAT_MEMORY = {}

# ============================================
# BACKGROUND JOB STORE
# ============================================
# Stores job results keyed by job_id.
# Status values: "pending" | "processing" | "done" | "error"
JOB_STORE: dict = {}
JOB_STORE_LOCK = threading.Lock()

def get_chat_history(session_id: str):
    return CHAT_MEMORY.get(session_id, [])

def save_chat_message(session_id: str, role: str, content: str):
    CHAT_MEMORY.setdefault(session_id, []).append(
        {"role": role, "content": content}
    )

def format_chat_history(history):
    return "\n".join(
        f"{msg['role'].upper()}: {msg['content']}"
        for msg in history
    )

# Agents are initialized in the lifespan function above and accessed via request.app.state

# ============================================
# MODELS
# ============================================

class MarketRequest(BaseModel):
    role: str
    location: Optional[str] = None
    experience_level: Optional[str] = "entry"


# ============================================
# BACKGROUND WORKER
# ============================================

def _run_market_analysis_job(
    job_id: str,
    market_agent,
    role: str,
    location: Optional[str],
    experience_level: str
):
    """Runs in a background thread. Writes result to JOB_STORE when done."""
    with JOB_STORE_LOCK:
        JOB_STORE[job_id]["status"] = "processing"
    try:
        result = market_agent.analyze_market(
            role=role,
            location=location,
            experience_level=experience_level
        )
        with JOB_STORE_LOCK:
            JOB_STORE[job_id].update({
                "status": "done",
                "data": result,
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Background market job {job_id} failed: {e}")
        with JOB_STORE_LOCK:
            JOB_STORE[job_id].update({
                "status": "error",
                "error": str(e)
            })

class RoadmapRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# ============================================
# ROOT / HEALTH
# ============================================

@app.get("/health")
def root():
    return {
        "status": "running",
        "version": "4.0",
        "services": {
            "career_agent": True,
            "market_agent": True,
            "roadmap_rag": True,
            "chat_router": True,
            "auth": True
        }
    }


# ============================================
# RESUME FLOW
# ============================================

@app.post("/upload_resume")
async def upload_resume(
    request: Request,
    file: UploadFile,
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    if not file.filename:
        raise HTTPException(400, "Invalid file")

    text = extract_and_clean_text(file)

    if len(text.strip()) < 50:
        raise HTTPException(400, "Resume text too short")

    supabase = get_supabase_client()
    
    # Upsert the resume text into the user_data table
    response = supabase.table("user_data").upsert({
        "user_id": current_user.id,
        "resume_text": text
    }, on_conflict="user_id").execute()

    return {"message": "Resume uploaded successfully"}

@app.post("/analyze_job")
async def analyze_job(
    request: Request,
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    supabase = get_supabase_client()
    
    # Upsert the job description into the user_data table
    response = supabase.table("user_data").upsert({
        "user_id": current_user.id,
        "job_description": job_description.strip()
    }, on_conflict="user_id").execute()

    return {"message": "Job description saved"}

@app.get("/analyze_resume")
def analyze_resume(
    request: Request,
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    supabase = get_supabase_client()
    response = supabase.table("user_data").select("*").eq("user_id", current_user.id).execute()
    
    if not response.data:
        raise HTTPException(400, "Resume or Job missing")
        
    user_data = response.data[0]
    resume = user_data.get("resume_text")
    job = user_data.get("job_description")

    if not resume or not job:
        raise HTTPException(400, "Resume or Job missing")

    try:
        result = request.app.state.career_agent.unified_analysis(resume=resume, job=job)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        return format_error_response(str(e), "resume_analysis")

@app.get("/generate_cover_letter")
def generate_cover_letter(
    request: Request,
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    supabase = get_supabase_client()
    response = supabase.table("user_data").select("*").eq("user_id", current_user.id).execute()
    
    if not response.data:
        raise HTTPException(400, "Resume or Job missing")
        
    user_data = response.data[0]
    resume = user_data.get("resume_text")
    job = user_data.get("job_description")

    if not resume or not job:
        raise HTTPException(400, "Resume or Job missing")

    try:
        result = request.app.state.career_agent.generate_cover_letter(resume, job)
        return {
            "status": "success",
            "generated_letter": result.get("cover_letter", ""),
            "word_count": result.get("word_count", 0),
            "opening_hook": result.get("opening_hook", ""),
            "call_to_action": result.get("call_to_action", ""),
            "key_highlights": result.get("key_highlights", []),
            "tone": "professional"
        }
    except Exception as e:
        return format_error_response(str(e), "cover_letter")

# ============================================
# MARKET ANALYSIS
# ============================================

@app.post("/api/market_analysis")
def market_analysis(
    req: Request,
    request: MarketRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    """
    Immediately returns a job_id. Scraping + LLM runs in the background.
    Poll GET /api/market_analysis/status/{job_id} for results.
    """
    if not request.role or not request.role.strip():
        raise HTTPException(400, "Role cannot be empty")

    job_id = str(uuid.uuid4())
    with JOB_STORE_LOCK:
        JOB_STORE[job_id] = {"status": "pending"}

    background_tasks.add_task(
        _run_market_analysis_job,
        job_id,
        req.app.state.market_agent,
        request.role.strip(),
        request.location,
        request.experience_level or "entry"
    )

    return {"job_id": job_id, "status": "pending"}


@app.get("/api/market_analysis/status/{job_id}")
def market_analysis_status(
    job_id: str,
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    """Poll this endpoint every few seconds to check if the background job is complete."""
    with JOB_STORE_LOCK:
        job = JOB_STORE.get(job_id)

    if not job:
        raise HTTPException(404, "Job not found. It may have expired.")

    if job["status"] == "done":
        return {
            "status": "done",
            "timestamp": job.get("timestamp"),
            "data": job["data"]
        }
    elif job["status"] == "error":
        raise HTTPException(500, job.get("error", "Analysis failed"))
    else:
        # pending or processing
        return {"status": job["status"]}

# ============================================
# ROADMAP (RAG)
# ============================================

@app.post("/api/get_roadmap")
def get_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user)  # 🔒 JWT protected
):
    if len(request.query.strip()) < 5:
        raise HTTPException(400, "Query too short")

    try:
        roadmap_llm = RoadmapLLM(request.query)
        roadmap = roadmap_llm.generate(request.query)

        return {
            "success": True,
            "career": roadmap.get("career", request.query),
            "data": roadmap
        }
    except Exception as e:
        raise HTTPException(500, f"Roadmap generation failed: {str(e)}")

# ============================================
# CHATBOT ENDPOINT (ROUTER + MEMORY + STREAM)
# ============================================

@app.post("/api/chat")
def chat(req: Request, request: ChatRequest, current_user: User = Depends(get_current_user)):

    if not request.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    session_id = request.session_id or str(uuid.uuid4())
    history = get_chat_history(session_id)
    history_text = format_chat_history(history)

    save_chat_message(session_id, "user", request.message)

    chatbot_router = req.app.state.chatbot_router

    # 1. Classify intent
    route = chatbot_router.route(
        history=history_text,
        message=request.message
    )
    intent = route.get("intent", "general_guidance")
    role   = route.get("role")

    # 2. Load resume + job from Supabase (used for career_analysis)
    supabase = get_supabase_client()
    user_resp = supabase.table("user_data").select("*").eq("user_id", current_user.id).execute()
    
    resume = ""
    job = ""
    if user_resp.data:
        resume = user_resp.data[0].get("resume_text") or ""
        job    = user_resp.data[0].get("job_description") or ""

    # 3. Generate real answer
    try:
        reply = chatbot_router.respond(
            intent=intent,
            role=role,
            message=request.message,
            resume=resume,
            job=job
        )
    except Exception as e:
        logger.error(f"Chat respond error: {e}")
        reply = "I encountered an issue processing that. Could you rephrase your question?"

    save_chat_message(session_id, "assistant", reply)

    # 4. Stream word by word
    def stream_text(text: str):
        for word in text.split():
            yield word + " "

    return StreamingResponse(
        stream_text(reply),
        media_type="text/plain",
        headers={"X-Session-ID": session_id}
    )

# ============================================
# CLEANUP
# ============================================

@app.delete("/clear_data")
def clear_data(current_user: User = Depends(get_current_user)):
    supabase = get_supabase_client()
    supabase.table("user_data").delete().eq("user_id", current_user.id).execute()
    CHAT_MEMORY.clear()
    return {"message": "All stored data cleared for the current user"}

# ============================================
# RUN
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
