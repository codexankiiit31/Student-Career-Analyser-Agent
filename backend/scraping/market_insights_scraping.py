# market_scraper.py

import os
import time
import re
import requests
import concurrent.futures
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import List, Tuple
from dotenv import load_dotenv

from utils.ws_logger import send_log

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
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# Domains that reliably block scrapers
BLOCKED_DOMAINS = {
    "youtube.com", "linkedin.com", "facebook.com",
    "reddit.com", "quora.com", "twitter.com",
    "instagram.com", "tiktok.com", "pinterest.com",
}

# High-quality sources to prioritise in scoring
PRIORITY_DOMAINS = {
    "glassdoor.com", "ambitionbox.com", "naukri.com",
    "indeed.com", "geeksforgeeks.org", "towardsdatascience.com",
    "analyticsvidhya.com", "simplilearn.com", "coursera.org",
    "kdnuggets.com", "builtin.com", "techgig.com",
}

# Queries designed to pull salary, skills, scope and trends
QUERY_TEMPLATES = [
    "{career} skills required 2025",
    "{career} salary India 2025",
    "{career} future scope and demand India",
    "{career} trending tools and technologies",
    "{career} job market outlook",
]

# Minimum characters for a page to be considered useful
MIN_TEXT_LENGTH = 600

# How many URLs to try per query before moving on
URLS_PER_QUERY = 3


# =====================================================
# HELPERS
# =====================================================

def get_domain(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().replace("www.", "")
    except Exception:
        return ""


def is_scrapeable(url: str) -> bool:
    """Return True only if the URL is from a domain we can scrape."""
    domain = get_domain(url)
    return bool(domain) and not any(bad in domain for bad in BLOCKED_DOMAINS)


def score_url(url: str) -> int:
    """Give priority domains a higher score so they get scraped first."""
    domain = get_domain(url)
    return 1 if any(p in domain for p in PRIORITY_DOMAINS) else 0


def deduplicate(texts: List[str], min_overlap: int = 100) -> List[str]:
    """
    Remove near-duplicate texts by checking for shared substrings.
    Keeps the first occurrence of any near-duplicate group.
    """
    unique = []
    for text in texts:
        sample = text[:min_overlap].strip()
        if not any(sample in existing for existing in unique):
            unique.append(text)
    return unique


# =====================================================
# SERPAPI SEARCH
# =====================================================

def serpapi_search(query: str, max_results: int = 6) -> List[str]:
    """Search Google via SerpAPI and return scrapeable, scored URLs."""
    if not SERPAPI_KEY:
        print("❌ SERPAPI_API_KEY not set in .env")
        return []

    params = {
        "engine": "google",
        "q": query,
        "hl": "en",
        "gl": "in",           # India-focused results
        "num": max_results,
        "api_key": SERPAPI_KEY,
    }

    try:
        response = requests.get(SERPAPI_URL, params=params, timeout=20)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"  ❌ SerpAPI error: {e}")
        return []

    urls = [
        result["link"]
        for result in data.get("organic_results", [])
        if result.get("link") and is_scrapeable(result["link"])
    ]

    # Sort: priority domains first
    urls.sort(key=score_url, reverse=True)

    send_log(f"Found {len(urls)} scrapeable URL(s)")
    return urls[:max_results]


# =====================================================
# PAGE SCRAPER
# =====================================================

def extract_main_content(soup: BeautifulSoup) -> str:
    """
    Try to extract the most content-rich section of the page
    by looking for semantic tags first, then falling back to
    the largest <div> block by text length.
    """
    # Remove noise first
    for tag in soup(["script", "style", "nav", "footer",
                     "header", "aside", "iframe", "noscript",
                     "form", "button", "svg"]):
        tag.decompose()

    # Try semantic containers in priority order
    for selector in ["main", "article", "[role='main']",
                     "div.content", "div.post", "div.entry",
                     "div.article", "section"]:
        node = soup.select_one(selector)
        if node:
            text = node.get_text(" ", strip=True)
            if len(text) >= MIN_TEXT_LENGTH:
                return text

    # Fallback: find the <div> with the most text
    best_tag, best_len = None, 0
    for div in soup.find_all("div"):
        t = div.get_text(" ", strip=True)
        if len(t) > best_len:
            best_tag, best_len = div, len(t)   # store the TAG, not the string

    return best_tag.get_text(" ", strip=True) if best_tag else ""


def scrape_page(url: str, retries: int = 1) -> str:
    """Fetch a URL and return cleaned plain text, or '' on failure."""
    for attempt in range(1, retries + 1):
        try:
            response = requests.get(
                url, headers=HEADERS,
                timeout=15, allow_redirects=True,
            )

            if response.status_code != 200:
                print(f"    HTTP {response.status_code} (attempt {attempt})")
                time.sleep(2)
                continue

            response.encoding = response.apparent_encoding
            soup = BeautifulSoup(response.text, "html.parser")
            text = extract_main_content(soup)

            # Collapse whitespace
            text = re.sub(r"\s+", " ", text).strip()

            if len(text) >= MIN_TEXT_LENGTH:
                return text

            print(f"    Too short ({len(text)} chars), skipping")
            return ""

        except requests.exceptions.Timeout:
            print(f"    Timeout (attempt {attempt})")
        except requests.exceptions.ConnectionError:
            print(f"    Connection error (attempt {attempt})")
        except Exception as e:
            print(f"    Scrape error: {e}")

        time.sleep(2 ** attempt)   # Exponential backoff: 2s, 4s

    return ""


# =====================================================
# MAIN MARKET SCRAPER
# =====================================================

def scrape_market_data(career: str) -> Tuple[str, List[str]]:
    """
    Full pipeline:
      1. Build targeted search queries for the career
      2. Search via SerpAPI (India-focused, priority domains first)
      3. Gather top URLs and concurrently scrape them
      4. Deduplicate collected text
      5. Return combined text + list of sources

    Args:
        career: Job role to research (e.g. 'data scientist')

    Returns:
        (combined_text, sources) tuple
    """
    queries = [t.format(career=career) for t in QUERY_TEMPLATES]

    # 1. Gather URLs sequentially to avoid rate-limiting SerpAPI
    query_urls = {}
    for query in queries:
        send_log(f"🔎 Searching web for: {query}")
        urls = serpapi_search(query, max_results=5)
        query_urls[query] = urls

    # 2. Pick top 2 URLs per query to ensure diversity without scraping too many
    urls_to_scrape = []
    seen_urls = set()
    for query, urls in query_urls.items():
        count = 0
        for u in urls:
            if u not in seen_urls:
                urls_to_scrape.append(u)
                seen_urls.add(u)
                count += 1
                if count >= 2:
                    break

    # 3. Concurrently scrape the candidate URLs
    collected_texts: List[str] = []
    sources: List[str] = []
    total_chars = 0

    send_log(f"🚀 Concurrently scraping {len(urls_to_scrape)} high-quality sources...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_url = {executor.submit(scrape_page, url): url for url in urls_to_scrape}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                text = future.result()
                if text:
                    collected_texts.append(text)
                    sources.append(url)
                    total_chars += len(text)
                    send_log(f"✅ Extracted data from: {url}")
                    
                    # Early exit if we have plenty of text (LLM context limit is ~8000)
                    if total_chars > 20000:
                        send_log("✅ Reached sufficient text volume, stopping early.")
                        break
                else:
                    print(f"  ❌ Skipped/Failed <- {url}")
            except Exception as exc:
                print(f"  ❌ {url} generated an exception: {exc}")

    if not collected_texts:
        return (
            f"Unable to retrieve market data for '{career}'. "
            "All sources may be blocked or unavailable.",
            [],
        )

    # Remove near-duplicates before combining
    unique_texts = deduplicate(collected_texts)
    send_log(f"📊 Compiling {len(unique_texts)} unique pages for AI Analysis...")

    return " ".join(unique_texts), sources


# =====================================================
# TEST
# =====================================================

if __name__ == "__main__":
    career = "data scientist"
    print(f"🚀 Scraping market data for: {career}\n")

    text, sources = scrape_market_data(career)

    print("\n" + "=" * 60)
    print(f"Total text:  {len(text):,} chars")
    print(f"Sources used: {len(sources)}")
    print("=" * 60)

    for i, src in enumerate(sources, 1):
        print(f"  {i}. {src}")

    print("\n📝 Sample text (first 600 chars):")
    print(text[:600])