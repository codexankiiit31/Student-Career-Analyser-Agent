# AI Career Analyzer

> Empower your career journey with AI-driven resume analysis, intelligent job matching, and personalized learning roadmaps.

Quickly analyze how well your resume matches any job description, get ATS optimization suggestions, and generate time-bound learning roadmaps for your target career. This tool leverages **Google Gemini AI** for intelligent analysis and **FAISS-powered RAG** for context-aware roadmap generation, specifically designed for students, freshers, and early-career professionals.

---

## Features

### AI Job Analyzer
- **Smart Resume Parsing**: Automatically extracts structured data from PDF/DOCX resumes
- **Job Description Matching**: Calculates precise match scores based on skills, experience, and education
- **Selection Probability**: Provides data-driven predictions of shortlisting likelihood
- **Skills Analysis**: 
  - Matching skills with proficiency levels
  - Missing skills categorized by importance (High/Medium/Low)
  - Technical and soft skills gap analysis
- **ATS Optimization**: 
  - Compatibility scoring
  - Missing keywords detection (technical skills, soft skills, tools, certifications)
  - Formatting and structuring recommendations
- **Cover Letter Generation**: Auto-generates professional, role-specific cover letters
- **Actionable Insights**: Clear suggestions with specific examples for resume improvement

### Career Roadmap Generator
- **Personalized Learning Paths**: Role-specific roadmaps for various careers (Data Scientist, Backend Developer, etc.)
- **Flexible Timelines**: Customize your learning duration (3 months, 6 months, 1 year)
- **Weekly Breakdown**: 
  - Topics to learn
  - Mini-projects for hands-on practice
  - Time commitment estimates
  - Curated YouTube resources
- **Multi-Source Content**: Aggregates learning materials from roadmap.sh, GeeksforGeeks, FreeCodeCamp
- **RAG-Powered**: Uses FAISS vector indexing for fast, contextually accurate recommendations
- **Downloadable Plans**: Export roadmaps for offline reference

---

## How It Works

The application follows a two-pipeline architecture orchestrated by FastAPI and Google Gemini AI:

### Job Analyzer Pipeline

```
Resume Upload (PDF/DOCX) 
    ↓
Content Extraction & Parsing 
    ↓
Structured JSON Generation 
    ↓
Job Description Analysis
    ↓
AI-Powered Match Analysis (Gemini API)
    ↓
Results: Match Score | Skills Gap | ATS Score | Cover Letter
```

### Roadmap Generator Pipeline

```
User Input (Target Role + Timeline)
    ↓
Career Detection & Validation
    ↓
Multi-Source Content Scraping
    ↓
FAISS Vector Indexing (RAG)
    ↓
Context Retrieval + Gemini LLM
    ↓
Structured Roadmap Output
```

---

## Tech Stack

**Frontend:**
- React / Next.js
- Component-based UI with tab navigation
- Color-coded indicators and expandable sections

**Backend:**
- FastAPI (Python 3.8+)
- RESTful API architecture
- JSON-based data storage

**AI & ML:**
- **Google Gemini API** - Language understanding and generation
- **FAISS** - Vector similarity search for RAG
- **Custom Prompt Engineering** - Structured AI instructions
- **RAG Pipeline** - Context-aware content retrieval

**Data Collection:**
- BeautifulSoup + Requests - Web scraping
- YouTube Data API - Video resource search
- Sources: roadmap.sh, GeeksforGeeks, FreeCodeCamp

---

## Project Structure

```
ai-career-analyzer/
│
├── backend/
│   ├── agents/
│   │   ├── dataprocessing.py          # Resume & JD parsing
│   │   ├── job_anayzer_agent.py       # Job matching engine
│   │   ├── market_insights_agent.py   # Market analysis
│   │   └── Roadmap_agent.py           # Roadmap generation
│   │
│   ├── scraping/
│   │   ├── market_insights_scraping.py
│   │   └── Roadmap_data.py            # Multi-source scraper
│   │
│   ├── utils/
│   │   ├── career_retriever.py        # FAISS retrieval
│   │   └── llm_utils.py               # Gemini API utilities
│   │
│   ├── database/                       # Data persistence
│   ├── logs/                          # Application logs
│   ├── prompts/                       # LLM prompt templates
│   ├── .env                           # Environment variables
│   ├── main.py                        # FastAPI application
│   └── requirements.txt               # Python dependencies
│
├── frontend/
│   └── aicareermnV8/                  # React application
│
├── .vscode/                           # VS Code configuration
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm
- Git client
- Google Gemini API key
- YouTube Data API key (optional)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-career-analyzer.git
cd ai-career-analyzer
```

#### 2. Backend Setup

**Navigate to backend directory:**
```bash
cd backend
```

**Create and activate virtual environment:**
```bash
# Create virtual environment
python -m venv aicareermnV8

# Activate environment
# On Windows:
aicareermnV8\Scripts\activate
# On macOS/Linux:
source aicareermnV8/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Setup environment variables:**

Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
LOG_LEVEL=INFO
```

> Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Run the backend server:**
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

#### 3. Frontend Setup

**Navigate to frontend directory:**
```bash
cd ../frontend/aicareermnV8
```

**Install dependencies:**
```bash
npm install
```

**Start development server:**
```bash
npm run dev
```

**Access the application:**

Open `http://localhost:3000` in your browser

---

## Usage

### Job Analyzer

1. **Upload Resume**: Click "Upload" and select your PDF or DOCX resume file
2. **Paste Job Description**: Copy the target job posting and paste it into the input field
3. **Click "Analyze"**: Wait for AI processing (usually 5-10 seconds)
4. **Review Results**:
   - Overall match score and selection probability
   - Matching vs missing skills breakdown
   - ATS optimization suggestions
   - Auto-generated cover letter

### Roadmap Generator

1. **Enter Career Goal**: Type your target role (e.g., "Data Scientist", "Backend Developer")
2. **Set Timeline**: Choose your preferred learning duration (e.g., "3 months", "6 months")
3. **Click "Generate Roadmap"**: AI will create your personalized plan
4. **Explore Your Plan**:
   - Week-by-week learning phases
   - Topics, mini-projects, and time estimates
   - Curated YouTube resources
   - Download for offline access

---

## API Documentation

### Job Analyzer Endpoints

#### Analyze Resume

```http
POST /api/analyze_resume
```

**Request Body:**
```json
{
  "resume": "base64_encoded_file_content",
  "job_description": "Full job description text here..."
}
```

**Response:**
```json
{
  "match_score": 85,
  "selection_probability": "High",
  "matching_skills": [
    {
      "skill": "Python",
      "proficiency": "Advanced",
      "source": "explicit"
    }
  ],
  "missing_skills": [
    {
      "skill": "Docker",
      "importance": "High",
      "suggestion": "Add to technical skills section"
    }
  ],
  "ats_score": 78,
  "ats_keywords": {
    "technical_skills": ["Kubernetes", "CI/CD"],
    "soft_skills": ["Leadership"],
    "tools": ["JIRA"]
  },
  "strengths": ["Strong Python experience", "ML project portfolio"],
  "improvements": ["Quantify project outcomes", "Add Docker experience"]
}
```

### Roadmap Generator Endpoints

#### Generate Career Roadmap

```http
POST /api/get_roadmap
```

**Request Body:**
```json
{
  "career_role": "Data Scientist",
  "duration": "3 months"
}
```

**Response:**
```json
{
  "career_title": "Data Scientist",
  "total_duration": "3 months",
  "weekly_breakdown": [
    {
      "week": 1,
      "topics": ["Python Basics", "Data Structures"],
      "mini_project": "Build a simple calculator",
      "resources": ["https://youtube.com/..."],
      "time_commitment": "10 hours"
    }
  ],
  "recommended_courses": [
    {
      "platform": "FreeCodeCamp",
      "title": "Data Science with Python",
      "url": "https://..."
    }
  ]
}
```

---

## Limitations & Future Roadmap

### Known Limitations

- **Long Content Processing**: The current implementation may struggle with extremely long resumes or job descriptions exceeding the AI model's context window
- **Language Support**: Currently optimized for English-language content only
- **File Format**: Limited to PDF and DOCX formats for resume uploads

### Planned Updates

- [ ] **Advanced Summarization**: Implement Map-Reduce chain for handling longer documents
- [ ] **Multi-Language Support**: Add capabilities for processing content in multiple languages
- [ ] **Resume Version Comparison**: Track improvements across multiple resume iterations
- [ ] **Skill Learning Integration**: Link identified skill gaps directly to learning roadmaps
- [ ] **Progress Tracking**: Monitor roadmap completion with checkpoints
- [ ] **Recruiter Dashboard**: Batch candidate evaluation tools
- [ ] **Historical Analytics**: Job match tracking and trend analysis
- [ ] **PDF Export**: Professional roadmap document generation
- [ ] **Mobile Application**: iOS and Android native apps
- [ ] **Interview Preparation**: Mock interview modules based on job requirements

---

## Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/YourFeatureName
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Use ESLint for JavaScript/React code
- Write unit tests for new features
- Update documentation for API changes
- Add type hints to Python functions

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## Acknowledgments

- **Google Gemini AI** for powerful language understanding capabilities
- **roadmap.sh** for comprehensive career roadmap resources
- **GeeksforGeeks** for technical learning content
- **FreeCodeCamp** for beginner-friendly tutorials
- **FAISS** by Facebook AI for efficient vector search implementation

---

## Support

For questions, issues, or suggestions:

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-career-analyzer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-career-analyzer/discussions)
- **Email**: your.email@example.com

---

## Project Status

**Active Development** - This project is actively maintained and regularly updated with new features.

**Current Version**: v1.0.0

**What's Working:**
- ✅ Resume parsing and structured data extraction
- ✅ Job description analysis
- ✅ Match scoring and skill gap identification
- ✅ ATS optimization recommendations
- ✅ Cover letter auto-generation
- ✅ Career roadmap generation with RAG
- ✅ Multi-source content aggregation

**In Progress:**
- 🔄 Mobile responsive design enhancements
- 🔄 Advanced analytics dashboard
- 🔄 User authentication system

---

