from scraping.Roadmap_data import RoadmapScraper
from utils.rag_chain import RAGStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os


def chunk_documents(documents: list) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=120
    )

    chunked = []

    for doc in documents:
        chunks = splitter.split_text(doc["content"])
        for chunk in chunks:
            chunked.append({
                "content": chunk,
                "metadata": doc["metadata"]
            })

    return chunked


def ingested_roadmap(topic: str):
    # 1. Scrape roadmap content
    scraper = RoadmapScraper()
    raw_docs = scraper.scrape_roadmap(topic)

    if not raw_docs:
        raise ValueError("No roadmap content found")

    # 2. Chunk scraped content
    chunked_docs = chunk_documents(raw_docs)

    # 3. Store in FAISS
    rag_store = RAGStore()
    rag_store.build_index(chunked_docs)

    return rag_store

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

    print("\n=== STEP 3: BUILD & SAVE FAISS ===")
    rag_store = RAGStore(index_path="faiss_index")

    # Build only if index doesn't exist
    if not os.path.exists("faiss_index"):
        rag_store.build_index(chunked_docs)
        print("FAISS index built and saved")
    else:
        print("FAISS index already exists, loaded from disk")

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