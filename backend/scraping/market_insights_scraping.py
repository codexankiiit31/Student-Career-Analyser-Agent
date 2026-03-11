import os
import time
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dotenv import load_dotenv
load_dotenv()


# =====================================================
# CONFIG
# =====================================================

SERPAPI_KEY = os.getenv("SERPAPI_API_KEY")
SERPAPI_URL = "https://serpapi.com/search"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

BLOCKED_DOMAINS = {
    "youtube.com",
    "linkedin.com",
    "facebook.com",
    "reddit.com",
    "quora.com",
    "twitter.com",
    "instagram.com",
    "medium.com"
}

# =====================================================
# HELPERS
# =====================================================

def is_valid_url(url: str) -> bool:
    try:
        domain = urlparse(url).netloc.lower()
        return bool(domain) and not any(bad in domain for bad in BLOCKED_DOMAINS)
    except:
        return False


# =====================================================
# SERPAPI SEARCH
# =====================================================

def serpapi_search(query: str, max_results: int = 5):
    if not SERPAPI_KEY:
        print("❌ SERPAPI_API_KEY not set")
        return []

    params = {
        "engine": "google",
        "q": query,
        "hl": "en",
        "gl": "in",
        "num": max_results,
        "api_key": SERPAPI_KEY
    }

    try:
        response = requests.get(SERPAPI_URL, params=params, timeout=20)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"❌ SerpAPI error: {e}")
        return []

    urls = []
    for result in data.get("organic_results", []):
        link = result.get("link")
        if link and is_valid_url(link):
            urls.append(link)

    print(f"SerpAPI found {len(urls)} URLs")
    return urls[:max_results]


# =====================================================
# PAGE SCRAPER
# =====================================================

def scrape_page_text(url: str, retries: int = 2) -> str:
    for attempt in range(retries):
        try:
            response = requests.get(
                url,
                headers=HEADERS,
                timeout=15,
                allow_redirects=True
            )

            if response.status_code != 200:
                print(f"  Status {response.status_code}")
                continue

            response.encoding = response.apparent_encoding
            soup = BeautifulSoup(response.text, "html.parser")

            # Remove noise
            for tag in soup([
                "script", "style", "nav", "footer",
                "header", "aside", "iframe", "noscript"
            ]):
                tag.decompose()

            main = (
                soup.select_one("main")
                or soup.select_one("article")
                or soup.select_one("div.content")
                or soup.body
            )

            text = main.get_text(" ", strip=True) if main else ""
            text = re.sub(r"\s+", " ", text)

            if len(text) >= 500:
                return text

            print(f"  Text too short ({len(text)})")

        except Exception as e:
            print(f"  Scrape error: {e}")

        time.sleep(2)

    return ""


# =====================================================
# MAIN MARKET SCRAPER
# =====================================================

def scrape_market_data(career: str):
    search_queries = [
        f"{career} skills in demand",
        f"{career} future scope India",
        f"{career} salary India",
        f"{career} trending skills"
    ]

    collected_text = []
    sources = []

    for query in search_queries:
        print(f"\n🔍 Searching: {query}")
        urls = serpapi_search(query, max_results=5)

        if not urls:
            print("⚠️ No URLs found")
            continue

        for url in urls[:3]:
            print(f"📄 Scraping: {url}")
            text = scrape_page_text(url)

            if text:
                collected_text.append(text)
                sources.append(url)
                print(f"✅ Collected ({len(text)} chars)")
                break
            else:
                print("❌ Skipped")

            time.sleep(1.5)

        time.sleep(2)

    if not collected_text:
        return (
            f"Unable to retrieve market data for {career}. "
            "Sources may be blocked or unavailable."
        ), []

    return " ".join(collected_text), sources


# =====================================================
# TEST
# =====================================================

if __name__ == "__main__":
    career = "data scientist"

    text, sources = scrape_market_data(career)

    print("\n" + "=" * 60)
    print(f"Collected {len(text)} characters")
    print(f"Sources used: {len(sources)}")
    print("=" * 60)

    for i, src in enumerate(sources, 1):
        print(f"{i}. {src}")

    print("\nSample text:")
    print(text[:500])
