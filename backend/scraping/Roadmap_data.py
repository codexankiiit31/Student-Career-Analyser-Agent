# scraper.py

import os
import time
import random
import requests
import json
from typing import List, Dict
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# ================= CONFIG =================

SERP_API_KEY = os.getenv("SERPAPI_API_KEY")
SERP_API_URL = "https://serpapi.com/search.json"

# Realistic browser headers to avoid 403 blocks
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# Sites that block scrapers — use their APIs or skip them
BLOCKED_DOMAINS = ["reddit.com", "quora.com", "linkedin.com"]

ROADMAP_KEYWORDS = [
    "roadmap", "step", "phase", "week", "month",
    "beginner", "intermediate", "advanced",
    "learn", "course", "curriculum", "syllabus"
]


# ================= SCRAPER CLASS =================

class RoadmapScraper:
    def __init__(self):
        if not SERP_API_KEY:
            raise ValueError("SERPAPI_API_KEY is missing from your .env file!")
        self.serp_api_key = SERP_API_KEY
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    # -----------------------------
    # STEP 1: Discover roadmap pages
    # -----------------------------
    def discover_pages(self, topic: str, limit: int = 5) -> List[str]:
        """Search Google via SerpAPI and return clean, scrapeable URLs."""
        query = f"{topic} complete roadmap learning path guide"

        params = {
            "engine": "google",
            "q": query,
            "api_key": self.serp_api_key,
            "num": limit + 5,  # Fetch extras to account for blocked domains
        }

        response = self.session.get(SERP_API_URL, params=params, timeout=10)
        response.raise_for_status()

        try:
            data = response.json()
        except json.JSONDecodeError as e:
            # If SerpAPI returns HTML (e.g. Cloudflare block or quota error) instead of JSON
            print("\n----- SERPAPI ERROR: RESPONSE WAS NOT JSON -----")
            print(f"Status: {response.status_code}")
            print(f"Raw Text: {response.text[:1000]}")  # Print first 1000 chars
            print("------------------------------------------------\n")
            raise e

        urls = []

        for item in data.get("organic_results", []):
            link = item.get("link", "")

            # Skip known blocked domains
            if any(blocked in link for blocked in BLOCKED_DOMAINS):
                print(f"Skipping blocked domain: {link}")
                continue

            urls.append(link)

            if len(urls) >= limit:
                break

        return urls

    # -----------------------------
    # STEP 2: Fetch page HTML (with retries)
    # -----------------------------
    def fetch_page(self, url: str, retries: int = 3) -> str:
        """Fetch HTML with retry logic and random delay to avoid rate limits."""
        for attempt in range(1, retries + 1):
            try:
                # Random delay between requests (1–3 seconds)
                time.sleep(random.uniform(1.0, 3.0))

                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                return response.text

            except requests.exceptions.HTTPError as e:
                status = e.response.status_code if e.response else "unknown"

                if status == 403:
                    print(f"  403 Blocked (attempt {attempt}/{retries}): {url}")
                elif status == 404:
                    print(f"  404 Not found: {url}")
                    break  # No point retrying a 404
                else:
                    print(f"  HTTP {status} error (attempt {attempt}/{retries}): {url}")

                if attempt < retries:
                    time.sleep(2 ** attempt)  # Exponential backoff: 2s, 4s

            except requests.exceptions.Timeout:
                print(f"  Timeout (attempt {attempt}/{retries}): {url}")
                if attempt < retries:
                    time.sleep(2)

            except requests.exceptions.ConnectionError:
                print(f"  Connection error (attempt {attempt}/{retries}): {url}")
                if attempt < retries:
                    time.sleep(2)

        raise Exception(f"Failed to fetch after {retries} attempts: {url}")

    # -----------------------------
    # STEP 3: Clean HTML → plain text
    # -----------------------------
    def clean_text(self, html: str) -> str:
        """Strip boilerplate HTML and return meaningful text only."""
        soup = BeautifulSoup(html, "html.parser")

        # Remove noise tags
        for tag in soup(["script", "style", "nav", "footer",
                         "header", "aside", "form", "iframe"]):
            tag.decompose()

        text = soup.get_text(separator="\n")

        # Keep only lines with real content (> 40 chars)
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
        """Return True only if the page looks like a genuine roadmap/guide."""
        text_lower = text.lower()
        score = sum(1 for k in ROADMAP_KEYWORDS if k in text_lower)
        return score >= 3

    # -----------------------------
    # STEP 5: Build RAG documents
    # -----------------------------
    def scrape_roadmap(self, topic: str, limit: int = 5) -> List[Dict]:
        """
        Full pipeline:
          1. Discover URLs via SerpAPI
          2. Fetch each page (with retries)
          3. Clean HTML to plain text
          4. Filter for roadmap-quality content
          5. Return list of dicts ready for RAG ingestion
        """
        documents = []
        urls = self.discover_pages(topic, limit)

        if not urls:
            print(f"No scrapeable URLs found for topic: '{topic}'")
            return documents

        print(f"Found {len(urls)} URL(s) to scrape...")

        for url in urls:
            try:
                print(f"  Scraping: {url}")
                html = self.fetch_page(url)
                text = self.clean_text(html)

                if len(text) < 200:
                    print(f"  Skipping (too short): {url}")
                    continue

                if not self.is_roadmap_content(text):
                    print(f"  Skipping (not roadmap content): {url}")
                    continue

                documents.append({
                    "content": text,
                    "metadata": {
                        "source": url,
                        "topic": topic,
                        "type": "roadmap",
                    }
                })
                print(f"  ✅ Added: {url}")

            except Exception as e:
                print(f"  ❌ Failed to process {url}: {e}")

        return documents


# ================= TEST RUN =================

if __name__ == "__main__":
    scraper = RoadmapScraper()
    docs = scraper.scrape_roadmap("machine learning", limit=3)

    print(f"\nRoadmap documents collected: {len(docs)}\n")

    for i, doc in enumerate(docs, start=1):
        print(f"Document {i}")
        print("Source:", doc["metadata"]["source"])
        print("Content preview:")
        print(doc["content"][:500])
        print("-" * 60)