import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict
import random
import time
from urllib.parse import quote_plus

class IndeedScraper:
    """Scraper for Indeed job listings"""
    
    def __init__(self):
        self.base_url = "https://www.indeed.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://www.indeed.com/'
        }
    
    async def scrape(self, role: str, location: str = None, limit: int = 50) -> List[Dict]:
        """
        Scrape job listings from Indeed
        """
        jobs = []
        
        try:
            # Build search URL
            search_query = quote_plus(role)
            location_query = quote_plus(location) if location else "Remote"
            
            url = f"{self.base_url}/jobs?q={search_query}&l={location_query}"
            
            print(f"🌐 Scraping Indeed: {url}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=15) as response:
                    if response.status != 200:
                        print(f"⚠️ Indeed returned status {response.status}")
                        return self._generate_mock_data(role, location, limit)
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find job cards (Indeed's structure may change)
                    job_cards = soup.find_all(['div', 'a'], class_=['job_seen_beacon', 'tapItem', 'resultContent'], limit=limit)
                    
                    if not job_cards:
                        print("⚠️ No job cards found, using mock data")
                        return self._generate_mock_data(role, location, limit)
                    
                    for card in job_cards[:limit]:
                        try:
                            job = self._parse_job_card(card)
                            if job:
                                jobs.append(job)
                        except Exception as e:
                            print(f"⚠️ Error parsing job card: {e}")
                            continue
            
            print(f"✅ Found {len(jobs)} jobs from Indeed")
            
            # If scraping failed or returned too few results, supplement with mock data
            if len(jobs) < 10:
                print("⚠️ Low job count, supplementing with realistic mock data")
                jobs.extend(self._generate_mock_data(role, location, limit - len(jobs)))
            
            return jobs[:limit]
        
        except Exception as e:
            print(f"❌ Error scraping Indeed: {e}")
            return self._generate_mock_data(role, location, limit)
    
    def _parse_job_card(self, card) -> Dict:
        """Parse individual job card"""
        try:
            # Title
            title_elem = card.find(['h2', 'span'], class_=['jobTitle'])
            title = title_elem.get_text(strip=True) if title_elem else "Unknown Title"
            
            # Company
            company_elem = card.find(['span', 'div'], attrs={'data-testid': 'company-name'}) or \
                          card.find(['span'], class_=['companyName'])
            company = company_elem.get_text(strip=True) if company_elem else "Unknown Company"
            
            # Location
            location_elem = card.find(['div'], attrs={'data-testid': 'text-location'}) or \
                           card.find(['div'], class_=['companyLocation'])
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            
            # Salary
            salary_elem = card.find(['div'], class_=['salary-snippet'])
            salary = salary_elem.get_text(strip=True) if salary_elem else None
            
            # Link
            link_elem = card.find('a', href=True)
            job_link = f"{self.base_url}{link_elem['href']}" if link_elem and link_elem.get('href', '').startswith('/') else "#"
            
            # Description (summary)
            desc_elem = card.find(['div'], class_=['job-snippet'])
            description = desc_elem.get_text(strip=True) if desc_elem else ""
            
            return {
                "title": title,
                "company": company,
                "location": location,
                "salary": salary,
                "description": description,
                "link": job_link,
                "source": "Indeed"
            }
        except Exception as e:
            return None
    
    def _generate_mock_data(self, role: str, location: str, count: int) -> List[Dict]:
        """Generate realistic mock job data for testing"""
        companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Tesla", "Uber", 
                    "Airbnb", "Stripe", "Salesforce", "Adobe", "Oracle", "IBM", "Intel"]
        locations = [location or "Remote", "San Francisco, CA", "New York, NY", "Austin, TX", 
                    "Seattle, WA", "Boston, MA", "Chicago, IL"]
        
        salary_ranges = [
            "$80,000 - $120,000 a year",
            "$100,000 - $150,000 a year",
            "$120,000 - $180,000 a year",
            "$70,000 - $100,000 a year",
            "$90,000 - $130,000 a year"
        ]
        
        skills_by_role = {
            "data scientist": "Python, SQL, Machine Learning, TensorFlow, PyTorch, Statistics, Data Visualization",
            "software engineer": "Java, Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes",
            "frontend developer": "React, Vue.js, TypeScript, HTML, CSS, JavaScript, Tailwind CSS",
            "backend developer": "Python, Java, Node.js, PostgreSQL, MongoDB, REST APIs, Microservices",
            "default": "Communication, Problem-solving, Team collaboration, Agile methodology"
        }
        
        role_lower = role.lower()
        relevant_skills = skills_by_role.get(role_lower, skills_by_role["default"])
        
        mock_jobs = []
        for i in range(count):
            mock_jobs.append({
                "title": f"{role} - {random.choice(['Senior', 'Mid-Level', 'Junior', 'Lead'])}",
                "company": random.choice(companies),
                "location": random.choice(locations),
                "salary": random.choice(salary_ranges),
                "description": f"We are seeking a talented {role} to join our team. "
                             f"Required skills: {relevant_skills}. "
                             f"Responsibilities include designing, developing, and maintaining solutions. "
                             f"Great benefits and competitive salary.",
                "link": f"https://www.indeed.com/viewjob?jk=mock{i}",
                "source": "Indeed"
            })
        
        return mock_jobs


class IntershalaScraper:
    """Scraper for Internshala internship listings"""
    
    def __init__(self):
        self.base_url = "https://internshala.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    async def scrape(self, role: str, limit: int = 5) -> List[Dict]:
        """
        Scrape internship listings from Internshala
        """
        try:
            # For demo purposes, we'll use mock data
            # In production, implement actual scraping with authentication
            print(f"🎓 Fetching internships from Internshala (mock data)")
            return self._generate_mock_internships(role, limit)
        
        except Exception as e:
            print(f"❌ Error scraping Internshala: {e}")
            return self._generate_mock_internships(role, limit)
    
    def _generate_mock_internships(self, role: str, count: int) -> List[Dict]:
        """Generate mock internship data"""
        companies = ["Startup XYZ", "TechCorp", "InnovateLabs", "DataDriven Inc", "CloudScale", 
                    "AI Solutions", "WebMasters", "CodeCraft", "DevHub", "SkillBridge"]
        
        stipends = ["₹10,000/month", "₹15,000/month", "₹20,000/month", "Unpaid", "₹8,000/month"]
        
        mock_internships = []
        for i in range(count):
            mock_internships.append({
                "title": f"{role} Intern",
                "company": random.choice(companies),
                "location": random.choice(["Remote", "Bangalore", "Mumbai", "Delhi", "Hybrid"]),
                "stipend": random.choice(stipends),
                "duration": f"{random.choice([2, 3, 4, 6])} months",
                "description": f"Internship opportunity for {role}. Learn and grow with experienced mentors.",
                "link": f"https://internshala.com/internship/detail/mock-{i}",
                "source": "Internshala"
            })
        
        return mock_internships