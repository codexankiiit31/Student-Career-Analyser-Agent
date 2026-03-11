// Dashboard.jsx — Gen Z Bento Design
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch, BarChart3, Map, Zap, Target,
  ArrowUpRight, Sparkles, TrendingUp, CheckCircle,
  BrainCircuit, Rocket, Star, Shield
} from 'lucide-react';
import apiService from '../services/api';
import '../Styles/Dashboard.css';

export default function Dashboard() {
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    apiService.healthCheck()
      .then(data => setBackendStatus({ ok: true, data }))
      .catch(() => setBackendStatus({ ok: false }));
  }, []);

  return (
    <div className="db-page">

      {/* ─── HERO ────────────────────────────── */}
      <div className="db-hero">
        <div className="db-hero-eyebrow">
          <Sparkles size={12} /> AI-Powered Career Intelligence
        </div>

        <h1 className="db-hero-title">
          Land Your Dream Job
          <span className="line-2">Faster Than Ever 🚀</span>
        </h1>

        <p className="db-hero-sub">
          Upload your resume, drop a job description — get ATS scores, skill gaps,
          market insights & a roadmap tailored to your career in seconds.
        </p>

        <div className="db-hero-ctas">
          <Link to="/job-analyzer" className="db-cta-primary">
            <Zap size={16} /> Start Analyzing
          </Link>
          <Link to="/roadmap" className="db-cta-secondary">
            <Map size={16} /> Build Roadmap
          </Link>
        </div>

        {backendStatus && (
          <div className="db-status">
            <span className={`db-status-dot ${backendStatus.ok ? '' : 'offline'}`} />
            {backendStatus.ok ? 'AI Backend Online' : 'Backend Offline — Start server'}
          </div>
        )}
      </div>

      {/* ─── BENTO GRID ──────────────────────── */}
      <div className="db-bento">

        {/* Card 1: Job Analyzer — wide tall */}
        <Link to="/job-analyzer" className="db-card db-card--purple db-card--wide db-card--tall" style={{ textDecoration: 'none' }}>
          <div className="db-card-orb" />
          <div className="db-card-arrow"><ArrowUpRight size={16} /></div>
          <div className="db-card-icon"><FileSearch size={22} /></div>
          <div>
            <div className="db-card-tag db-card-tag--purple"><Target size={10} /> Most Used</div>
            <div className="db-card-title">Resume & Job Analyzer</div>
            <div className="db-card-desc">ATS optimization, skill gap analysis, match score & cover letter in one shot.</div>
          </div>
        </Link>

        {/* Card 2: ATS Score stat */}
        <div className="db-card db-card--pink db-card--narrow">
          <div className="db-card-orb" />
          <div className="db-card-label">Avg ATS Boost</div>
          <div className="db-card-stat" style={{ background: 'linear-gradient(135deg,#ec4899,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>+37%</div>
          <div className="db-card-desc">score improvement after optimization</div>
        </div>

        {/* Card 3: Market Analyzer */}
        <Link to="/market-analyzer" className="db-card db-card--blue db-card--narrow" style={{ textDecoration: 'none' }}>
          <div className="db-card-orb" />
          <div className="db-card-arrow"><ArrowUpRight size={16} /></div>
          <div className="db-card-icon"><BarChart3 size={22} /></div>
          <div>
            <div className="db-card-title">Market Intelligence</div>
            <div className="db-card-desc">Salary data, demand level & skill trends for any role.</div>
          </div>
        </Link>

        {/* Card 4: Skills matched stat */}
        <div className="db-card db-card--cyan db-card--small">
          <div className="db-card-orb" />
          <div className="db-card-label">Skills Matched</div>
          <div className="db-card-stat" style={{ background: 'linear-gradient(135deg,#06b6d4,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>92%</div>
          <div className="db-card-desc">accuracy in gap detection</div>
        </div>

        {/* Card 5: Roadmap */}
        <Link to="/roadmap" className="db-card db-card--purple db-card--med" style={{ textDecoration: 'none' }}>
          <div className="db-card-orb" />
          <div className="db-card-arrow"><ArrowUpRight size={16} /></div>
          <div className="db-card-icon"><Map size={22} /></div>
          <div>
            <div className="db-card-tag db-card-tag--purple"><Star size={10} /> Week-by-Week</div>
            <div className="db-card-title">Learning Roadmap</div>
            <div className="db-card-desc">AI-generated path with mini-projects for any career goal.</div>
          </div>
        </Link>

        {/* Card 6: Powered by */}
        <div className="db-card db-card--dark db-card--small">
          <div className="db-card-label">Powered by</div>
          <div className="db-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BrainCircuit size={18} color="#a855f7" /> Gemini AI
          </div>
          <div className="db-card-desc" style={{ marginTop: '0.3rem' }}>+ Groq LLaMA 3.3</div>
        </div>

        {/* Card 7: Cover Letter stat */}
        <div className="db-card db-card--green db-card--small">
          <div className="db-card-orb" />
          <div className="db-card-label">Cover Letter</div>
          <div className="db-card-stat" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</div>
          <div className="db-card-desc">Tailored in seconds</div>
        </div>

        {/* Card 8: Career Chat — wide */}
        <div className="db-card db-card--pink db-card--wide">
          <div className="db-card-orb" />
          <div className="db-card-icon"><Rocket size={22} /></div>
          <div>
            <div className="db-card-tag db-card-tag--pink"><Sparkles size={10} /> New</div>
            <div className="db-card-title">AI Career Chatbot</div>
            <div className="db-card-desc">Ask anything — routes to the right agent automatically. Tap the 🧠 in the bottom-right!</div>
          </div>
        </div>

      </div>

      {/* ─── HOW IT WORKS ────────────────────── */}
      <div className="db-steps">
        <p className="db-steps-title">How it works ⚡</p>
        <div className="db-steps-grid">
          <div className="db-step">
            <div className="db-step-num">01</div>
            <div className="db-step-body">
              <h3>Upload Resume</h3>
              <p>Drop your PDF or DOCX — we extract every detail automatically.</p>
            </div>
          </div>
          <div className="db-step">
            <div className="db-step-num">02</div>
            <div className="db-step-body">
              <h3>Paste Job Description</h3>
              <p>Add any JD from LinkedIn, Naukri, or anywhere else.</p>
            </div>
          </div>
          <div className="db-step">
            <div className="db-step-num">03</div>
            <div className="db-step-body">
              <h3>Get Full AI Report</h3>
              <p>Instant ATS score, match %, missing skills, cover letter & roadmap.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}