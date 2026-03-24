// MarketAnalyzer.jsx — Reads actual backend shape from CareerMarketOutput Pydantic model
// Backend returns: { career, skills, declining_skills, career_growth, salary, summary_advice, sources, location, experience_level }

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  IndianRupee,
  Lightbulb,
  Wrench,
  Star,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Target,
  BookOpen
} from "lucide-react";
import "../Styles/MarketAnalyzer.css";
import apiService from "../services/api";


/* ────────────────────────────────────────
   SUBCOMPONENTS
──────────────────────────────────────── */

const SkillChip = ({ text, type = "core" }) => (
  <span className={`ma-chip ma-chip--${type}`}>{text}</span>
);

const SectionCard = ({ icon: Icon, title, color = "#6366f1", children }) => (
  <motion.div
    className="ma-section-card"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <div className="ma-section-header" style={{ borderLeftColor: color }}>
      <Icon size={18} color={color} />
      <h3>{title}</h3>
    </div>
    <div className="ma-section-body">{children}</div>
  </motion.div>
);

const DemandBadge = ({ level }) => {
  const map = {
    High: { cls: "high", label: "🔥 High Demand" },
    Medium: { cls: "medium", label: "⚡ Medium Demand" },
    Low: { cls: "low", label: "📉 Low Demand" },
  };
  const info = map[level] || { cls: "medium", label: level };
  return <span className={`ma-demand-badge ma-demand--${info.cls}`}>{info.label}</span>;
};

const FutureBadge = ({ scope }) => {
  const map = {
    Strong: { cls: "strong", label: "📈 Strong Future" },
    Stable: { cls: "stable", label: "➡️ Stable Future" },
    Declining: { cls: "declining", label: "⚠️ Declining" },
  };
  const info = map[scope] || { cls: "stable", label: scope };
  return <span className={`ma-future-badge ma-future--${info.cls}`}>{info.label}</span>;
};

const SourceItem = ({ url, index }) => {
  const domain = (() => {
    try { return new URL(url).hostname.replace("www.", ""); }
    catch { return url; }
  })();
  return (
    <a href={url} target="_blank" rel="noreferrer" className="ma-source-link">
      <ExternalLink size={12} />
      {domain}
    </a>
  );
};

/* ────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────── */

export default function MarketAnalyzer() {
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem("ma_form");
    return saved ? JSON.parse(saved) : { role: "", location: "", experience_level: "entry" };
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState(() => {
    const saved = sessionStorage.getItem("ma_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const pollRef = React.useRef(null);  // holds the setInterval ID
  const isMountedRef = React.useRef(true);

  // Progressive loading messages shown during polling
  const LOADING_STEPS = [
    "🔍 Searching SerpAPI for market reports...",
    "📄 Scraping Glassdoor, Naukri, Coursera...",
    "🧠 AI agent is compiling skills & salary data...",
    "⚡ Almost there, finalising analysis...",
  ];

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Preserve form and data in sessionStorage
  useEffect(() => {
    sessionStorage.setItem("ma_form", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (data) {
      sessionStorage.setItem("ma_data", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("ma_data");
    }
  }, [data]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role.trim()) return;

    setError(null);
    setLoading(true);
    setLoadingStep(0);
    setData(null);
    setShowSources(false);
    stopPolling();

    let jobId;
    try {
      const res = await apiService.analyzeMarket({
        role: form.role.trim(),
        location: form.location.trim() || null,
        experience_level: form.experience_level,
      });
      jobId = res.job_id;
    } catch (err) {
      setLoading(false);
      setError(err?.detail || err?.error || "Failed to start analysis. Please try again.");
      return;
    }

    // Advance loading message every 7 seconds
    let step = 0;
    const stepTimer = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      if (isMountedRef.current) setLoadingStep(step);
    }, 7000);

    // Poll status every 3 seconds
    pollRef.current = setInterval(async () => {
      try {
        const status = await apiService.getMarketStatus(jobId);
        if (!isMountedRef.current) { clearInterval(stepTimer); stopPolling(); return; }

        if (status.status === "done") {
          clearInterval(stepTimer);
          stopPolling();
          const resultData = status.data;
          if (!resultData?.career) throw new Error("Invalid response from server");
          sessionStorage.setItem("ma_data", JSON.stringify(resultData));
          setData(resultData);
          setLoading(false);
          setTimeout(() => {
            document.getElementById("ma-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 200);
        } else if (status.status === "error") {
          clearInterval(stepTimer);
          stopPolling();
          setLoading(false);
          setError("Analysis failed on the server. Please try again.");
        }
        // "pending" or "processing" — keep polling
      } catch (err) {
        clearInterval(stepTimer);
        stopPolling();
        if (isMountedRef.current) {
          setLoading(false);
          setError(err?.detail || err?.error || "Something went wrong while checking job status.");
        }
      }
    }, 3000);
  };

  // Derived from backend Pydantic CareerMarketOutput
  const skills = data?.skills ?? {};
  const careerGrowth = data?.career_growth ?? {};
  const salary = data?.salary ?? {};
  const decliningSkills = data?.declining_skills ?? [];
  const sources = data?.sources ?? [];

  return (
    <div className="ma-page">

      {/* ─── HERO ──────────────────────────────── */}
      <div className="ma-hero">
        <motion.div
          className="ma-hero-inner"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="ma-hero-text">
            <h1><BarChart3 size={28} /> AI Market Intelligence</h1>
            <p>Search any career role and get live market analysis — skills, salary, demand, and future scope.</p>
          </div>

          <form className="ma-search-form" onSubmit={handleSubmit}>
            <div className="ma-search-row">
              <div className="ma-field">
                <label>Job Role *</label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Data Scientist, Full Stack Developer"
                  required
                  autoFocus
                />
              </div>
              <div className="ma-field ma-field--sm">
                <label>Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore (optional)"
                />
              </div>
              <div className="ma-field ma-field--xs">
                <label>Experience</label>
                <select name="experience_level" value={form.experience_level} onChange={handleChange}>
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
              <button className="ma-search-btn" type="submit" disabled={loading}>
                {loading ? <Loader2 size={18} className="ma-spin" /> : <Search size={18} />}
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* ─── RESULTS ───────────────────────────── */}
      <div id="ma-results" className="ma-results-area">

        {/* Loading */}
        {loading && (
          <div className="ma-loading-box">
            <Loader2 size={36} className="ma-spin" />
            <p>{LOADING_STEPS[loadingStep]}</p>
            <span className="ma-loading-note">Live web scraping takes 10–20 seconds</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="ma-error-box">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Placeholder */}
        {!loading && !data && !error && (
          <div className="ma-placeholder">
            <Target size={48} />
            <h3>Enter a job role above to get started</h3>
            <p>We'll scrape real-time market data and generate a complete career intelligence report.</p>
          </div>
        )}

        {/* ─── DASHBOARD ─────────────────────── */}
        <AnimatePresence>
          {data && !loading && (
            <motion.div
              key="dashboard"
              className="ma-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Role Title Bar */}
              <div className="ma-role-bar">
                <div className="ma-role-info">
                  <h2>{data.career}</h2>
                  {data.location && <span className="ma-role-tag">📍 {data.location}</span>}
                  <span className="ma-role-tag">👤 {data.experience_level} level</span>
                </div>
                <div className="ma-role-badges">
                  {careerGrowth.current_demand && <DemandBadge level={careerGrowth.current_demand} />}
                  {careerGrowth.future_scope && <FutureBadge scope={careerGrowth.future_scope} />}
                </div>
              </div>

              {/* ─── SALARY CARDS ─── */}
              <div className="ma-salary-row">
                <div className="ma-salary-card ma-salary-card--india">
                  <div className="ma-salary-icon"><IndianRupee size={22} /></div>
                  <div>
                    <p className="ma-salary-label">India Salary</p>
                    <p className="ma-salary-range">{salary?.india?.average_range || "N/A"}</p>
                    <p className="ma-salary-desc">{salary?.india?.description || ""}</p>
                  </div>
                </div>
                <div className="ma-salary-card ma-salary-card--global">
                  <div className="ma-salary-icon"><Globe size={22} /></div>
                  <div>
                    <p className="ma-salary-label">Global Salary</p>
                    <p className="ma-salary-range">{salary?.abroad?.average_range || "N/A"}</p>
                    <p className="ma-salary-desc">{salary?.abroad?.description || ""}</p>
                  </div>
                </div>
                <div className="ma-salary-card ma-salary-card--summary">
                  <div className="ma-salary-icon"><DollarSign size={22} /></div>
                  <div>
                    <p className="ma-salary-label">Earning Potential</p>
                    <p className="ma-salary-summary">{salary?.salary_summary || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* ─── SKILLS ROW ─── */}
              <div className="ma-skills-grid">

                <SectionCard icon={Star} title="Core Skills" color="#10b981">
                  <div className="ma-chips">
                    {(skills.core || []).length === 0 && <p className="ma-no-data">No data</p>}
                    {(skills.core || []).map((s, i) => <SkillChip key={i} text={s} type="core" />)}
                  </div>
                </SectionCard>

                <SectionCard icon={Wrench} title="Tools & Technologies" color="#6366f1">
                  <div className="ma-chips">
                    {(skills.tools || []).length === 0 && <p className="ma-no-data">No data</p>}
                    {(skills.tools || []).map((s, i) => <SkillChip key={i} text={s} type="tools" />)}
                  </div>
                </SectionCard>

                <SectionCard icon={Lightbulb} title="Nice to Have" color="#f59e0b">
                  <div className="ma-chips">
                    {(skills.nice_to_have || []).length === 0 && <p className="ma-no-data">No data</p>}
                    {(skills.nice_to_have || []).map((s, i) => <SkillChip key={i} text={s} type="nice" />)}
                  </div>
                </SectionCard>

                <SectionCard icon={TrendingDown} title="Declining Skills" color="#ef4444">
                  <div className="ma-chips">
                    {decliningSkills.length === 0 && <p className="ma-no-data">No data</p>}
                    {decliningSkills.map((s, i) => <SkillChip key={i} text={s} type="declining" />)}
                  </div>
                </SectionCard>

              </div>

              {/* ─── CAREER GROWTH ─── */}
              <div className="ma-growth-grid">
                <SectionCard icon={TrendingUp} title="Current Market Demand" color="#10b981">
                  {careerGrowth.current_demand && <DemandBadge level={careerGrowth.current_demand} />}
                  <p className="ma-growth-text">{careerGrowth.demand_summary || "—"}</p>
                </SectionCard>

                <SectionCard icon={Zap} title="Future Scope" color="#8b5cf6">
                  {careerGrowth.future_scope && <FutureBadge scope={careerGrowth.future_scope} />}
                  <p className="ma-growth-text">{careerGrowth.future_summary || "—"}</p>
                </SectionCard>
              </div>

              {/* ─── ADVICE ─── */}
              {data.summary_advice && (
                <SectionCard icon={BookOpen} title="Career Advice for Students" color="#f59e0b">
                  <p className="ma-advice-text">{data.summary_advice}</p>
                </SectionCard>
              )}

              {/* ─── SOURCES ─── */}
              {sources.length > 0 && (
                <div className="ma-sources-section">
                  <button
                    className="ma-sources-toggle"
                    onClick={() => setShowSources(v => !v)}
                  >
                    <ExternalLink size={15} />
                    {showSources ? "Hide" : "Show"} {sources.length} sources used
                    {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showSources && (
                    <div className="ma-sources-list">
                      {sources.map((url, i) => <SourceItem key={i} url={url} index={i} />)}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
