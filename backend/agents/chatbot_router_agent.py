# agents/chatbot_router_agent.py
# Unified chatbot: routes intent then generates a REAL answer by calling the right agent.

import json
import re
import logging
from typing import Literal
from pathlib import Path

from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.runnables import RunnableLambda

from utils.llm_utils import get_llm

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────
# INTENT SCHEMA
# ──────────────────────────────────────────────────────

class ChatRoute(BaseModel):
    intent: Literal[
        "career_analysis",
        "market_analysis",
        "roadmap",
        "general_guidance",
        "greeting",
    ]
    role: str | None = None          # extracted role/career for market or roadmap
    explanation: str


# ──────────────────────────────────────────────────────
# ROUTER AGENT
# ──────────────────────────────────────────────────────

class ChatbotRouterAgent:
    def __init__(self):
        self.llm = get_llm()
        self.parser = PydanticOutputParser(pydantic_object=ChatRoute)

        # --- router prompt ---
        self.router_prompt = ChatPromptTemplate.from_template(
            Path("prompts/chatbot_router_prompt.txt").read_text(encoding="utf-8")
        )

        self.router_chain = (
            {
                "history": RunnableLambda(lambda x: x["history"]),
                "message": RunnableLambda(lambda x: x["message"]),
                "format_instructions": RunnableLambda(
                    lambda _: self.parser.get_format_instructions()
                ),
            }
            | self.router_prompt
            | self.llm
            | self.parser
        )

        # --- general Q&A prompt ---
        self.general_prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are a helpful AI Career Assistant. "
             "Answer career-related questions clearly and practically. "
             "Be concise (2-4 sentences). Do not refuse to help."),
            ("human", "{message}")
        ])
        self.general_chain = self.general_prompt | self.llm | StrOutputParser()

    # ──────────────────────────────────────────────────
    # ROUTE — classify intent
    # ──────────────────────────────────────────────────

    def route(self, history: str, message: str) -> dict:
        try:
            result = self.router_chain.invoke({
                "history": history,
                "message": message,
            })
            return result.model_dump()
        except Exception as e:
            logger.warning(f"Router parsing failed: {e}. Defaulting to general_guidance.")
            return {"intent": "general_guidance", "role": None, "explanation": str(e)}

    # ──────────────────────────────────────────────────
    # RESPOND — produce the actual answer for each intent
    # ──────────────────────────────────────────────────

    def respond(self, intent: str, role: str | None, message: str,
                resume: str = "", job: str = "") -> str:
        """
        Generate a real answer given the classified intent.
        Heavy agents (market, roadmap) are imported lazily to avoid circular imports.
        """

        if intent == "greeting":
            return (
                "👋 Hi! I'm your **AI Career Assistant**.\n\n"
                "I can help you with:\n"
                "- 📄 **Resume & ATS analysis** — optimize your resume for job descriptions\n"
                "- 📈 **Market insights** — salary ranges, demand, skill trends for any role\n"
                "- 🗺️ **Learning roadmaps** — week-by-week plans to reach your career goal\n"
                "- 💬 **Career Q&A** — any career question you have\n\n"
                "What would you like to explore today?"
            )

        if intent == "career_analysis":
            if resume and job:
                # Have both — run unified analysis
                try:
                    from agents.job_anayzer_agent import CareerAgent
                    agent = CareerAgent()
                    result = agent.unified_analysis(resume=resume, job=job)
                    summary = result.get("summary", {}) or result.get("analysis", {}).get("summary", {})
                    match_pct = summary.get("overall_match_percentage", "?")
                    ats = summary.get("ats_score", "?")
                    prob = summary.get("selection_probability", "?")
                    return (
                        f"✅ **Resume Analysis Complete!**\n\n"
                        f"- 🎯 Overall Match: **{match_pct}%**\n"
                        f"- 📊 ATS Score: **{ats}**\n"
                        f"- 🏆 Selection Probability: **{prob}%**\n\n"
                        "Head to the **Job Analyzer** tab to see the full breakdown with missing skills, "
                        "ATS recommendations, and your generated cover letter."
                    )
                except Exception as e:
                    logger.warning(f"Career agent failed in chat: {e}")
                    return (
                        "I can analyze your resume and job description for you. "
                        "Please go to the **Job Analyzer** tab, upload your resume, and paste the job description."
                    )
            else:
                return (
                    "📄 To analyze your resume, I need both your **resume** and the **job description**.\n\n"
                    "Please go to the **Job Analyzer** tab to:\n"
                    "1. Upload your resume\n"
                    "2. Paste the job description\n"
                    "3. Click 'Start Complete Analysis'\n\n"
                    "I'll then provide ATS score, skill gaps, and a tailored cover letter."
                )

        if intent == "market_analysis":
            career = role or self._extract_role(message)
            if career:
                try:
                    from agents.market_insights_agent import MarketInsightsAgent
                    agent = MarketInsightsAgent()
                    result = agent.analyze_market(role=career, location=None, experience_level="entry")
                    growth = result.get("career_growth", {})
                    salary = result.get("salary", {})
                    skills = result.get("skills", {})
                    core = ", ".join((skills.get("core") or [])[:4])
                    india_sal = salary.get("india", {}).get("average_range", "N/A")
                    demand = growth.get("current_demand", "N/A")
                    future = growth.get("future_scope", "N/A")
                    return (
                        f"📊 **Market Insights for {career}**\n\n"
                        f"- 💰 India Salary: **{india_sal}**\n"
                        f"- 🔥 Demand: **{demand}**\n"
                        f"- 🚀 Future Scope: **{future}**\n"
                        f"- 🛠️ Core Skills: {core}\n\n"
                        "Visit the **Market Analyzer** tab for the full report including global salary, "
                        "trending skills, and career advice."
                    )
                except Exception as e:
                    logger.warning(f"Market agent failed in chat: {e}")
                    return (
                        f"I'd love to give you market insights for **{career}**! "
                        "Head to the **Market Analyzer** tab and search for that role to see salary data, "
                        "demand levels, and skill trends."
                    )
            else:
                return (
                    "Which role would you like market insights for? "
                    "For example: *'What's the salary for a Data Scientist?'* "
                    "Or visit the **Market Analyzer** tab to explore any role."
                )

        if intent == "roadmap":
            career = role or self._extract_role(message)
            if career:
                try:
                    from agents.Roadmap_agent import RoadmapLLM
                    llm = RoadmapLLM(career)
                    data = llm.generate(f"Give me a 3-month roadmap to become a {career}")
                    weeks = data.get("weeks", [])
                    phases = data.get("phases", [])
                    phase_str = " → ".join(p["phase"] for p in phases) if phases else "Beginner → Intermediate → Advanced"
                    week_count = len(weeks)
                    first_few = [f"Week {w['week_number']}: {w['title']}" for w in weeks[:3]]
                    return (
                        f"🗺️ **Learning Roadmap for {career}**\n\n"
                        f"- 📅 Total: **{week_count} weeks**\n"
                        f"- 🔄 Phases: {phase_str}\n\n"
                        f"**First steps:**\n" +
                        "\n".join(f"  {i+1}. {w}" for i, w in enumerate(first_few)) +
                        "\n\n...and more! Visit the **Roadmap** tab to see the full interactive plan with mini-projects and resources."
                    )
                except Exception as e:
                    logger.warning(f"Roadmap agent failed in chat: {e}")
                    return (
                        f"I can build a full roadmap for **{career}**! "
                        "Head to the **Roadmap** tab, enter the role and duration, and I'll generate "
                        "a week-by-week interactive learning plan."
                    )
            else:
                return (
                    "Which career role would you like a roadmap for? "
                    "For example: *'Give me a roadmap to become a Machine Learning Engineer'*. "
                    "Or visit the **Roadmap** tab directly."
                )

        # general_guidance fallback — use the LLM to answer
        try:
            return self.general_chain.invoke({"message": message})
        except Exception as e:
            logger.warning(f"General chain failed: {e}")
            return (
                "I'm here to help with career guidance! Ask me about resume tips, "
                "skills to learn, job market trends, or anything career-related."
            )

    # ──────────────────────────────────────────────────
    # HELPERS
    # ──────────────────────────────────────────────────

    def _extract_role(self, message: str) -> str | None:
        """Very light role extraction from message."""
        # Common patterns: "become a X", "for X", "as a X", "about X"
        patterns = [
            r"become\s+(?:a|an)\s+([A-Za-z\s]+?)(?:\?|$|,|\.)",
            r"for\s+(?:a|an)\s+([A-Za-z\s]+?)(?:\?|$|,|\.)",
            r"about\s+([A-Za-z\s]+?)(?:\?|$|,|\.)",
            r"(?:salary|roadmap|market|skills?)\s+(?:for|of)\s+([A-Za-z\s]+?)(?:\?|$|,|\.)",
        ]
        for pat in patterns:
            m = re.search(pat, message, re.IGNORECASE)
            if m:
                role = m.group(1).strip()
                if 2 < len(role) < 50:
                    return role
        return None
