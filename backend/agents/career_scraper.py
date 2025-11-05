# ==================== career_scraper.py ====================
"""Career Scraper — Fetches latest career roadmap and learning data"""

import os
import time
from typing import List, Dict
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from googleapiclient.discovery import build

from utils.llm_utils import get_settings

# Load settings from .env via llm_utils
settings = get_settings()


class CareerScraper:
    """Handles scraping data from multiple career learning platforms"""

    def __init__(self):
        """Initialize HTTP headers and YouTube API client"""
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

        # Initialize YouTube API client
        self.youtube = build(
            "youtube",
            "v3",
            developerKey=settings["YOUTUBE_API_KEY"]
        )

    def scrape_roadmap_sh(self, career: str) -> str:
        """Scrape roadmap.sh for structured career paths"""
        try:
            roadmap_map = {
                "full stack": "full-stack",
                "frontend": "frontend",
                "backend": "backend",
                "devops": "devops",
                "data science": "data-scientist",
                "machine learning": "ml-engineer",
                "android": "android",
                "ios": "ios",
                "python": "python",
                "java": "java",
                "react": "react",
                "nodejs": "nodejs",
                "cyber security": "cyber-security",
                "blockchain": "blockchain",
            }

            slug = roadmap_map.get(career.lower(), "full-stack")
            url = f"https://roadmap.sh/{slug}"

            response = requests.get(url, headers=self.headers, timeout=settings["REQUEST_TIMEOUT"])
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            content = []
            title = soup.find("h1")
            if title:
                content.append(f"# {title.get_text(strip=True)}")

            description = soup.find("meta", {"name": "description"})
            if description:
                content.append(description.get("content", ""))

            for tag in soup.find_all(["p", "h2", "h3", "li"])[:50]:
                text = tag.get_text(strip=True)
                if len(text) > 20:
                    content.append(text)

            return "\n".join(content)

        except Exception as e:
            print(f"Error scraping roadmap.sh: {e}")
            return f"Roadmap for {career} development path."

    def scrape_geeksforgeeks(self, career: str) -> str:
        """Scrape GeeksforGeeks for career guides"""
        try:
            url = f"https://www.geeksforgeeks.org/{career.replace(' ', '-')}-roadmap/"
            response = requests.get(url, headers=self.headers, timeout=settings["REQUEST_TIMEOUT"])
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")
            article = soup.find("div", class_="text")

            content = []
            if article:
                for tag in article.find_all(["p", "h2", "h3", "li"])[:40]:
                    text = tag.get_text(strip=True)
                    if len(text) > 20:
                        content.append(text)

            return "\n".join(content) if content else f"Guide for {career} career path."

        except Exception as e:
            print(f"Error scraping GeeksforGeeks: {e}")
            return f"Technical guide for {career}."

    def scrape_freecodecamp(self, career: str) -> str:
        """Scrape FreeCodeCamp for resources and learning paths"""
        try:
            url = f"https://www.freecodecamp.org/news/search/?query={career.replace(' ', '%20')}"
            response = requests.get(url, headers=self.headers, timeout=settings["REQUEST_TIMEOUT"])
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")
            content = []

            for article in soup.find_all("article", limit=5):
                title = article.find("h2")
                desc = article.find("p")

                if title:
                    content.append(f"## {title.get_text(strip=True)}")
                if desc:
                    content.append(desc.get_text(strip=True))

            return "\n".join(content) if content else f"Learning resources for {career}."

        except Exception as e:
            print(f"Error scraping FreeCodeCamp: {e}")
            return f"Educational content for {career}."

    def search_youtube_videos(self, query: str, max_results: int = 3) -> List[Dict]:
        """Search YouTube for tutorials related to the given career"""
        try:
            results = self.youtube.search().list(
                q=query,
                part="id,snippet",
                maxResults=max_results,
                type="video",
                order="relevance",
                videoDuration="medium",  # 4–20 minutes
            ).execute()

            videos = []
            for item in results.get("items", []):
                vid = item["id"]["videoId"]
                snip = item["snippet"]
                videos.append({
                    "title": snip["title"],
                    "url": f"https://www.youtube.com/watch?v={vid}",
                    "channel": snip["channelTitle"],
                    "description": snip["description"][:200],
                })

            return videos

        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return []

    def scrape_all_sources(self, career: str) -> Dict[str, str]:
        """Scrape all major platforms and return a combined dictionary"""
        print(f"🔍 Collecting data for: {career}")

        data = {
            "career": career,
            "roadmap_sh": self.scrape_roadmap_sh(career),
            "geeksforgeeks": self.scrape_geeksforgeeks(career),
            "freecodecamp": self.scrape_freecodecamp(career),
            "youtube_videos": self.search_youtube_videos(f"{career} tutorial roadmap"),
        }

        time.sleep(1)
        return data

    def save_scraped_data(self, career: str, data: Dict) -> str:
        """Save all scraped content into a text file"""
        Path(settings["RAW_DATA_PATH"]).mkdir(parents=True, exist_ok=True)
        filename = f"{career.replace(' ', '_').lower()}_data.txt"
        filepath = os.path.join(settings["RAW_DATA_PATH"], filename)

        combined_text = f"""
# Career: {data['career']}

## Roadmap.sh Content:
{data['roadmap_sh']}

## GeeksforGeeks Content:
{data['geeksforgeeks']}

## FreeCodeCamp Content:
{data['freecodecamp']}

## YouTube Video References:
"""
        for v in data["youtube_videos"]:
            combined_text += f"\n- {v['title']} by {v['channel']}\n  URL: {v['url']}\n"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(combined_text)

        print(f"✅ Data saved at: {filepath}")
        return filepath
