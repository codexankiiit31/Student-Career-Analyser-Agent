from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path
from datetime import datetime
import json
import uuid
import uvicorn
import logging

logger = logging.getLogger(__name__)

# ============================================
# AGENTS
# ============================================

from agents.job_anayzer_agent import CareerAgent
from agents.market_insights_agent import MarketAnalysisAgent
from agents.Roadmap_agent import RoadmapLLM
from agents.chatbot_router_agent import ChatbotRouterAgent

from utils.similarity_search import compute_similarity
from utils.response_formetter import (
    extract_and_clean_text,
    format_cover_letter,
    format_error_response
)

# ============================================
# APP INIT
# ============================================

app = FastAPI(
    title="AI Career Intelligence Platform",
    version="4.0",
    description="Chat-based AI career assistant with routing, memory, and multi-agent execution"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# FILE STORAGE (RESUME / JOB)
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "database"
DATA_DIR.mkdir(exist_ok=True)

MEMORY_PATH = DATA_DIR / "memory_store.json"

def load_memory():
    if not MEMORY_PATH.exists():
        return {}
    return json.loads(MEMORY_PATH.read_text(encoding="utf-8"))

def save_memory(data: dict):
    MEMORY_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

# ============================================
# CHAT MEMORY (PER SESSION)
# ============================================

CHAT_MEMORY = {}

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

# ============================================
# INIT AGENTS
# ============================================

career_agent = CareerAgent()
market_agent = MarketAnalysisAgent()
chatbot_router = ChatbotRouterAgent()

# ============================================
# MODELS
# ============================================

class MarketRequest(BaseModel):
    role: str
    location: Optional[str] = None
    experience_level: Optional[str] = "entry"

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
            "chat_router": True
        }
    }

# ============================================
# RESUME FLOW
# ============================================

@app.post("/upload_resume")
async def upload_resume(file: UploadFile):
    if not file.filename:
        raise HTTPException(400, "Invalid file")

    text = extract_and_clean_text(file)

    if len(text.strip()) < 50:
        raise HTTPException(400, "Resume text too short")

    memory = load_memory()
    memory["resume"] = text
    memory["resume_uploaded_at"] = datetime.now().isoformat()
    save_memory(memory)

    return {"message": "Resume uploaded successfully"}

@app.post("/analyze_job")
async def analyze_job(job_description: str = Form(...)):
    memory = load_memory()
    memory["job"] = job_description.strip()
    memory["job_uploaded_at"] = datetime.now().isoformat()
    save_memory(memory)

    return {"message": "Job description saved"}

@app.get("/analyze_resume")
def analyze_resume():
    memory = load_memory()

    resume = memory.get("resume")
    job = memory.get("job")

    if not resume or not job:
        raise HTTPException(400, "Resume or Job missing")

    try:
        result = career_agent.unified_analysis(resume=resume, job=job)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        return format_error_response(str(e), "resume_analysis")

@app.get("/generate_cover_letter")
def generate_cover_letter():
    memory = load_memory()

    resume = memory.get("resume")
    job = memory.get("job")

    if not resume or not job:
        raise HTTPException(400, "Resume or Job missing")

    try:
        result = career_agent.generate_cover_letter(resume, job)
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
def market_analysis(request: MarketRequest):
    try:
        result = market_agent.analyze_market(
            role=request.role,
            location=request.location,
            experience_level=request.experience_level
        )
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "data": result
        }
    except Exception as e:
        raise HTTPException(500, str(e))

# ============================================
# ROADMAP (RAG)
# ============================================

@app.post("/api/get_roadmap")
def get_roadmap(request: RoadmapRequest):
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
def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    session_id = request.session_id or str(uuid.uuid4())
    history = get_chat_history(session_id)
    history_text = format_chat_history(history)

    save_chat_message(session_id, "user", request.message)

    # 1. Classify intent
    route = chatbot_router.route(
        history=history_text,
        message=request.message
    )
    intent = route.get("intent", "general_guidance")
    role   = route.get("role")

    # 2. Load resume + job from memory (used for career_analysis)
    memory = load_memory()
    resume = memory.get("resume", "")
    job    = memory.get("job", "")

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
def clear_data():
    save_memory({})
    CHAT_MEMORY.clear()
    return {"message": "All stored data cleared"}

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
