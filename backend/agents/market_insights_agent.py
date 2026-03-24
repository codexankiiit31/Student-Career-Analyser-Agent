from pathlib import Path
from typing import Dict, Any, List

from pydantic import BaseModel
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from utils.llm_utils import get_llm_groq
from scraping.market_insights_scraping import scrape_market_data
from utils.ws_logger import send_log


# =================================================
# 1️⃣ OUTPUT SCHEMA
# =================================================

class Skills(BaseModel):
    core: List[str]
    tools: List[str]
    nice_to_have: List[str]


class CareerGrowth(BaseModel):
    current_demand: str
    demand_summary: str
    future_scope: str
    future_summary: str


class SalaryLevel(BaseModel):
    average_range: str
    description: str


class Salary(BaseModel):
    india: SalaryLevel
    abroad: SalaryLevel
    salary_summary: str


class CareerMarketOutput(BaseModel):
    career: str
    skills: Skills
    declining_skills: List[str]
    career_growth: CareerGrowth
    salary: Salary
    summary_advice: str


# =================================================
# 2️⃣ MARKET ANALYSIS AGENT (CLASS BASED)
# =================================================

class MarketAnalysisAgent:
    """
    Stateful Market Analysis Agent
    Initialized once, runs per request
    """

    def __init__(self):
        self._load_prompt()
        self._init_llm()
        self._init_chain()

    # -----------------------------
    # Setup helpers
    # -----------------------------
    def _load_prompt(self):
        prompt_path = Path("prompts/market_prompts.txt")
        if not prompt_path.exists():
            raise FileNotFoundError("market_prompts.txt not found")

        self.prompt_text = prompt_path.read_text(encoding="utf-8")

    def _init_llm(self):
        self.llm = get_llm_groq(temperature=0.2)

    def _init_chain(self):
        self.parser = PydanticOutputParser(
            pydantic_object=CareerMarketOutput
        )

        self.prompt = PromptTemplate(
            template=self.prompt_text,
            input_variables=["career", "raw_text"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            }
        )

        self.chain = self.prompt | self.llm | self.parser

    # =================================================
    # PUBLIC METHOD (CALLED FROM API)
    # =================================================

    def analyze_market(
        self,
        role: str,
        location: str | None = None,
        experience_level: str = "entry"
    ) -> Dict[str, Any]:

        if not role or not role.strip():
            raise ValueError("Role cannot be empty")

        # -----------------------------
        # Scrape market data
        # -----------------------------
        raw_text, sources = scrape_market_data(role)

        if not raw_text or not raw_text.strip():
            raw_text = (
                f"General market information about {role}, "
                "including skills, salary, demand, and future scope."
            )

        # Hard limit
        raw_text = raw_text[:8000]

        print(
            f"📊 Market Analysis | Role: {role} | "
            f"Sources: {len(sources)} | Chars: {len(raw_text)}"
        )

        # -----------------------------
        # Run LLM
        # -----------------------------
        try:
            send_log(f"🧠 Synthesizing {len(sources)} sources into comprehensive Market Report...")
            result = self.chain.invoke(
                {
                    "career": role,
                    "raw_text": raw_text
                }
            )
            output = result.model_dump()

        except Exception as e:
            print(f"❌ Market agent failed: {e}")
            output = self._fallback(role)

        output["sources"] = sources
        output["location"] = location
        output["experience_level"] = experience_level

        return output

    # -----------------------------
    # Fallback
    # -----------------------------
    def _fallback(self, role: str) -> Dict[str, Any]:
        return CareerMarketOutput(
            career=role,
            skills=Skills(core=[], tools=[], nice_to_have=[]),
            declining_skills=[],
            career_growth=CareerGrowth(
                current_demand="Not available",
                demand_summary="Not available",
                future_scope="Not available",
                future_summary="Not available"
            ),
            salary=Salary(
                india=SalaryLevel(
                    average_range="Not available",
                    description="Not available"
                ),
                abroad=SalaryLevel(
                    average_range="Not available",
                    description="Not available"
                ),
                salary_summary="Not available"
            ),
            summary_advice="Not available"
        ).model_dump()
# =================================================
