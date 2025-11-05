import re
import json
import os
from datetime import datetime
from typing import List, Dict, Tuple
from collections import Counter
import pandas as pd

class DataCleaner:
    """Clean and process job data"""
    
    def clean_job_data(self, jobs: List[Dict]) -> List[Dict]:
        """Clean and normalize job data"""
        cleaned = []
        for job in jobs:
            cleaned_job = {
                "title": self._clean_text(job.get("title", "")),
                "company": self._clean_text(job.get("company", "")),
                "location": self._clean_location(job.get("location", "")),
                "salary": self._parse_salary(job.get("salary")),
                "description": self._clean_text(job.get("description", "")),
                "link": job.get("link", "#"),
                "source": job.get("source", "Unknown")
            }
            cleaned.append(cleaned_job)
        return cleaned
    
    def _clean_text(self, text: str) -> str:
        """Remove extra whitespace and special characters"""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text
    
    def _clean_location(self, location: str) -> str:
        """Standardize location format"""
        if not location:
            return "Remote"
        location = self._clean_text(location)
        # Remove common suffixes
        location = re.sub(r'\s+\d{5}$', '', location)  # Remove ZIP codes
        return location
    
    def _parse_salary(self, salary_str: str) -> Dict:
        """
        Parse salary string into structured format
        Examples: "$80,000 - $120,000 a year", "₹10,000/month"
        """
        if not salary_str:
            return {"min": None, "max": None, "currency": "USD", "period": "year"}
        
        # Remove commas
        salary_str = salary_str.replace(",", "")
        
        # Detect currency
        currency = "USD"
        if "₹" in salary_str:
            currency = "INR"
        elif "€" in salary_str:
            currency = "EUR"
        elif "£" in salary_str:
            currency = "GBP"
        
        # Detect period
        period = "year"
        if "month" in salary_str.lower():
            period = "month"
        elif "hour" in salary_str.lower():
            period = "hour"
        
        # Extract numbers
        numbers = re.findall(r'[\d.]+', salary_str)
        
        if len(numbers) >= 2:
            return {
                "min": float(numbers[0]),
                "max": float(numbers[1]),
                "currency": currency,
                "period": period
            }
        elif len(numbers) == 1:
            return {
                "min": float(numbers[0]),
                "max": float(numbers[0]),
                "currency": currency,
                "period": period
            }
        
        return {"min": None, "max": None, "currency": currency, "period": period}
    
    def analyze_salaries(self, jobs: List[Dict]) -> Dict:
        """Calculate salary statistics"""
        salaries = []
        
        for job in jobs:
            salary_data = job.get("salary", {})
            if salary_data.get("min") and salary_data.get("max"):
                avg = (salary_data["min"] + salary_data["max"]) / 2
                salaries.append({
                    "avg": avg,
                    "currency": salary_data["currency"],
                    "period": salary_data["period"]
                })
        
        if not salaries:
            return {
                "average_range": "Data not available",
                "min_salary": None,
                "max_salary": None,
                "median_salary": None
            }
        
        # Filter by most common currency and period
        if salaries:
            most_common_currency = max(set([s["currency"] for s in salaries]), 
                                      key=[s["currency"] for s in salaries].count)
            most_common_period = max(set([s["period"] for s in salaries]), 
                                    key=[s["period"] for s in salaries].count)
            
            filtered = [s["avg"] for s in salaries 
                       if s["currency"] == most_common_currency 
                       and s["period"] == most_common_period]
            
            if filtered:
                currency_symbol = "$" if most_common_currency == "USD" else most_common_currency
                return {
                    "average_range": f"{currency_symbol}{int(min(filtered)):,} - {currency_symbol}{int(max(filtered)):,} per {most_common_period}",
                    "min_salary": min(filtered),
                    "max_salary": max(filtered),
                    "median_salary": sorted(filtered)[len(filtered)//2],
                    "currency": most_common_currency,
                    "period": most_common_period
                }
        
        return {
            "average_range": "Data not available",
            "min_salary": None,
            "max_salary": None,
            "median_salary": None
        }
    
    def get_top_cities(self, jobs: List[Dict], top_n: int = 5) -> List[str]:
        """Get top N cities with most job postings"""
        locations = [job["location"] for job in jobs if job.get("location")]
        
        if not locations:
            return ["Remote", "San Francisco, CA", "New York, NY"]
        
        # Count occurrences
        location_counts = Counter(locations)
        top_cities = [city for city, count in location_counts.most_common(top_n)]
        
        return top_cities


class SkillExtractor:
    """Extract and analyze skills from job descriptions"""
    
    def __init__(self):
        # Comprehensive skill database
        self.tech_skills = {
            # Programming Languages
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php", 
            "swift", "kotlin", "go", "rust", "scala", "r",
            
            # Web Technologies
            "react", "angular", "vue.js", "vue", "node.js", "express", "django", "flask",
            "html", "css", "sass", "tailwind", "bootstrap", "jquery",
            
            # Data & AI
            "sql", "nosql", "mongodb", "postgresql", "mysql", "redis",
            "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
            "pandas", "numpy", "scikit-learn", "opencv",
            
            # Cloud & DevOps
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform",
            "ci/cd", "git", "github", "gitlab",
            
            # Mobile
            "ios", "android", "react native", "flutter",
            
            # Others
            "agile", "scrum", "rest api", "graphql", "microservices",
            "data visualization", "tableau", "power bi"
        }
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        if not text:
            return []
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.tech_skills:
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(skill.title())
        
        # Count frequency
        skill_counts = Counter(found_skills)
        
        # Return top skills
        return [skill for skill, count in skill_counts.most_common(20)]
    
    def categorize_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorize skills into emerging vs declining"""
        # This is a simplified version - in production, use historical data
        emerging_keywords = ["ai", "machine learning", "kubernetes", "react", "typescript", 
                           "cloud", "devops", "microservices"]
        
        emerging = []
        stable = []
        
        for skill in skills[:15]:
            skill_lower = skill.lower()
            if any(keyword in skill_lower for keyword in emerging_keywords):
                emerging.append(skill)
            else:
                stable.append(skill)
        
        return {
            "emerging": emerging[:7],
            "stable": stable[:5]
        }


class TrendAnalyzer:
    """Analyze market trends using historical data"""
    
    def __init__(self):
        self.cache_file = "database/cache.json"
        self._ensure_cache_exists()
    
    def _ensure_cache_exists(self):
        """Create cache file and directory if they don't exist"""
        os.makedirs("database", exist_ok=True)
        if not os.path.exists(self.cache_file):
            with open(self.cache_file, "w") as f:
                json.dump({}, f)
    
    def analyze_trends(self, role: str, current_job_count: int) -> Dict:
        """Analyze job market trends"""
        try:
            with open(self.cache_file, "r") as f:
                cache = json.load(f)
            
            role_key = role.lower().replace(" ", "_")
            
            if role_key in cache:
                historical = cache[role_key]
                previous_count = historical.get("job_count", 0)
                previous_date = historical.get("last_scrape_date", "")
                
                if previous_count > 0:
                    change_percent = ((current_job_count - previous_count) / previous_count) * 100
                    
                    if change_percent > 10:
                        trend = f"+{change_percent:.1f}% increase from previous analysis"
                        sentiment = "Growing"
                    elif change_percent < -10:
                        trend = f"{change_percent:.1f}% decrease from previous analysis"
                        sentiment = "Declining"
                    else:
                        trend = "Stable market demand"
                        sentiment = "Stable"
                    
                    return {
                        "trend_description": trend,
                        "sentiment": sentiment,
                        "previous_count": previous_count,
                        "current_count": current_job_count,
                        "last_analyzed": previous_date
                    }
            
            return {
                "trend_description": "First analysis - no historical data available",
                "sentiment": "New",
                "previous_count": 0,
                "current_count": current_job_count,
                "last_analyzed": None
            }
        
        except Exception as e:
            print(f"Error analyzing trends: {e}")
            return {
                "trend_description": "Unable to analyze trends",
                "sentiment": "Unknown",
                "previous_count": 0,
                "current_count": current_job_count,
                "last_analyzed": None
            }
    
    def save_to_cache(self, role: str, job_count: int):
        """Save current data to cache"""
        try:
            with open(self.cache_file, "r") as f:
                cache = json.load(f)
            
            role_key = role.lower().replace(" ", "_")
            cache[role_key] = {
                "job_count": job_count,
                "last_scrape_date": datetime.now().isoformat()
            }
            
            with open(self.cache_file, "w") as f:
                json.dump(cache, f, indent=2)
            
            print(f"✅ Saved trends to cache for: {role}")
        
        except Exception as e:
            print(f"❌ Error saving to cache: {e}")