// Dashboard.jsx — Clean SaaS-style bento grid
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch, BarChart3, Map, Zap,
  ArrowUpRight, Sparkles, TrendingUp,
  BrainCircuit, Rocket, Star, Target, Mail
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

      {/* ─── HERO ──────────────────────────── */}
      <div className="db-hero">
        <div className="db-hero-eyebrow">
          <Sparkles size={12} /> AI-Powered Career Intelligence
        </div>
        <h1 className="db-hero-title">
          Land Your Dream Job
          <span className="db-hero-gradient"> Faster Than Ever 🚀</span>
        </h1>
        <p className="db-hero-sub">
          Upload your resume, paste a job description — get ATS scores, skill gaps,
          market insights & a roadmap tailored to you. All in seconds.
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

      {/* ─── BENTO GRID ─────────────────────── */}
      <div className="db-bento">

        {/* ROW 1 ── Main feature (large) + two stat cards stacked */}
        <div className="db-bento-row db-bento-row--asymmetric">

          {/* Main: Resume & Job Analyzer */}
          <Link to="/job-analyzer" className="db-card db-card--purple db-card--main" style={{ textDecoration: 'none' }}>
            <div className="db-card-orb" />
            <div className="db-card-arrow"><ArrowUpRight size={16} /></div>

            {/* Top section */}
            <div className="db-card-top">
              <div className="db-card-icon"><FileSearch size={24} /></div>
              <div className="db-card-tag db-card-tag--purple">
                <Target size={10} /> Most Used
              </div>
              <div className="db-card-title">Resume &amp; Job Analyzer</div>
              <div className="db-card-desc">
                Upload your resume and any job description — get a complete AI report instantly.
              </div>
            </div>

            {/* Feature chips */}
            <div className="db-card-features">
              <span className="db-feat-chip">✅ ATS Score</span>
              <span className="db-feat-chip">🎯 Skill Gap</span>
              <span className="db-feat-chip">📊 Match %</span>
              <span className="db-feat-chip">💌 Cover Letter</span>
            </div>
          </Link>

          {/* Stack: two stat cards */}
          <div className="db-card-stack">
            <div className="db-card db-card--pink db-card--stat">
              <div className="db-card-orb" />
              <div className="db-card-label">Avg ATS Boost</div>
              <div className="db-card-stat db-stat--pink">+37%</div>
              <div className="db-card-desc">score improvement after optimization</div>
            </div>
            <div className="db-card db-card--cyan db-card--stat">
              <div className="db-card-orb" />
              <div className="db-card-label">Skills Matched</div>
              <div className="db-card-stat db-stat--cyan">92%</div>
              <div className="db-card-desc">accuracy in gap detection</div>
            </div>
          </div>

        </div>

        {/* ROW 2 ── Three equal feature cards */}
        <div className="db-bento-row db-bento-row--thirds">

          <Link to="/market-analyzer" className="db-card db-card--blue" style={{ textDecoration: 'none' }}>
            <div className="db-card-orb" />
            <div className="db-card-arrow"><ArrowUpRight size={16} /></div>
            <div className="db-card-icon"><BarChart3 size={22} /></div>
            <div className="db-card-title">Market Intelligence</div>
            <div className="db-card-desc">Salary data, demand level & skill trends for any role.</div>
          </Link>

          <Link to="/roadmap" className="db-card db-card--purple" style={{ textDecoration: 'none' }}>
            <div className="db-card-orb" />
            <div className="db-card-arrow"><ArrowUpRight size={16} /></div>
            <div className="db-card-icon"><Map size={22} /></div>
            <div className="db-card-tag db-card-tag--purple"><Star size={10} /> Week-by-Week</div>
            <div className="db-card-title">Learning Roadmap</div>
            <div className="db-card-desc">AI-generated plan with mini-projects for any career goal.</div>
          </Link>

          <Link to="/job-analyzer" className="db-card db-card--green" style={{ textDecoration: 'none' }}>
            <div className="db-card-orb" />
            <div className="db-card-arrow"><ArrowUpRight size={16} /></div>
            <div className="db-card-icon"><Mail size={22} /></div>
            <div className="db-card-label">Cover Letter</div>
            <div className="db-card-stat db-stat--green">AI</div>
            <div className="db-card-desc">Tailored to your resume & JD in seconds.</div>
          </Link>

        </div>

        {/* ROW 3 ── Chatbot (wide) + Powered By */}
        <div className="db-bento-row db-bento-row--chatrow">

          <div className="db-card db-card--pink db-card--chatbot">
            <div className="db-card-orb" />
            <div className="db-card-icon"><Rocket size={22} /></div>
            <div className="db-card-tag db-card-tag--pink"><Sparkles size={10} /> New</div>
            <div className="db-card-title">AI Career Chatbot</div>
            <div className="db-card-desc">
              Ask anything — auto-routes to the right agent. Tap the 🧠 in the bottom-right!
            </div>
          </div>

          <div className="db-card db-card--dark db-card--poweredby">
            <div className="db-card-label">Powered by</div>
            <div className="db-powered-row">
              <BrainCircuit size={20} color="#a855f7" />
              <span className="db-card-title">Gemini AI</span>
            </div>
            <div className="db-card-desc">+ Groq LLaMA 3.3</div>
            <div className="db-trust-badges">
              <span className="db-badge"><TrendingUp size={11} /> Live Data</span>
              <span className="db-badge"><Star size={11} /> RAG</span>
            </div>
          </div>

        </div>

      </div>

      {/* ─── HOW IT WORKS ──────────────────── */}
      <div className="db-steps">
        <p className="db-steps-title">How it works ⚡</p>
        <div className="db-steps-grid">
          {[
            { n: '01', h: 'Upload Resume', p: 'Drop your PDF or DOCX — we extract every detail automatically.' },
            { n: '02', h: 'Paste Job Description', p: 'Add any JD from LinkedIn, Naukri, or anywhere else.' },
            { n: '03', h: 'Get Full AI Report', p: 'Instant ATS score, match %, missing skills, cover letter & roadmap.' },
          ].map(({ n, h, p }) => (
            <div className="db-step" key={n}>
              <div className="db-step-num">{n}</div>
              <div className="db-step-body">
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}