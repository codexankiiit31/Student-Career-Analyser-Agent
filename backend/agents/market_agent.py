import os
import json
from datetime import datetime
from typing import Dict, List
import asyncio
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import pandas as pd
# from scraper import IndeedScraper, IntershalaScraper
from agents.scraper import IndeedScraper, IntershalaScraper
from agents.dataprocessing import DataCleaner, SkillExtractor, TrendAnalyzer
from utils.llm_utils import get_llm

class MarketAnalysisAgent:
    def __init__(self):
        """Initialize the Market Analysis Agent with LangChain and Groq"""
        self.llm = get_llm()
        # Initialize Groq LLM
       
        
        # Initialize components
        self.indeed_scraper = IndeedScraper()
        self.internshala_scraper = IntershalaScraper()
        self.data_cleaner = DataCleaner()
        self.skill_extractor = SkillExtractor()
        self.trend_analyzer = TrendAnalyzer()
        
        # Load prompt template
        self.prompt_template = self._load_prompt_template()
        
        # Create LangChain chain
        self.analysis_chain = LLMChain(
            llm=self.llm,
            prompt=self.prompt_template,
            verbose=True
        )
        
        print("✅ Market Analysis Agent initialized")
    
    def _load_prompt_template(self) -> PromptTemplate:
        """Load the LLM prompt template"""
        template = """You are an expert job market analyst. Analyze the following job market data and provide insights.

Job Role: {role}
Total Jobs Found: {total_jobs}
Salary Data: {salary_data}
Top Cities: {top_cities}
Skills Found: {skills_data}
Historical Trend: {trend_data}

Based on this data, provide a comprehensive market analysis in JSON format:

1. Market Summary:
   - Average salary range
   - Market demand level (High/Medium/Low)
   - Growth trend compared to historical data
   - Top 3-5 hiring cities

2. Skill Insights:
   - List 5-7 emerging skills (skills with high demand and recent growth)
   - List 3-5 declining skills (skills with decreasing mentions)
   - Provide reasoning for each classification

3. Market Recommendations:
   - Key skills to focus on
   - Market outlook (positive/neutral/negative)
   - Career advice for this role

Return ONLY valid JSON in this exact format:
{{
    "market_summary": {{
        "avg_salary": "string with range",
        "demand_level": "High/Medium/Low",
        "growth_trend": "percentage or description",
        "top_cities": ["city1", "city2", "city3"]
    }},
    "skill_insights": {{
        "emerging": ["skill1", "skill2", ...],
        "declining": ["skill1", "skill2", ...],
        "reasoning": "brief explanation"
    }},
    "recommendations": {{
        "focus_skills": ["skill1", "skill2", ...],
        "market_outlook": "positive/neutral/negative",
        "advice": "career guidance"
    }}
}}
"""
        return PromptTemplate(
            input_variables=["role", "total_jobs", "salary_data", "top_cities", "skills_data", "trend_data"],
            template=template
        )
    
    async def analyze_market(self, role: str, location: str = None, experience_level: str = "entry") -> Dict:
        """
        Main analysis pipeline
        """
        print(f"\n🚀 Starting market analysis for: {role}")
        
        # Step 1: Scrape data from Indeed
        print("📊 Step 1: Scraping Indeed...")
        indeed_jobs = await self.indeed_scraper.scrape(role, location, limit=50)
        
        # Step 2: Clean and process data
        print("🧹 Step 2: Cleaning data...")
        cleaned_data = self.data_cleaner.clean_job_data(indeed_jobs)
        
        # Step 3: Extract salary insights
        print("💰 Step 3: Analyzing salaries...")
        salary_insights = self.data_cleaner.analyze_salaries(cleaned_data)
        
        # Step 4: Extract top cities
        print("🌆 Step 4: Identifying top cities...")
        top_cities = self.data_cleaner.get_top_cities(cleaned_data, top_n=5)
        
        # Step 5: Extract skills
        print("🔍 Step 5: Extracting skills...")
        all_descriptions = " ".join([job.get("description", "") for job in cleaned_data])
        skills_data = self.skill_extractor.extract_skills(all_descriptions)
        
        # Step 6: Analyze trends
        print("📈 Step 6: Analyzing trends...")
        trend_data = self.trend_analyzer.analyze_trends(role, len(cleaned_data))
        
        # Step 7: Run LLM analysis
        print("🤖 Step 7: Running AI analysis...")
        llm_response = self.analysis_chain.run(
            role=role,
            total_jobs=len(cleaned_data),
            salary_data=json.dumps(salary_insights),
            top_cities=json.dumps(top_cities),
            skills_data=json.dumps(skills_data),
            trend_data=json.dumps(trend_data)
        )
        
        # Parse LLM response
        try:
            ai_insights = json.loads(llm_response.strip().replace("```json", "").replace("```", ""))
        except:
            # Fallback if LLM doesn't return valid JSON
            ai_insights = self._create_fallback_insights(salary_insights, top_cities, skills_data)
        
        # Step 8: Fetch live job opportunities
        print("🎯 Step 8: Fetching live opportunities...")
        live_jobs = await self._fetch_live_jobs(role, location, experience_level)
        
        # Step 9: Save to cache
        self.trend_analyzer.save_to_cache(role, len(cleaned_data))
        
        # Compile final response
        result = {
            "market_summary": {
                **ai_insights.get("market_summary", {}),
                "total_jobs_analyzed": len(cleaned_data)
            },
            "skill_insights": ai_insights.get("skill_insights", {}),
            "live_jobs": live_jobs,
            "recommendations": ai_insights.get("recommendations", {})
        }
        
        print("✅ Analysis complete!\n")
        return result
    
    async def _fetch_live_jobs(self, role: str, location: str, experience_level: str) -> List[Dict]:
        """Fetch 5-7 best job opportunities with apply links"""
        # Get from Indeed
        indeed_jobs = await self.indeed_scraper.scrape(role, location, limit=5)
        
        # Get from Internshala (internships)
        internshala_jobs = await self.internshala_scraper.scrape(role, limit=3)
        
        # Combine and format
        live_jobs = []
        
        for job in indeed_jobs[:5]:
            live_jobs.append({
                "title": job.get("title", "N/A"),
                "company": job.get("company", "N/A"),
                "location": job.get("location", "N/A"),
                "salary": job.get("salary", "Not specified"),
                "apply_link": job.get("link", "#"),
                "source": "Indeed"
            })
        
        for job in internshala_jobs[:2]:
            live_jobs.append({
                "title": job.get("title", "N/A"),
                "company": job.get("company", "N/A"),
                "location": job.get("location", "N/A"),
                "salary": job.get("stipend", "Not specified"),
                "apply_link": job.get("link", "#"),
                "source": "Internshala"
            })
        
        return live_jobs[:7]  # Return max 7 jobs
    
    def _create_fallback_insights(self, salary_insights, top_cities, skills_data) -> Dict:
        """Fallback insights if LLM fails"""
        return {
            "market_summary": {
                "avg_salary": salary_insights.get("average_range", "Data unavailable"),
                "demand_level": "Medium",
                "growth_trend": "Stable",
                "top_cities": top_cities
            },
            "skill_insights": {
                "emerging": skills_data[:5],
                "declining": [],
                "reasoning": "Analysis based on job posting frequency"
            },
            "recommendations": {
                "focus_skills": skills_data[:3],
                "market_outlook": "neutral",
                "advice": "Continue building skills in this domain"
            }
        }
    
    def is_ready(self) -> bool:
        """Check if agent is ready"""
        return self.llm is not None