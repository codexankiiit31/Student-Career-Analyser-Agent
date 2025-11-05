# ==================== career_retriever.py ====================
"""Career Retriever — builds and queries FAISS vector store for semantic search"""

import os
from pathlib import Path
from typing import List
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from utils.llm_utils import get_settings

# Load environment settings
settings = get_settings()


class CareerRetriever:
    """Handles FAISS index creation, storage, and document retrieval"""

    def __init__(self):
        print("🔧 Initializing embedding model...")
        self.embedding_model = SentenceTransformer(settings["EMBEDDING_MODEL"])
        self.dimension = self.embedding_model.get_sentence_embedding_dimension()
        self.index = None
        self.documents: List[Document] = []

    # -------------------------------------------------
    # Document Loading and Chunking
    # -------------------------------------------------
    def load_documents(self, career: str = None) -> List[Document]:
        """Load text documents from the local scraped data folder."""
        data_path = Path(settings["RAW_DATA_PATH"])
        documents = []

        if not data_path.exists():
            print(f"⚠️ Data path not found: {data_path}")
            return []

        # Load specific career file or all text files
        if career:
            filename = f"{career.replace(' ', '_').lower()}_data.txt"
            target = data_path / filename
            files = [target] if target.exists() else []
        else:
            files = list(data_path.glob("*.txt"))

        for file in files:
            try:
                with open(file, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        documents.append(
                            Document(
                                page_content=content,
                                metadata={"source": file.name, "career": career or "general"},
                            )
                        )
            except Exception as e:
                print(f"Error reading {file}: {e}")

        print(f"📚 Loaded {len(documents)} document(s)")
        return documents

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """Split long documents into smaller chunks for embedding."""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings["CHUNK_SIZE"],
            chunk_overlap=settings["CHUNK_OVERLAP"],
            separators=["\n\n", "\n", ".", " ", ""],
        )
        chunks = splitter.split_documents(documents)
        print(f"✂️ Split into {len(chunks)} chunk(s)")
        return chunks

    # -------------------------------------------------
    # Embedding and FAISS Index Management
    # -------------------------------------------------
    def create_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate dense vector embeddings for input text chunks."""
        print("🧮 Generating embeddings...")
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        return np.array(embeddings).astype("float32")

    def build_index(self, career: str = None):
        """Build FAISS vector index from scraped documents."""
        documents = self.load_documents(career)
        if not documents:
            print("⚠️ No documents found. Scrape data first.")
            return

        chunks = self.split_documents(documents)
        self.documents = chunks

        texts = [doc.page_content for doc in chunks]
        embeddings = self.create_embeddings(texts)

        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(embeddings)
        print(f"✅ FAISS index built with {self.index.ntotal} vectors")

    def save_index(self, career: str):
        """Save the FAISS index and related document data."""
        if self.index is None:
            print("⚠️ No index to save.")
            return

        Path(settings["FAISS_INDEX_PATH"]).mkdir(parents=True, exist_ok=True)

        base_name = career.replace(" ", "_").lower()
        index_file = os.path.join(settings["FAISS_INDEX_PATH"], f"{base_name}_index.faiss")
        docs_file = os.path.join(settings["FAISS_INDEX_PATH"], f"{base_name}_docs.txt")

        faiss.write_index(self.index, index_file)
        with open(docs_file, "w", encoding="utf-8") as f:
            for doc in self.documents:
                f.write(doc.page_content + "\n---DOCUMENT_SEPARATOR---\n")

        print(f"💾 Index and documents saved in: {settings['FAISS_INDEX_PATH']}")

    def load_index(self, career: str) -> bool:
        """Load FAISS index and associated document texts from disk."""
        base_name = career.replace(" ", "_").lower()
        index_file = os.path.join(settings["FAISS_INDEX_PATH"], f"{base_name}_index.faiss")
        docs_file = os.path.join(settings["FAISS_INDEX_PATH"], f"{base_name}_docs.txt")

        if not os.path.exists(index_file):
            print(f"⚠️ Index file not found: {index_file}")
            return False

        self.index = faiss.read_index(index_file)

        try:
            with open(docs_file, "r", encoding="utf-8") as f:
                content = f.read()
                texts = content.split("\n---DOCUMENT_SEPARATOR---\n")
                self.documents = [Document(page_content=t.strip()) for t in texts if t.strip()]
        except Exception as e:
            print(f"Error reading document file: {e}")
            return False

        print(f"📂 Index loaded successfully with {self.index.ntotal} vectors")
        return True

    # -------------------------------------------------
    # Semantic Retrieval
    # -------------------------------------------------
    def retrieve(self, query: str, k: int = None) -> List[Document]:
        """Retrieve top-k semantically relevant chunks for a given query."""
        if self.index is None:
            print("⚠️ No index is loaded or built.")
            return []

        k = k or settings["TOP_K_RESULTS"]
        query_vector = self.embedding_model.encode([query]).astype("float32")
        distances, indices = self.index.search(query_vector, k)

        results = []
        for idx in indices[0]:
            if idx < len(self.documents):
                results.append(self.documents[idx])

        print(f"🔎 Retrieved {len(results)} relevant chunk(s)")
        return results
