import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_fixed, before_sleep_log

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableParallel, RunnableLambda

from utils.llm_utils import get_llm


# -------------------------------------------------
# Logging Setup
# -------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =================================================
# STRICT PYDANTIC OUTPUT SCHEMAS
# =================================================

# ----------- Resume & Job (Stage 1) -----------

class ResumeAnalysis(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    years_experience: str
    education: List[Dict[str, str]]
    key_achievements: List[str]
    core_competencies: List[str]
    industry_experience: List[str]
    leadership_experience: List[str]
    technologies_used: List[str]
    projects: List[str]


class JobAnalysis(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    years_experience: str
    education_requirements: List[str]
    key_responsibilities: List[str]
    company_culture: str
    certifications: List[str]
    industry_type: str
    job_level: str
    key_technologies: List[str]


# ----------- Unified Output (Stage 2) -----------

class MatchSummary(BaseModel):
    overall_match_percentage: int = Field(ge=0, le=100)
    ats_score: int = Field(ge=0, le=100)
    selection_probability: int = Field(ge=0, le=100)


class SkillItem(BaseModel):
    skill_name: str
    proficiency_level: str
    evidence: List[str]


class MissingSkill(BaseModel):
    skill_name: str
    priority: str  # High / Medium / Low
    suggestion: str


class SkillsGapAnalysis(BaseModel):
    technical_skills: str
    soft_skills: str


class MatchAnalysis(BaseModel):
    matching_skills: List[SkillItem]
    missing_skills: List[MissingSkill]
    skills_gap_analysis: SkillsGapAnalysis
    experience_match_analysis: str
    education_match_analysis: str
    key_strengths: List[str]
    areas_of_improvement: List[str]


class MissingKeywords(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    tools_technologies: List[str]
    certifications: List[str]


class KeywordDensity(BaseModel):
    keyword: str
    current_frequency: int
    recommended_frequency: int
    suggestion: str


class FormattingRec(BaseModel):
    issue: str
    section: str
    suggestion: str
    priority: str  # High / Medium / Low


class SectionOrg(BaseModel):
    current: str
    recommended: str
    reason: str


class ATSOptimization(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    missing_keywords: MissingKeywords
    keyword_density_issues: List[KeywordDensity]
    formatting_recommendations: List[FormattingRec]
    section_organization: List[SectionOrg]


class UnifiedAnalysis(BaseModel):
    summary: MatchSummary
    match_analysis: MatchAnalysis
    ats_optimization: ATSOptimization


# ----------- Cover Letter -----------

class CoverLetter(BaseModel):
    cover_letter: str
    word_count: int
    opening_hook: str
    call_to_action: str
    key_highlights: List[str]


# =================================================
# CAREER AGENT
# =================================================

class CareerAgent:
    """
    Unified AI Career Agent — LCEL based, strict Pydantic schemas, retry-safe.
    """

    RESUME_MAX_CHARS = 4000
    JOB_MAX_CHARS = 3000

    def __init__(self):
        self.llm = get_llm()
        self.prompts_dir = (
            Path(__file__).resolve().parent.parent / "prompts" / "job_anaylzer"
        )
        self._prompt_cache: dict[str, str] = {}
        logger.info("CareerAgent initialized")

    # ----------------------------------------------
    # Utilities
    # ----------------------------------------------
    def _load_prompt(self, name: str) -> str:
        if name in self._prompt_cache:
            return self._prompt_cache[name]
        file = self.prompts_dir / name
        if not file.exists():
            raise FileNotFoundError(f"Prompt not found: {file}")
        text = file.read_text(encoding="utf-8")
        self._prompt_cache[name] = text
        return text

    def _truncate(self, text: str, limit: int, label: str) -> str:
        if not text or not text.strip():
            raise ValueError(f"{label} cannot be empty")
        text = text.strip()
        if len(text) > limit:
            logger.warning(f"{label} truncated to {limit} characters")
        return text[:limit]

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_fixed(2),
        before_sleep=before_sleep_log(logger, logging.WARNING)
    )
    def _invoke(self, chain, payload: dict):
        return chain.invoke(payload)

    # ----------------------------------------------
    # Stage 1: Parallel Resume + Job Extraction
    # (used internally to feed Stage 2)
    # ----------------------------------------------
    def _analyze_resume_and_job(self, resume: str, job: str) -> dict:
        logger.info("Stage 1: Parallel resume & job extraction")

        resume_clean = self._truncate(resume, self.RESUME_MAX_CHARS, "Resume")
        job_clean = self._truncate(job, self.JOB_MAX_CHARS, "Job Description")

        resume_parser = PydanticOutputParser(pydantic_object=ResumeAnalysis)
        job_parser = PydanticOutputParser(pydantic_object=JobAnalysis)

        resume_prompt = PromptTemplate.from_template(
            self._load_prompt("resume_analysis_prompt.txt")
        ).partial(format_instructions=resume_parser.get_format_instructions())

        job_prompt = PromptTemplate.from_template(
            self._load_prompt("job_analysis_prompt.txt")
        ).partial(format_instructions=job_parser.get_format_instructions())

        parallel_chain = RunnableParallel({
            "resume": (
                RunnableLambda(lambda x: {"resume": x["resume"]})
                | resume_prompt
                | self.llm
                | resume_parser
            ),
            "job": (
                RunnableLambda(lambda x: {"description": x["description"]})
                | job_prompt
                | self.llm
                | job_parser
            )
        })

        return self._invoke(
            parallel_chain,
            {"resume": resume_clean, "description": job_clean}
        )

    # ----------------------------------------------
    # Stage 2: Unified ATS + Match Analysis
    # ----------------------------------------------
    def unified_analysis(self, resume: str, job: str) -> dict:
        logger.info("Stage 2: Unified ATS + match analysis")

        resume_clean = self._truncate(resume, self.RESUME_MAX_CHARS, "Resume")
        job_clean = self._truncate(job, self.JOB_MAX_CHARS, "Job Description")

        unified_parser = PydanticOutputParser(pydantic_object=UnifiedAnalysis)

        unified_prompt = PromptTemplate.from_template(
            self._load_prompt("unified_prompt.txt")
        ).partial(format_instructions=unified_parser.get_format_instructions())

        chain = unified_prompt | self.llm | unified_parser

        output: UnifiedAnalysis = self._invoke(
            chain,
            {
                "resume": resume_clean,
                "job": job_clean,
            }
        )

        return {
            "analysis": output.model_dump(),
            "resume_analysis": {},
            "job_analysis": {}
        }

    # ----------------------------------------------
    # Backward Compatibility
    # ----------------------------------------------
    def analyze_resume_job(
        self,
        resume: str,
        job: str,
        similarity: Optional[float] = None
    ) -> dict:
        """Legacy method — routes to unified_analysis()."""
        return self.unified_analysis(resume, job)

    # ----------------------------------------------
    # Cover Letter Generation
    # ----------------------------------------------
    def generate_cover_letter(self, resume: str, job: str) -> dict:
        logger.info("Generating cover letter")

        resume_clean = self._truncate(resume, self.RESUME_MAX_CHARS, "Resume")
        job_clean = self._truncate(job, self.JOB_MAX_CHARS, "Job Description")

        parser = PydanticOutputParser(pydantic_object=CoverLetter)

        prompt = PromptTemplate.from_template(
            self._load_prompt("cover_letter_generation_prompt.txt")
        ).partial(format_instructions=parser.get_format_instructions())

        chain = prompt | self.llm | parser

        result: CoverLetter = self._invoke(
            chain,
            {"resume": resume_clean, "job": job_clean}
        )

        return result.model_dump()


# -------------------------------------------------
# Local Test Entry
# -------------------------------------------------
if __name__ == "__main__":
    agent = CareerAgent()
    print("CareerAgent ready")
