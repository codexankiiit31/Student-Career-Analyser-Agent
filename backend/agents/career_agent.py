# ==================== career_agent.py ====================
"""Career Agent - RAG pipeline using Gemini API"""

import os
from typing import Dict, List
from langchain.schema import Document
from utils.career_retriever import CareerRetriever
from utils.llm_utils import get_llm, get_settings

from agents.career_scraper import CareerScraper


class RoadmapAgent:
    """RAG-powered Career Agent using Gemini API."""

    def __init__(self):
        # Load settings and initialize components
        self.settings = get_settings()
        self.llm = get_llm()
        self.retriever = CareerRetriever()
        self.scraper = CareerScraper()
        self.prompt_template = self._load_prompt_template()

    # ---------- PROMPT ----------
    def _load_prompt_template(self) -> str:
        """Load prompt template from file, or use fallback."""
        prompt_path = "prompts/career_prompt.txt"

        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()

        # Fallback prompt if no file exists
        return """You are an expert career mentor. Create a detailed week-by-week learning roadmap.

Context: {context}
Query: {query}

Generate a structured roadmap with weekly tasks, YouTube videos, projects, and course recommendations."""

    # ---------- CAREER EXTRACTION ----------
    def _extract_career_name(self, query: str) -> str:
        """Extract probable career name from user query."""
        query_lower = query.lower()

        career_keywords = {
            "full stack": ["full stack", "fullstack", "full-stack"],
            "frontend": ["frontend", "front-end", "front end"],
            "backend": ["backend", "back-end", "back end"],
            "data science": ["data science", "data scientist"],
            "machine learning": ["machine learning", "ml engineer", "ai engineer"],
            "devops": ["devops", "dev ops"],
            "android": ["android"],
            "ios": ["ios", "swift"],
            "python": ["python developer"],
            "java": ["java developer"],
            "react": ["react developer", "reactjs"],
            "nodejs": ["nodejs", "node.js", "node js"],
            "cyber security": ["cyber security", "cybersecurity", "security"],
            "blockchain": ["blockchain", "web3"],
        }

        for career, keywords in career_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                return career

        return "full stack"

    # ---------- INDEX BUILDER ----------
    def _get_or_create_index(self, career: str) -> bool:
        """Load or build FAISS index for given career."""
        if self.retriever.load_index(career):
            return True

        print(f"🔄 Building new index for: {career}")
        scraped_data = self.scraper.scrape_all_sources(career)
        self.scraper.save_scraped_data(career, scraped_data)
        self.retriever.build_index(career)
        self.retriever.save_index(career)

        return True

    # ---------- CONTEXT FORMATTER ----------
    def _format_context(self, documents: List[Document]) -> str:
        """Format retrieved documents into readable text."""
        context_parts = []
        for i, doc in enumerate(documents, 1):
            context_parts.append(f"--- Document {i} ---")
            context_parts.append(doc.page_content)
            context_parts.append("")
        return "\n".join(context_parts)

    # ---------- MAIN LOGIC ----------
    def generate_roadmap(self, query: str) -> Dict:
        """Generate a detailed learning roadmap for a given career query."""
        try:
            career = self._extract_career_name(query)
            print(f"🎯 Detected career: {career}")

            # Ensure FAISS index is ready
            self._get_or_create_index(career)

            # Retrieve relevant documents
            print("🔍 Retrieving relevant information...")
            relevant_docs = self.retriever.retrieve(query, k=self.settings["TOP_K_RESULTS"])

            if not relevant_docs:
                return {
                    "success": False,
                    "error": "No relevant information found. Please try a different query.",
                }

            # Prepare the final prompt
            context = self._format_context(relevant_docs)
            final_prompt = self.prompt_template.format(context=context, query=query)

            # Generate roadmap using LLM
            print("🤖 Generating roadmap with Gemini...")
            response = self.llm.invoke(final_prompt)

            # Search YouTube for additional resources
            youtube_videos = self.scraper.search_youtube_videos(
                f"{career} roadmap tutorial",
                max_results=self.settings["MAX_YOUTUBE_RESULTS"],
            )

            return {
                "success": True,
                "career": career,
                "roadmap": response.content if hasattr(response, "content") else str(response),
                "additional_videos": youtube_videos,
                "sources_used": len(relevant_docs),
            }

        except Exception as e:
            print(f"❌ Error generating roadmap: {e}")
            return {"success": False, "error": str(e)}

    # ---------- QUICK TIPS ----------
    def get_quick_tips(self, career: str) -> List[str]:
        """Generate quick actionable tips for a specific career."""
        tips_prompt = f"""Provide 5 quick, actionable tips for someone starting a career in {career}. 
        Keep each tip one sentence long, specific, and practical."""

        try:
            response = self.llm.invoke(tips_prompt)
            tips_text = response.content if hasattr(response, "content") else str(response)
            tips = [tip.strip() for tip in tips_text.split("\n") if tip.strip()]
            return tips
        except Exception as e:
            print(f"⚠️ Error getting tips: {e}")
            return []


# ---------- TEST RUN ----------
if __name__ == "__main__":
    agent = RoadmapAgent()
    query = "I want to become a data scientist"
    result = agent.generate_roadmap(query)
    print(result)
