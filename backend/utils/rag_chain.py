import os
import logging
from dotenv import load_dotenv
from typing import List

from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from google import genai                          # new google-genai SDK (replaces google-generativeai)
from google.genai import types as genai_types

load_dotenv()

logger = logging.getLogger(__name__)


# ── Custom Embeddings using google-genai SDK ──────────────────────────────────
# Uses google-genai package (not the old google-generativeai) which is the
# current Google AI Python SDK. Produces 3072-dim vectors via gemini-embedding-001.
class GeminiEmbeddings(Embeddings):
    """
    LangChain-compatible Embeddings class backed by Gemini gemini-embedding-001.
    Uses google-genai SDK (Client-based API).
    """

    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY (or GOOGLE_API_KEY) is missing from your .env file!")

        # New SDK: Client-based initialization
        self.client = genai.Client(api_key=api_key)
        self.model = "models/gemini-embedding-001"   # 3072-dim vectors

    def _embed(self, text: str) -> List[float]:
        """Embed a single string and return its float vector."""
        result = self.client.models.embed_content(
            model=self.model,
            contents=text,
            config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )
        return result.embeddings[0].values     # new SDK returns result.embeddings[0].values

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents (called by build_index)."""
        embeddings = []
        for text in texts:
            try:
                embeddings.append(self._embed(text))
            except Exception as e:
                logger.error(f"Embedding failed: {e}")
                raise
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string (called by retrieve)."""
        return self._embed(text)


# ── RAGStore ──────────────────────────────────────────────────────────────────
class RAGStore:
    """
    Wraps a Pinecone vector store with Gemini text-embedding-004 embeddings.
    Provides build_index() to upload and retrieve() to query.
    """

    def __init__(self):
        self.embeddings = GeminiEmbeddings()

        self.index_name = os.environ.get("PINECONE_INDEX_NAME")
        if not self.index_name:
            raise ValueError("PINECONE_INDEX_NAME is missing from your .env file!")

        # Connect to the existing Pinecone index
        self.db = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings,
        )
        logger.info(f"RAGStore connected to Pinecone index: {self.index_name}")

    def build_index(self, documents: list):
        """
        Converts raw dicts to LangChain Documents, embeds them,
        and pushes all chunks to Pinecone.
        """
        if not documents:
            raise ValueError("No documents provided for indexing")

        docs = [
            Document(
                page_content=d["content"],
                metadata=d.get("metadata", {}),
            )
            for d in documents
        ]

        print(f"Pushing {len(docs)} chunk(s) to Pinecone index: '{self.index_name}'...")
        self.db.add_documents(docs)
        print("✅ Successfully uploaded to Pinecone!")

    def retrieve(self, query: str, k: int = 4) -> List[Document]:
        """
        Returns the top-k most similar document chunks from Pinecone.
        """
        retriever = self.db.as_retriever(search_kwargs={"k": k})
        return retriever.invoke(query)


# ── Standalone Test ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n=== Testing GeminiEmbeddings + Pinecone ===\n")
    documents = [
        {"content": "Pinecone is a fast cloud vector database for AI.", "metadata": {"source": "test"}},
        {"content": "LangChain helps build LLM applications easily.", "metadata": {"source": "test"}},
        {"content": "Google Gemini produces accurate vector embeddings.", "metadata": {"source": "test"}},
    ]

    store = RAGStore()
    store.build_index(documents)

    query = "What database is used for AI?"
    results = store.retrieve(query, k=2)

    print(f"\nQuery: '{query}'")
    for i, doc in enumerate(results, 1):
        print(f"  Result {i}: {doc.page_content}")
