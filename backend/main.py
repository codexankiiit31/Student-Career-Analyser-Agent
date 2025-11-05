from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import json
import os
from pathlib import Path
from datetime import datetime

# Existing Career Agent imports
# from utils.process_utils import extract_and_clean_text
from utils.similarity_search import compute_similarity
from utils.response_formetter import format_match_response, format_ats_response, format_cover_letter, format_error_response,extract_and_clean_text
from agents.job_anayzer import CareerAgent

# Market Analysis imports
from agents.market_agent import MarketAnalysisAgent

# NEW: Career Roadmap imports
from agents.career_agent import RoadmapAgent

# ============================================
# APP INITIALIZATION
# ============================================

app = FastAPI(
    title="AI Career & Market Analysis Agent",
    version="3.0",
    description="Unified AI-powered career assistance: Resume matching, ATS optimization, live job market analysis, and career roadmaps"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# CONFIGURATION
# ============================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "database"
MEMORY_STORE_PATH = DATA_DIR / "memory_store.json"
CACHE_PATH = DATA_DIR / "cache.json"

# Ensure database directory exists
DATA_DIR.mkdir(exist_ok=True)

# ============================================
# INITIALIZE AGENTS
# ============================================

# Career Agent (Your existing system)
try:
    career_agent = CareerAgent()
    print("✅ CareerAgent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize CareerAgent: {e}")
    career_agent = None

# Market Analysis Agent
try:
    market_agent = MarketAnalysisAgent()
    print("✅ MarketAnalysisAgent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize MarketAnalysisAgent: {e}")
    market_agent = None

# Roadmap Agent
try:
    roadmap_agent = RoadmapAgent()
    print("✅ RoadmapAgent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize RoadmapAgent: {e}")
    roadmap_agent = None

# ============================================
# PYDANTIC MODELS
# ============================================

class MarketAnalysisRequest(BaseModel):
    role: str
    location: Optional[str] = None
    experience_level: Optional[str] = "entry"

class MarketAnalysisResponse(BaseModel):
    role: str
    market_summary: dict
    skill_insights: dict
    live_jobs: list
    timestamp: str
    status: str

#  Roadmap Models
class RoadmapRequest(BaseModel):
    query: str
    duration_months: Optional[int] = 3
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "Give me a roadmap to become a Full Stack Developer",
                "duration_months": 3
            }
        }

class VideoInfo(BaseModel):
    title: str
    url: str
    channel: str
    description: str

class RoadmapResponse(BaseModel):
    success: bool
    career: Optional[str] = None
    roadmap: Optional[str] = None
    additional_videos: Optional[List[VideoInfo]] = None
    sources_used: Optional[int] = None
    error: Optional[str] = None

class TipsRequest(BaseModel):
    career: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "career": "Data Science"
            }
        }

class TipsResponse(BaseModel):
    success: bool
    tips: Optional[List[str]] = None
    error: Optional[str] = None

# ============================================
# UTILITY FUNCTIONS
# ============================================

def load_memory() -> dict:
    """Load stored resume and job data from JSON file."""
    if not MEMORY_STORE_PATH.exists():
        return {"resume_text": "", "job_description": ""}
    
    try:
        with open(MEMORY_STORE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"resume_text": "", "job_description": ""}


def save_memory(data: dict) -> None:
    """Save resume and job data to JSON file."""
    with open(MEMORY_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ============================================
# ROOT & HEALTH ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Main API information endpoint."""
    return {
        "message": "🚀 AI Career & Market Analysis Agent v3.0",
        "status": "active",
        "version": "3.0",
        "systems": {
            "career_agent": "enabled" if career_agent else "disabled",
            "market_agent": "enabled" if market_agent else "disabled",
            "roadmap_agent": "enabled" if roadmap_agent else "disabled"
        },
        "endpoints": {
            "career_analysis": {
                "upload_resume": "/upload_resume",
                "analyze_job": "/analyze_job",
                "match_resume_job": "/match_resume_job",
                "ats_optimization": "/ats_optimization",
                "generate_cover_letter": "/generate_cover_letter"
            },
            "market_analysis": {
                "analyze_market": "/api/market_analysis",
                "get_cache": "/api/cache",
                "health": "/api/health"
            },
            "career_roadmap": {
                "get_roadmap": "/api/get_roadmap",
                "get_tips": "/api/get_tips"
            },
            "data_management": {
                "get_stored_data": "/get_stored_data",
                "clear_data": "/clear_data"
            }
        },
        "features": [
            "Deep resume-job matching",
            "ATS optimization",
            "Cover letter generation",
            "Live market salary analysis",
            "Skill trend insights",
            "Job opportunity recommendations",
            "Week-by-week career roadmaps",
            "YouTube learning resources",
            "Career tips and guidance"
        ]
    }


@app.get("/api/health")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents": {
            "career_agent_ready": career_agent is not None,
            "market_agent_ready": market_agent.is_ready() if market_agent else False,
            "roadmap_agent_ready": roadmap_agent is not None
        }
    }

# ============================================
# CAREER AGENT ENDPOINTS (Existing System)
# ============================================

@app.post("/upload_resume")
async def upload_resume(file: UploadFile):
    """
    Extract and clean text from uploaded resume (PDF/DOCX).
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["pdf", "docx"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload PDF or DOCX file."
            )
        
        # Extract text
        text = extract_and_clean_text(file)
        
        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from resume. Please check the file."
            )
        
        # Save to memory
        memory = load_memory()
        memory["resume_text"] = text
        memory["uploaded_filename"] = file.filename
        memory["upload_timestamp"] = datetime.now().isoformat()
        save_memory(memory)
        
        return {
            "message": "✅ Resume uploaded successfully!",
            "filename": file.filename,
            "resume_length": len(text),
            "word_count": len(text.split()),
            "character_count": len(text),
            "status": "ready_for_analysis"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


@app.post("/analyze_job")
async def analyze_job(job_description: str = Form(...)):
    """
    Store job description for matching and analysis.
    """
    try:
        if not job_description or len(job_description.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Job description is too short. Please provide a detailed description."
            )
        
        memory = load_memory()
        memory["job_description"] = job_description.strip()
        memory["job_analysis_timestamp"] = datetime.now().isoformat()
        save_memory(memory)
        
        return {
            "message": "✅ Job description analyzed successfully!",
            "description_length": len(job_description),
            "word_count": len(job_description.split()),
            "character_count": len(job_description),
            "status": "ready_for_matching"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing job: {str(e)}")


@app.get("/match_resume_job")
async def match_resume_job():
    """
    Match resume with job description using agentic multi-step analysis.
    """
    if not career_agent:
        raise HTTPException(status_code=500, detail="Career agent not initialized")
    
    try:
        memory = load_memory()
        resume = memory.get("resume_text", "")
        job = memory.get("job_description", "")
        
        if not resume:
            raise HTTPException(
                status_code=400, 
                detail="No resume uploaded. Please upload a resume first."
            )
        
        if not job:
            raise HTTPException(
                status_code=400, 
                detail="No job description provided. Please add a job description first."
            )
        
        print("🚀 Starting agentic match analysis...")
        
        # Calculate similarity using embeddings
        sim_score = compute_similarity(resume, job)
        print(f"📊 Embedding similarity score: {sim_score}%")
        
        # Get comprehensive AI analysis
        result = career_agent.match_resume_job(resume, job, sim_score)
        
        # Format response
        formatted_response = format_match_response(result, sim_score)
        
        print(f"✅ Match analysis complete!")
        return formatted_response
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in match analysis: {str(e)}")
        return format_error_response(str(e), "match_analysis")


@app.get("/ats_optimization")
async def ats_optimization():
    """
    Suggest comprehensive ATS improvements with structured recommendations.
    """
    if not career_agent:
        raise HTTPException(status_code=500, detail="Career agent not initialized")
    
    try:
        memory = load_memory()
        resume = memory.get("resume_text", "")
        job = memory.get("job_description", "")
        
        if not resume:
            raise HTTPException(
                status_code=400, 
                detail="No resume uploaded. Please upload a resume first."
            )
        
        if not job:
            raise HTTPException(
                status_code=400, 
                detail="No job description provided. Please add a job description first."
            )
        
        print("🚀 Starting ATS optimization analysis...")
        
        # Get comprehensive ATS analysis
        ats_result = career_agent.ats_optimization(resume, job)
        
        # Format response
        formatted_response = format_ats_response(ats_result)
        
        print(f"✅ ATS optimization complete!")
        return formatted_response
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in ATS optimization: {str(e)}")
        return format_error_response(str(e), "ats_optimization")


@app.get("/generate_cover_letter")
async def generate_cover_letter():
    """
    Generate a professional, tailored cover letter with metadata.
    """
    if not career_agent:
        raise HTTPException(status_code=500, detail="Career agent not initialized")
    
    try:
        memory = load_memory()
        resume = memory.get("resume_text", "")
        job = memory.get("job_description", "")
        
        if not resume:
            raise HTTPException(
                status_code=400, 
                detail="No resume uploaded. Please upload a resume first."
            )
        
        if not job:
            raise HTTPException(
                status_code=400, 
                detail="No job description provided. Please add a job description first."
            )
        
        print("🚀 Generating cover letter...")
        
        # Generate cover letter
        letter_result = career_agent.generate_cover_letter(resume, job)
        
        # Format response
        formatted_response = format_cover_letter(letter_result)
        
        print(f"✅ Cover letter generated!")
        return formatted_response
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating cover letter: {str(e)}")
        return format_error_response(str(e), "cover_letter")

# ============================================
# MARKET ANALYSIS ENDPOINTS (Existing System)
# ============================================

@app.post("/api/market_analysis", response_model=MarketAnalysisResponse)
async def analyze_market(request: MarketAnalysisRequest):
    """
    Analyze job market for a given role with live data.
    
    Returns salary trends, skill insights, and job opportunities.
    """
    if not market_agent:
        raise HTTPException(status_code=500, detail="Market analysis agent not initialized")
    
    try:
        print(f"🔍 Analyzing market for: {request.role}")
        
        # Run the market analysis agent
        result = await market_agent.analyze_market(
            role=request.role,
            location=request.location,
            experience_level=request.experience_level
        )
        
        return MarketAnalysisResponse(
            role=request.role,
            market_summary=result["market_summary"],
            skill_insights=result["skill_insights"],
            live_jobs=result["live_jobs"],
            timestamp=datetime.now().isoformat(),
            status="success"
        )
    
    except Exception as e:
        print(f"❌ Error in market analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/cache")
async def get_cache():
    """
    Get cached historical market data.
    """
    try:
        if not CACHE_PATH.exists():
            return {"status": "success", "data": {}, "message": "No cache found"}
        
        with open(CACHE_PATH, "r") as f:
            cache_data = json.load(f)
        return {"status": "success", "data": cache_data}
    except json.JSONDecodeError:
        return {"status": "success", "data": {}, "message": "Cache corrupted, returning empty"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/cache")
async def clear_cache():
    """
    Clear the market analysis cache.
    """
    try:
        with open(CACHE_PATH, "w") as f:
            json.dump({}, f)
        return {"status": "success", "message": "Cache cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# CAREER ROADMAP ENDPOINTS 
# ============================================

@app.post("/api/get_roadmap", response_model=RoadmapResponse)
async def get_roadmap(request: RoadmapRequest):
    """
    Generate a personalized career roadmap with week-by-week structure.
    
    Args:
        request: RoadmapRequest with career query and duration
    
    Returns:
        RoadmapResponse with structured roadmap, videos, and courses
    """
    if not roadmap_agent:
        raise HTTPException(status_code=500, detail="Roadmap agent not initialized")
    
    try:
        if not request.query or len(request.query.strip()) < 5:
            raise HTTPException(
                status_code=400,
                detail="Query must be at least 5 characters long"
            )
        
        print(f"🎯 Generating roadmap for: {request.query}")
        
        # Generate roadmap
        result = roadmap_agent.generate_roadmap(request.query)
        
        if not result['success']:
            raise HTTPException(
                status_code=500,
                detail=result.get('error', 'Failed to generate roadmap')
            )
        
        # Convert additional videos to VideoInfo models
        videos = [
            VideoInfo(**video) for video in result.get('additional_videos', [])
        ]
        
        print(f"✅ Roadmap generated successfully!")
        
        return RoadmapResponse(
            success=True,
            career=result.get('career'),
            roadmap=result.get('roadmap'),
            additional_videos=videos,
            sources_used=result.get('sources_used')
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating roadmap: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/get_tips", response_model=TipsResponse)
async def get_tips(request: TipsRequest):
    """
    Get quick career tips for a specific role.
    
    Args:
        request: TipsRequest with career name
    
    Returns:
        TipsResponse with list of actionable tips
    """
    if not roadmap_agent:
        raise HTTPException(status_code=500, detail="Roadmap agent not initialized")
    
    try:
        if not request.career or len(request.career.strip()) < 2:
            raise HTTPException(
                status_code=400,
                detail="Career name must be at least 2 characters long"
            )
        
        print(f"💡 Getting tips for: {request.career}")
        
        tips = roadmap_agent.get_quick_tips(request.career)
        
        return TipsResponse(
            success=True,
            tips=tips
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting tips: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# ============================================
# DATA MANAGEMENT ENDPOINTS
# ============================================

@app.get("/get_stored_data")
async def get_stored_data():
    """
    Retrieve currently stored resume and job description info.
    """
    try:
        memory = load_memory()
        resume = memory.get("resume_text", "")
        job = memory.get("job_description", "")
        
        return {
            "has_resume": bool(resume),
            "has_job_description": bool(job),
            "resume_word_count": len(resume.split()) if resume else 0,
            "job_word_count": len(job.split()) if job else 0,
            "uploaded_filename": memory.get("uploaded_filename", "N/A"),
            "upload_timestamp": memory.get("upload_timestamp", "N/A"),
            "job_analysis_timestamp": memory.get("job_analysis_timestamp", "N/A"),
            "status": "ready" if (resume and job) else "incomplete"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data: {str(e)}")


@app.delete("/clear_data")
async def clear_data():
    """Clear all stored resume and job data."""
    try:
        save_memory({"resume_text": "", "job_description": ""})
        return {
            "message": "✅ All career data cleared successfully!",
            "status": "empty"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing data: {str(e)}")


@app.delete("/clear_all")
async def clear_all():
    """Clear both career data and market cache."""
    try:
        # Clear career data
        save_memory({"resume_text": "", "job_description": ""})
        
        # Clear market cache
        with open(CACHE_PATH, "w") as f:
            json.dump({}, f)
        
        return {
            "message": "✅ All data cleared (career + market cache)!",
            "status": "empty"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing all data: {str(e)}")

# ============================================
# SERVER STARTUP
# ============================================

if __name__ == "__main__":
    print("="*60)
    print("🚀 Starting AI Career & Market Analysis Agent v3.0")
    print("="*60)
    print(f"✅ Career Agent: {'Ready' if career_agent else 'Not initialized'}")
    print(f"✅ Market Agent: {'Ready' if market_agent else 'Not initialized'}")
    print(f"✅ Roadmap Agent: {'Ready' if roadmap_agent else 'Not initialized'}")
    print("="*60)
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/api/health")
    print("="*60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)