# 📡 API Reference

The FastAPI backend runs at `http://localhost:8000`. All endpoints return JSON natively unless specified as a StreamingResponse.

## Core Endpoints

### `POST /upload_resume`
Parses a PDF or DOCX file using `PyMuPDF` or `python-docx` and extracts raw text.
- **Body**: `multipart/form-data` with a `file` field.
- **Response**: `{ "filename": "resume.pdf", "text": "..." }`

### `POST /analyze_resume`
Triggers the Career Agent to compare the extracted resume text against a provided Job Description.
- **Body**: `{ "resume_text": "...", "job_description": "..." }`
- **Response**: JSON payload containing `ats_score`, `missing_skills`, etc.

### `POST /generate_cover_letter`
Generates an AI cover letter tailored to the job description.
- **Body**: `{ "resume_text": "...", "job_description": "..." }`
- **Response**: `{ "cover_letter": "Dear Hiring Manager..." }`

### `POST /api/market_analysis`
Initiates a background task to scrape dynamic job market data via SerpAPI and parse it using Groq.
- **Body**: `{ "role": "Software Engineer", "location": "India", "experience": "Entry Level" }`
- **Response**: Returns a `job_id` for polling.

### `GET /api/market_analysis/status/{job_id}`
Polls the background task status.
- **Response**: `{ "status": "completed", "data": { "salary": "..." } }`

### `POST /api/get_roadmap`
Generates a week-by-week curriculum.
- **Body**: `{ "career_goal": "DevOps", "duration": "4 Weeks" }`
- **Response**: Structured JSON object organized into weeks and phases.

### `POST /api/chat`
Streams a response from the router agent based on the user's conversational intent.
- **Body**: `{ "message": "What skills am I missing?", "history": [...] }`
- **Response**: Fast HTTP streaming response chunked word-by-word.
