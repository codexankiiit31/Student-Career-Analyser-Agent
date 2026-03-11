# scraper.py

import os
import requests
from typing import List, Dict
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# ================= CONFIG =================

SERP_API_KEY = os.getenv("SERPAPI_API_KEY")
SERP_API_URL = "https://serpapi.com/search.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


# ================= SCRAPER CLASS =================

class RoadmapScraper:
    def __init__(self):
        if not SERP_API_KEY:
            raise ValueError("SerpAPI key is missing")

        self.serp_api_key = SERP_API_KEY

    # -----------------------------
    # STEP 1: Discover roadmap pages
    # -----------------------------
    def discover_pages(self, topic: str, limit: int = 5) -> List[str]:
        query = f"{topic} roadmap learning path"

        params = {
            "engine": "google",
            "q": query,
            "api_key": self.serp_api_key,
            "num": limit
        }

        response = requests.get(SERP_API_URL, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        urls = []

        for item in data.get("organic_results", []):
            link = item.get("link")
            if link:
                urls.append(link)

            if len(urls) >= limit:
                break

        return urls

    # -----------------------------
    # STEP 2: Fetch page HTML
    # -----------------------------
    def fetch_page(self, url: str) -> str:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.text

    # -----------------------------
    # STEP 3: Clean HTML → text
    # -----------------------------
    def clean_text(self, html: str) -> str:
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup([
            "script", "style", "nav",
            "footer", "header", "aside"
        ]):
            tag.decompose()

        text = soup.get_text(separator="\n")
        lines = [
            line.strip()
            for line in text.splitlines()
            if len(line.strip()) > 40
        ]

        return "\n".join(lines)

    # -----------------------------
    # STEP 4: Roadmap quality filter
    # -----------------------------
    def is_roadmap_content(self, text: str) -> bool:
        keywords = [
            "roadmap", "step", "phase",
            "week", "month",
            "beginner", "intermediate", "advanced"
        ]

        score = sum(1 for k in keywords if k in text.lower())
        return score >= 3

    # -----------------------------
    # STEP 5: Build RAG documents
    # -----------------------------
    def scrape_roadmap(self, topic: str, limit: int = 5) -> List[Dict]:
        documents = []
        urls = self.discover_pages(topic, limit)

        for url in urls:
            try:
                html = self.fetch_page(url)
                clean_text = self.clean_text(html)

                if not self.is_roadmap_content(clean_text):
                    continue

                documents.append({
                    "content": clean_text,
                    "metadata": {
                        "source": url,
                        "topic": topic,
                        "type": "roadmap"
                    }
                })

            except Exception as e:
                print(f"Failed to process {url}: {e}")

        return documents


# ================= TEST RUN =================

if __name__ == "__main__":
    scraper = RoadmapScraper()
    docs = scraper.scrape_roadmap("machine learning", limit=3)

    print(f"\nRoadmap documents collected: {len(docs)}\n")

    for i, d in enumerate(docs, start=1):
        print(f"Document {i}")
        print("Source:", d["metadata"]["source"])
        print("Content preview:")
        print(d["content"][:500])
        print("-" * 60)
