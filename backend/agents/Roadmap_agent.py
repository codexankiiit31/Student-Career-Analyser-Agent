import json
import re
import logging
from pathlib import Path

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from rag_Store.ingest_roadmap import ingested_roadmap
from utils.llm_utils import get_llm

logger = logging.getLogger(__name__)


class RoadmapLLM:
    def __init__(self, topic: str):
        """
        topic: e.g. 'machine learning'
        Builds/loads FAISS and wires RAG into LCEL.
        """
        self.topic = topic
        self.llm = get_llm()

        try:
            # This calls ingest_roadmap.py which uploads to Pinecone and returns the db instance
            self.rag_store = ingested_roadmap(topic)
        except Exception as e:
            logger.warning(f"RAG ingestion/connection failed for '{topic}': {e}. Proceeding without RAG context.")
            self.rag_store = None

        prompt_text = Path("prompts/roadmap_prompt.txt").read_text(encoding="utf-8")
        self.prompt = ChatPromptTemplate.from_template(prompt_text)

        self.chain = (
            {
                "context": self._retrieve_context,
                "question": RunnablePassthrough()
            }
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

    # ─────────────────────────────────────────
    # RAG retrieval (safe)
    # ─────────────────────────────────────────
    def _retrieve_context(self, question: str) -> str:
        if not self.rag_store:
            return "No additional context available. Use your general knowledge."

        try:
            docs = self.rag_store.retrieve(question, k=4)
            if not docs:
                return "No relevant context found."
            return "\n\n".join(doc.page_content for doc in docs)
        except Exception as e:
            logger.warning(f"RAG retrieval error: {e}")
            return "Context retrieval failed. Use general knowledge."

    # ─────────────────────────────────────────
    # Parse JSON from LLM output
    # ─────────────────────────────────────────
    def _parse_json(self, raw: str) -> dict:
        """Extract and parse JSON from LLM response."""
        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Try to extract JSON block with regex
            match = re.search(r"\{[\s\S]+\}", cleaned)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass

        logger.warning("Could not parse JSON from roadmap response. Returning raw text.")
        # Fallback: return raw text wrapped in a dict
        return {
            "career": self.topic,
            "total_weeks": 0,
            "phases": [],
            "weeks": [],
            "pro_tips": [],
            "outcomes": [],
            "_raw": raw
        }

    # ─────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────
    def generate(self, question: str) -> dict:
        """Run the RAG + LLM chain and return structured JSON dict."""
        raw = self.chain.invoke(question)
        return self._parse_json(raw)


# ─────────────────────────────────────────
# Local Test
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("Initializing Roadmap LLM...\n")
    roadmap_llm = RoadmapLLM("machine learning")
    question = "Give me a roadmap to become a Machine Learning Engineer"
    result = roadmap_llm.generate(question)
    print(json.dumps(result, indent=2))