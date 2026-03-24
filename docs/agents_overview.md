# 🤖 AI Agents Deep-Dive

The true power of the AI Career Agent lies in its multi-agent architecture. By separating logical concerns into distinct AI brains, the system achieves remarkable accuracy while minimizing LLM prompt confusion.

## 1. Career Agent
**Role**: Analyst & Critic
**Stack**: Google Gemini + PydanticOutputParser
**Function**: 
Receives a `Resume` and a `Job Description`. It uses few-shot prompting to strictly act as a senior recruiter. It returns a deterministic JSON object containing integer scores (ATS) and arrays strings (Matched Skills, Missing Skills).

## 2. Market Agent
**Role**: Researcher
**Stack**: SerpAPI + BeautifulSoup4 + Groq LLaMA 3.3
**Function**: 
Executes live internet queries via SerpAPI to fetch current job listings and market trends. The raw HTML is parsed by BeautifulSoup4 and passed to LLaMA 3.3 running on Groq (for ultrafast inference) to extract average salaries and demand levels.

## 3. Roadmap LLM (RAG)
**Role**: Educator
**Stack**: FAISS Vector Store + LangChain + Gemini
**Function**: 
Uses Retrieval-Augmented Generation (RAG). Career learning paths were previously chopped into chunks and embedded into a local `.faiss` vector database. When a user requests a roadmap, this agent retrieves the most semantically relevant chunks and synthesizes a structured weekly learning plan.

## 4. Chatbot Router Agent
**Role**: Traffic Controller
**Stack**: LangChain RunnableBranch + Semantic Router
**Function**: 
The first point of contact for the chat UI. It uses a lightweight intent-classification prompt to read the user's message and determine if it should query the `Career Agent`, the `Market Database`, or fallback to general Gemini Q&A. This ensures users get the correct data contexts.
