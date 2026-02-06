# 🎯 AI Career Agent

> An intelligent multi-agent system that helps students optimize their resumes, analyze job markets, and plan their career roadmap using AI-powered insights.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![LangChain](https://img.shields.io/badge/LangChain-LCEL-green.svg)](https://www.langchain.com/)
[![Gemini API](https://img.shields.io/badge/Gemini-API-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Agent Details](#-agent-details)
- [Installation](#-installation)
- [Usage](#-usage)
- [Tech Stack](#-tech-stack)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AI Career Agent** is a comprehensive career guidance platform powered by multiple AI agents that work together to provide students with actionable insights for their job search journey. The system analyzes resumes, matches them with job descriptions, provides ATS optimization suggestions, generates personalized cover letters, analyzes market trends, and creates customized learning roadmaps.

---

## 🎯 Problem Statement

Students face significant challenges in the job application process:

- **Resume shortlisting failures** due to poor ATS compatibility
- **Lack of insight** into why their applications are rejected
- **Uncertainty** about skill gaps and market demands
- **No clear roadmap** for skill development
- **Difficulty** in crafting compelling cover letters

**AI Career Agent** solves these problems through intelligent automation and data-driven insights.

---

## ✨ Features

### 🔍 Agent 1: Job Analyzer Agent

#### 1. **Resume Parsing**
- Extracts technical skills, soft skills, and competencies
- Analyzes years of experience and education details
- Identifies key achievements and projects
- Maps industry experience and leadership roles

#### 2. **Job Description Parsing**
- Extracts required technical and soft skills
- Identifies experience and education requirements
- Analyzes company culture indicators
- Determines job level (entry/mid/senior)

#### 3. **Match Analysis**
- **Overall Match Percentage**: Calculates compatibility score
- **Selection Probability**: Predicts chances of getting shortlisted
- **Skill Gap Analysis**: Identifies matching and missing skills
- **Evidence-Based Insights**: Provides specific examples from resume

#### 4. **ATS Optimization**
- **ATS Score**: Measures resume compatibility with ATS systems
- **Missing Keywords**: Identifies critical keywords to add
- **Keyword Density Analysis**: Suggests optimal keyword frequency
- **Formatting Recommendations**: Provides section-wise improvement suggestions
- **Section Organization**: Recommends better structure

#### 5. **Cover Letter Generation**
- Creates personalized 250-300 word cover letters
- Includes compelling opening hooks and call-to-action
- Maps resume achievements to job requirements
- Highlights cultural alignment with company

---

### 📊 Agent 2: Market Analysis Agent

#### Features:
- **Web Scraping**: Collects real-time market data for specific roles
- **Skill Analysis**: Identifies core skills, tools, and nice-to-have skills
- **Declining Skills**: Highlights outdated technologies to avoid
- **Career Growth Insights**: Analyzes current demand and future scope
- **Salary Information**: Provides salary ranges for India and abroad (fresher/mid/senior levels)
- **Career Advice**: Offers practical guidance for students

**Example Output:**
```json
{
  "career": "Full Stack Developer",
  "skills": {
    "core": ["HTML", "CSS", "JavaScript"],
    "tools": ["React", "Node.js", "MongoDB", "Git"],
    "nice_to_have": ["Docker", "Cloud platforms"]
  },
  "declining_skills": [
    "Traditional jQuery-heavy development is becoming less relevant"
  ],
  "career_growth": {
    "current_demand": "High",
    "future_scope": "Positive due to continued growth of web-based platforms"
  },
  "salary": {
    "india": {
      "fresher": "4–8 LPA",
      "mid": "10–18 LPA",
      "senior": "25+ LPA"
    },
    "abroad": {
      "fresher": "$70,000",
      "mid": "$100,000",
      "senior": "$150,000"
    }
  }
}
```

---

### 🗺️ Agent 3: Roadmap Agent

#### Features:
- **Web Scraping**: Gathers comprehensive learning resources for specific roles
- **RAG Pipeline**: Uses Retrieval-Augmented Generation for accurate roadmap creation
- **Personalized Learning Path**: Creates step-by-step career development roadmap
- **Resource Recommendations**: Suggests courses, tutorials, and certifications
- **Timeline Estimation**: Provides realistic learning timelines

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (UI)                        │
│         Dashboard | Job Analyzer | Market | Roadmap     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  LangChain LCEL Pipeline                │
└─────────┬───────────────┬───────────────┬───────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Agent 1   │  │   Agent 2   │  │   Agent 3   │
│     Job     │  │   Market    │  │   Roadmap   │
│   Analyzer  │  │   Analysis  │  │   Creator   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       │                ▼                │
       │         ┌─────────────┐         │
       │         │ Web Scraper │         │
       │         └─────────────┘         │
       │                                 │
       ▼                                 ▼
┌─────────────┐                  ┌─────────────┐
│  Gemini AI  │                  │ RAG Pipeline│
│     LLM     │                  │   Vector DB │
└─────────────┘                  └─────────────┘
```

---

## 🤖 Agent Details

### Agent 1: Job Analyzer Agent

**Purpose**: Analyzes resumes and job descriptions to provide comprehensive matching insights.

**Workflow**:
1. **Input**: User uploads resume (PDF/DOCX) and job description
2. **Resume Parsing**: LLM extracts structured data using Pydantic output parser
3. **Job Description Parsing**: LLM extracts job requirements in JSON format
4. **Match Analysis**: Senior ATS engine evaluates compatibility
5. **Output**: Match scores, skill gaps, ATS recommendations, and cover letter

**Key Prompts**:

#### Resume Parsing Prompt:
```
Analyze this resume and provide a detailed JSON with:
1. Technical skills
2. Soft skills
3. Years of experience
4. Education details
5. Key achievements
6. Core competencies
7. Industry experience
8. Leadership experience
9. Technologies used
10. Projects completed

IMPORTANT: Respond ONLY with valid JSON format, no additional text.
```

#### Match Analysis Prompt:
```
You are a senior ATS engine, resume evaluator, and job-match scoring expert.
Analyze the provided resume and job description and generate a complete JSON evaluation.

IMPORTANT RULES:
• Respond ONLY with a valid JSON object
• DO NOT invent experience, skills, or facts not found in the resume
• All judgments must be evidence-based
• Provide only essential insights
```

**Output Metrics**:
- Overall Match Percentage (0-100%)
- Selection Probability (0-100%)
- Matching Skills vs Missing Skills ratio
- ATS Compatibility Score (0-100%)

---

### Agent 2: Market Analysis Agent

**Purpose**: Provides real-time career market insights and salary trends.

**Workflow**:
1. **Input**: User enters desired job role (e.g., "Java Developer")
2. **Web Scraping**: Collects data from multiple job portals and career sites
3. **Data Processing**: LLM analyzes raw market text
4. **Output**: Structured insights on skills, demand, salary, and career advice

**Key Prompt**:
```
You are a career market analyst helping students understand real-world career trends.

RULES (IMPORTANT):
- Use ONLY the information present in the RAW market text
- Do NOT use outside knowledge
- Be honest, realistic, and conservative
- Output MUST be valid JSON only
```

**Analysis Categories**:
- **Core Skills**: Fundamental skills repeatedly emphasized
- **Tools & Technologies**: Frameworks and platforms mentioned
- **Nice-to-Have Skills**: Optional secondary skills
- **Declining Skills**: Outdated technologies losing relevance
- **Career Growth**: Current demand (High/Medium/Low) and future scope
- **Salary Ranges**: India and abroad, across experience levels

---

### Agent 3: Roadmap Agent

**Purpose**: Creates personalized learning roadmaps with curated resources.

**Workflow**:
1. **Input**: User requests roadmap for specific role
2. **Web Scraping**: Gathers learning resources, courses, and best practices
3. **RAG Pipeline**: Stores and retrieves relevant information
4. **LLM Generation**: Creates structured learning path
5. **Output**: Step-by-step roadmap with resources and timeline

**Features**:
- Skill progression from beginner to advanced
- Recommended courses and certifications
- Project ideas for portfolio building
- Estimated learning timelines
- Community resources and forums

---

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Gemini API key

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/ai-career-agent.git
cd ai-career-agent
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 5: Run the Application

```bash
python app.py
```

Navigate to `http://localhost:3000` in your browser.

---

## 💻 Usage

### 1. Job Analyzer

**Step 1**: Navigate to the **Job Analyzer** tab

**Step 2**: Upload your resume (PDF/DOCX format)

**Step 3**: Paste the job description

**Step 4**: Click **Analyze**

**Step 5**: Review results across four tabs:
- **Skills Analysis**: See matching and missing skills
- **ATS Optimization**: Get ATS score and improvement suggestions
- **Cover Letter**: Download personalized cover letter

### 2. Market Analyzer

**Step 1**: Navigate to the **Market Analyzer** tab

**Step 2**: Enter job role (e.g., "Data Scientist")

**Step 3**: Click **Analyze Market**

**Step 4**: Review insights on:
- Required skills and tools
- Salary ranges
- Career growth potential
- Expert advice

### 3. Roadmap Generator

**Step 1**: Navigate to the **Roadmap** tab

**Step 2**: Enter your target role

**Step 3**: Click **Generate Roadmap**

**Step 4**: Explore personalized learning path with resources

---

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**: Core programming language
- **LangChain**: LCEL pipeline for agent orchestration
- **Pydantic**: Structured output parsing
- **Gemini API**: LLM for intelligent analysis
- **BeautifulSoup/Scrapy**: Web scraping

### Frontend
- **React.js**: UI framework
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

### AI/ML
- **LangChain LCEL**: Chain orchestration
- **Google Gemini**: Language model
- **RAG Pipeline**: Vector database for roadmap generation
- **JSON Output Parsers**: Structured data extraction

### Database
- **Vector Database**: For RAG pipeline (Roadmap Agent)

---

## 📡 API Documentation

### Endpoint: `/analyze-job`

**Method**: `POST`

**Request Body**:
```json
{
  "resume": "base64_encoded_resume",
  "job_description": "Full job description text"
}
```

**Response**:
```json
{
  "summary": {
    "overall_match_percentage": 65,
    "selection_probability": 70
  },
  "match_analysis": {
    "matching_skills": [...],
    "missing_skills": [...]
  },
  "ats_optimization": {
    "ats_score": 75,
    "missing_keywords": {...}
  },
  "cover_letter": "Generated cover letter text..."
}
```

### Endpoint: `/analyze-market`

**Method**: `POST`

**Request Body**:
```json
{
  "job_role": "Full Stack Developer"
}
```

**Response**:
```json
{
  "career": "Full Stack Developer",
  "skills": {...},
  "salary": {...},
  "career_growth": {...}
}
```

---

## 📸 Screenshots

### Job Analyzer - Skills Analysis
![Skills Analysis](screenshots/skills-analysis.png)
- Overall Match: **65%**
- Selection Probability: **70%**
- Matching vs Missing Skills: **9/7**

### ATS Optimization
![ATS Optimization](screenshots/ats-optimization.png)
- ATS Compatibility Score: **75%**
- Missing keywords categorized by type
- Actionable recommendations

### Cover Letter Generator
![Cover Letter](screenshots/cover-letter.png)
- Professional 268-word cover letter
- Copy, Download, and Print options
- Personalized based on resume and job description

---

## 🔮 Future Enhancements

- [ ] **Multi-language support** for global users
- [ ] **Interview preparation module** with mock interviews
- [ ] **Resume builder** with ATS-optimized templates
- [ ] **LinkedIn profile optimization**
- [ ] **Job application tracker**
- [ ] **Salary negotiation insights**
- [ ] **Skill assessment tests**
- [ ] **Company culture analysis**
- [ ] **Networking recommendations**
- [ ] **Chrome extension** for one-click job analysis

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow PEP 8 style guide for Python code
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- **Google Gemini** for providing powerful LLM capabilities
- **LangChain** for the excellent framework
- **Open source community** for various libraries and tools

---

## 📞 Contact

For questions or support, please reach out:

- **Email**: your.email@example.com
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

## 🌐 Demo

Check out the live demo: [AI Career Agent Demo](https://your-demo-link.com)

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/ai-career-agent&type=Date)](https://star-history.com/#yourusername/ai-career-agent&Date)

---

<div align="center">

**Made with ❤️ for students worldwide**

[Report Bug](https://github.com/yourusername/ai-career-agent/issues) · [Request Feature](https://github.com/yourusername/ai-career-agent/issues)

</div>
