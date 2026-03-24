# 🐳 Deployment Guide

The AI Career Agent is fully containerized, meaning it can run on any machine or cloud server that has Docker installed without needing to configure Python or Node.js manually.

## Prerequisites
- Docker Engine
- Docker Compose v2

## Running via Docker Compose

1. Clone the repository and navigate to the root directory.
2. Ensure your `.env` variables are correctly set. Inside `docker-compose.yml`, it expects:
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `SERPAPI_API_KEY`

3. In your terminal, run the following command to build the images and start the orchestrated containers:
```bash
docker-compose up --build -d
```
*(The `-d` flag runs it in detached mode so you can continue using your terminal).*

## What This Does
- **`mloops-backend`**: Builds a `python:3.11-slim` container, installs `requirements.txt` via `uv` for speed, and exposes standard FastAPI endpoints on port `8000`.
- **`mloops-frontend`**: Builds a `node:18-alpine` container, installs dependencies, and serves the React framework on port `3000`. The frontend is automatically wired to speak directly to the backend container.

## Shutting Down
To gracefully stop the application and clean up networking:
```bash
docker-compose down
```
