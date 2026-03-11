from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
import os


class RAGStore:
    def __init__(self, index_path: str = "faiss_index"):
        # Offline, open-source embedding model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.db = None
        self.index_path = index_path

        # Auto-load index if it already exists
        if os.path.exists(index_path):
            self.load_index()

    def build_index(self, documents: list):
        """
        documents format:
        [
            {
                "content": "text chunk",
                "metadata": {...}
            }
        ]
        """
        if not documents:
            raise ValueError("No documents provided for indexing")

        docs = [
            Document(
                page_content=d["content"],
                metadata=d.get("metadata", {})
            )
            for d in documents
        ]

        self.db = FAISS.from_documents(docs, self.embeddings)
        self.save_index()

    def retrieve(self, query: str, k: int = 4):
        if self.db is None:
            return []

        retriever = self.db.as_retriever(search_kwargs={"k": k})
        return retriever.invoke(query)

    # -----------------------------
    # Persistence
    # -----------------------------
    def save_index(self):
        if self.db is None:
            return

        self.db.save_local(self.index_path)

    def load_index(self):
        self.db = FAISS.load_local(
            self.index_path,
            self.embeddings,
            allow_dangerous_deserialization=True
        )


if __name__ == "__main__":
    # Step 1: Create dummy documents
    documents = [
        {
            "content": "FAISS is a library for fast similarity search on vector embeddings.",
            "metadata": {"source": "faiss.txt"}
        },
        {
            "content": "LangChain helps build applications using large language models.",
            "metadata": {"source": "langchain.txt"}
        },
        {
            "content": "HuggingFace provides open-source models for NLP tasks.",
            "metadata": {"source": "hf.txt"}
        }
    ]
   

    # Step 2: Initialize RAG store
    rag_store = RAGStore()

    # Step 3: Build FAISS index
    rag_store.build_index(documents)
    print("Index built successfully")

    # Step 4: Query the index
    query = "What is FAISS used for?"
    results = rag_store.retrieve(query, k=2)

    # Step 5: Print results
    print("\nRetrieved documents:\n")
    for i, doc in enumerate(results, start=1):
        print(f"Result {i}:")
        print("Content:", doc.page_content)
        print("Metadata:", doc.metadata)
        print("-" * 40)
