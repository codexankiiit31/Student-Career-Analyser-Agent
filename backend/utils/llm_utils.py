# ==================== llm_utils.py ====================
"""LLM initialization and configuration utilities."""

from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


# ---------- LLM INITIALIZATION FUNCTIONS ----------

def get_llm(temperature: float = 0.1):
    """
    Initialize and return Google Gemini LLM.
    
    Args:
        temperature: Model temperature (default 0.1 for factual responses)
    
    Returns:
        ChatGoogleGenerativeAI instance
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-exp",
        temperature=temperature,
        google_api_key=api_key,
        convert_system_message_to_human=True
    )


def get_creative_llm():
    """
    Get LLM configured for creative tasks like cover letter generation.
    
    Returns:
        ChatGoogleGenerativeAI instance with higher temperature
    """
    return get_llm(temperature=0.7)


# ---------- SETTINGS HANDLER (REPLACING CLASS) ----------

def get_settings():
    """
    Load and return all configuration settings from environment variables or defaults.
    Returns a dictionary of all key settings.
    """
    settings = {
        # API Keys
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
        "YOUTUBE_API_KEY": os.getenv("YOUTUBE_API_KEY"),
        
        # Model Settings
        "GEMINI_MODEL": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        "EMBEDDING_MODEL": os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
        
        # Vector Store Settings
        "FAISS_INDEX_PATH": os.getenv("FAISS_INDEX_PATH", "database/faiss_index"),
        "RAW_DATA_PATH": os.getenv("RAW_DATA_PATH", "database/raw_scraped_data"),
        "CHUNK_SIZE": int(os.getenv("CHUNK_SIZE", 1000)),
        "CHUNK_OVERLAP": int(os.getenv("CHUNK_OVERLAP", 200)),
        
        # Retrieval Settings
        "TOP_K_RESULTS": int(os.getenv("TOP_K_RESULTS", 5)),
        
        # YouTube Settings
        "MAX_YOUTUBE_RESULTS": int(os.getenv("MAX_YOUTUBE_RESULTS", 3)),
        
        # Scraping Settings
        "REQUEST_TIMEOUT": int(os.getenv("REQUEST_TIMEOUT", 10)),
        "MAX_RETRIES": int(os.getenv("MAX_RETRIES", 3))
    }

    # Optional validation check
    if not settings["GEMINI_API_KEY"]:
        print("⚠️ Warning: GEMINI_API_KEY not found in environment variables.")
    if not settings["YOUTUBE_API_KEY"]:
        print("⚠️ Warning: YOUTUBE_API_KEY not found in environment variables.")

    return settings
