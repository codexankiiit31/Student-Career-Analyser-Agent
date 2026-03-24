import sys
import os
import logging
from pathlib import Path

# ── Path fix: allow running directly as a script from any directory ────────────
# Adds the 'backend/' folder to Python's module search path.
sys.path.append(str(Path(__file__).resolve().parent.parent))

from scraping.Roadmap_data import RoadmapScraper
from utils.rag_chain import RAGStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from utils.ws_logger import send_log

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Chunking ──────────────────────────────────────────────────────────────────
def chunk_documents(documents: list) -> list:
    """
    Splits raw scraped documents into smaller overlapping chunks
    for better embedding quality and retrieval accuracy.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=120,
    )

    chunked = []
    for doc in documents:
        try:
            chunks = splitter.split_text(doc["content"])
            for chunk in chunks:
                chunked.append({
                    "content": chunk,
                    "metadata": doc.get("metadata", {}),
                })
        except Exception as e:
            logger.warning(f"Skipping document due to chunking error: {e}")

    return chunked


# ── Main Pipeline ─────────────────────────────────────────────────────────────
def ingested_roadmap(topic: str) -> RAGStore:
    """
    Full pipeline:
      1. Scrape roadmap content for the given topic
      2. Chunk scraped text into 600-char segments with overlap
      3. Embed each chunk via Gemini text-embedding-004
      4. Upload all embeddings to the Pinecone cloud index
      5. Return the connected RAGStore for immediate retrieval

    Args:
        topic: Career topic to scrape (e.g. 'machine learning')

    Returns:
        RAGStore instance connected to Pinecone (ready for retrieve())

    Raises:
        ValueError: if no content can be scraped for the topic
    """
    logger.info(f"Starting roadmap ingestion for topic: '{topic}'")
    send_log(f"🔎 Researching optimal learning path for: {topic}")

    # Step 1 — Scrape
    scraper = RoadmapScraper()
    raw_docs = scraper.scrape_roadmap(topic)

    if not raw_docs:
        raise ValueError(f"No roadmap content found for topic: '{topic}'")

    logger.info(f"Scraped {len(raw_docs)} document(s)")
    send_log(f"📚 Gathered {len(raw_docs)} high-quality syllabus documents")

    # Step 2 — Chunk
    chunked_docs = chunk_documents(raw_docs)
    if not chunked_docs:
        raise ValueError("Chunking produced no output — documents may be too short")

    logger.info(f"Created {len(chunked_docs)} chunk(s)")
    send_log(f"⚙️ Vectorizing {len(chunked_docs)} knowledge chunks into Pinecone database...")

    # Step 3 — Upload to Pinecone
    rag_store = RAGStore()
    rag_store.build_index(chunked_docs)
    send_log("✅ Knowledge base built! Synthesizing structured roadmap...")

    return rag_store


# ── Standalone Test ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n=== STEP 1: SCRAPING ===")
    scraper = RoadmapScraper()
    scraped_docs = scraper.scrape_roadmap("machine learning", limit=3)

    print(f"Scraped documents: {len(scraped_docs)}")
    assert len(scraped_docs) > 0, "Scraper returned no documents"

    print("\n=== STEP 2: CHUNKING ===")
    chunked_docs = chunk_documents(scraped_docs)
    print(f"Total chunks created: {len(chunked_docs)}")
    assert len(chunked_docs) > 0, "Chunking failed"

    print("\n=== STEP 3: PUSH TO PINECONE ===")
    rag_store = RAGStore()
    rag_store.build_index(chunked_docs)

    print("\n=== STEP 4: RETRIEVAL TEST ===")
    results = rag_store.retrieve(
        "What should I learn first in machine learning?",
        k=3
    )

    print(f"Retrieved docs: {len(results)}")
    assert len(results) > 0, "RAG retrieval failed"

    for i, doc in enumerate(results, start=1):
        print(f"\nResult {i}")
        print("Content preview:")
        print(doc.page_content[:200])
        print("Metadata:", doc.metadata)

    print("\n✅ ALL TESTS PASSED — SCRAPER + RAG ARE WORKING")