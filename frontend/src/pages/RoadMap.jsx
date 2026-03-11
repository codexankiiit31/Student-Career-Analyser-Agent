// RoadMap.jsx — Interactive week-by-week timeline with download
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  BookOpen,
  Wrench,
  Target,
  Clock,
  Lightbulb,
  CheckCircle,
  Zap,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import "../Styles/RoadMap.css";

const PHASE_COLORS = {
  Beginner: { bg: "#10b981", light: "rgba(16,185,129,0.12)", text: "#34d399" },
  Intermediate: { bg: "#6366f1", light: "rgba(99,102,241,0.12)", text: "#a5b4fc" },
  Advanced: { bg: "#f59e0b", light: "rgba(245,158,11,0.12)", text: "#fbbf24" },
};

/* ─── Sub-components ────────────────────── */

const PhasePill = ({ phase }) => {
  const c = PHASE_COLORS[phase] || PHASE_COLORS.Beginner;
  return (
    <span className="rm-phase-pill" style={{ background: c.light, color: c.text, borderColor: c.bg }}>
      {phase}
    </span>
  );
};

const WeekCard = ({ week, index, isOpen, onToggle }) => {
  const phase = week.phase || "Beginner";
  const c = PHASE_COLORS[phase] || PHASE_COLORS.Beginner;
  const topics = Array.isArray(week.topics) ? week.topics : [week.topics].filter(Boolean);
  const resources = Array.isArray(week.resources) ? week.resources : [week.resources].filter(Boolean);

  return (
    <div className="rm-week-wrapper">
      {/* Timeline dot */}
      <div className="rm-timeline-dot" style={{ background: c.bg }}>
        <span className="rm-week-num">{week.week_number || index + 1}</span>
      </div>

      <motion.div
        className="rm-week-card"
        style={{ borderLeftColor: c.bg }}
        layout
      >
        {/* Header — always visible */}
        <button className="rm-week-header" onClick={onToggle}>
          <div className="rm-week-header-left">
            <PhasePill phase={phase} />
            <h3 className="rm-week-title">
              Week {week.week_number || index + 1}: {week.title}
            </h3>
          </div>
          <div className="rm-week-header-right">
            {week.time_commitment && (
              <span className="rm-time-badge">
                <Clock size={13} /> {week.time_commitment}
              </span>
            )}
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              className="rm-week-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="rm-week-content">
                {/* Topics */}
                {topics.length > 0 && (
                  <div className="rm-section">
                    <div className="rm-section-title">
                      <BookOpen size={15} style={{ color: c.text }} />
                      Topics to Learn
                    </div>
                    <ul className="rm-topic-list">
                      {topics.map((t, i) => (
                        <li key={i} style={{ "--dot-color": c.bg }}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mini Project */}
                {week.mini_project && (
                  <div className="rm-section rm-project-box" style={{ borderColor: c.bg, background: c.light }}>
                    <div className="rm-section-title">
                      <Target size={15} style={{ color: c.text }} />
                      Mini Project
                    </div>
                    <p className="rm-project-text">{week.mini_project}</p>
                  </div>
                )}

                {/* Resources */}
                {resources.length > 0 && (
                  <div className="rm-section">
                    <div className="rm-section-title">
                      <Wrench size={15} style={{ color: c.text }} />
                      Resources
                    </div>
                    <div className="rm-resource-list">
                      {resources.map((r, i) => (
                        <span key={i} className="rm-resource-chip">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ─── Download helper ───────────────────── */

const buildDownloadText = (career, form, data) => {
  const weeks = data?.weeks || [];
  const tips = data?.pro_tips || [];
  const outcomes = data?.outcomes || [];

  const weekLines = weeks.map(w => {
    const topics = Array.isArray(w.topics) ? w.topics.join(", ") : w.topics;
    return [
      `WEEK ${w.week_number}: ${w.title} [${w.phase}]`,
      `  Time: ${w.time_commitment || "N/A"}`,
      `  Topics: ${topics}`,
      `  Mini Project: ${w.mini_project || "N/A"}`,
      `  Resources: ${(w.resources || []).join(", ") || "N/A"}`,
    ].join("\n");
  }).join("\n\n");

  return `
CAREER ROADMAP: ${career}
Goal: ${form.course}
Duration: ${form.duration} months
Generated: ${new Date().toLocaleDateString()}

${"=".repeat(60)}
WEEK-BY-WEEK PLAN
${"=".repeat(60)}
${weekLines}

${"=".repeat(60)}
PRO TIPS
${"=".repeat(60)}
${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

${"=".repeat(60)}
EXPECTED OUTCOMES
${"=".repeat(60)}
${outcomes.map((o, i) => `${i + 1}. ${o}`).join("\n")}
  `.trim();
};

/* ─── Main Component ────────────────────── */

export default function RoadMap() {
  const [form, setForm] = useState({ course: "", duration: "3", technology: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);          // structured roadmap JSON
  const [openWeeks, setOpenWeeks] = useState({});   // { [weekIndex]: bool }
  const [expandAll, setExpandAll] = useState(false);

  const weeks = data?.weeks || [];
  const phases = data?.phases || [];

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.course.trim()) { setError("Please enter a course name."); return; }

    setLoading(true);
    setError("");
    setData(null);
    setOpenWeeks({});
    setExpandAll(false);

    const query = form.technology
      ? `Give me a ${form.duration}-month roadmap to become a ${form.course} focusing on ${form.technology}`
      : `Give me a ${form.duration}-month roadmap to become a ${form.course}`;

    try {
      const res = await fetch("http://localhost:8000/api/get_roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const json = await res.json();
      const roadmap = json?.data ?? json;

      if (!roadmap?.weeks?.length) throw new Error("No week data returned from server.");
      setData(roadmap);

      // Auto-open first week
      setOpenWeeks({ 0: true });
      setTimeout(() => {
        document.getElementById("rm-results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);

    } catch (err) {
      setError(err.message || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (i) => setOpenWeeks(p => ({ ...p, [i]: !p[i] }));

  const toggleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    const state = {};
    weeks.forEach((_, i) => state[i] = next);
    setOpenWeeks(state);
  };

  const handleDownload = () => {
    if (!data) return;
    const text = buildDownloadText(data.career || form.course, form, data);
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    a.download = `${(data.career || form.course).replace(/\s+/g, "_")}_roadmap.txt`;
    a.click();
  };

  return (
    <div className="rm-page">

      {/* ─── HERO FORM ─────────────────────────── */}
      <div className="rm-hero">
        <motion.div
          className="rm-hero-inner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rm-hero-text">
            <h1><Map size={26} /> Career Roadmap Generator</h1>
            <p>Generate a personalised, week-by-week AI learning path for any career goal.</p>
          </div>

          <form className="rm-form" onSubmit={handleSubmit}>
            <div className="rm-form-row">
              <div className="rm-field rm-field--lg">
                <label>Career Goal *</label>
                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer, Data Scientist"
                  required autoFocus
                />
              </div>
              <div className="rm-field rm-field--sm">
                <label>Duration (months)</label>
                <select name="duration" value={form.duration} onChange={handleChange}>
                  {["1", "2", "3", "4", "6", "9", "12"].map(v => (
                    <option key={v} value={v}>{v} month{v !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="rm-field rm-field--md">
                <label>Technology Focus (optional)</label>
                <input
                  name="technology"
                  value={form.technology}
                  onChange={handleChange}
                  placeholder="e.g. React, Python, AI"
                />
              </div>
              <button className="rm-submit-btn" type="submit" disabled={loading}>
                {loading
                  ? <><Loader2 size={16} className="rm-spin" /> Generating…</>
                  : <><Map size={16} /> Generate Roadmap</>
                }
              </button>
            </div>
            {error && (
              <div className="rm-error"><AlertCircle size={15} /> {error}</div>
            )}
          </form>
        </motion.div>
      </div>

      {/* ─── LOADING ───────────────────────────── */}
      {loading && (
        <div className="rm-loading">
          <Loader2 size={38} className="rm-spin" />
          <p>Building your personalised roadmap…</p>
          <span>This usually takes 15–30 seconds</span>
        </div>
      )}

      {/* ─── RESULTS ───────────────────────────── */}
      <AnimatePresence>
        {data && !loading && (
          <motion.div
            id="rm-results"
            className="rm-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title bar */}
            <div className="rm-title-bar">
              <div className="rm-title-left">
                <h2>{data.career || form.course}</h2>
                <span className="rm-meta">{weeks.length} weeks · {form.duration} months</span>
              </div>
              <div className="rm-title-actions">
                <button className="rm-btn rm-btn--ghost" onClick={toggleExpandAll}>
                  {expandAll ? <><ChevronUp size={15} /> Collapse All</> : <><ChevronDown size={15} /> Expand All</>}
                </button>
                <button className="rm-btn rm-btn--ghost" onClick={() => setData(null)}>
                  <RotateCcw size={15} /> New
                </button>
                <button className="rm-btn rm-btn--primary" onClick={handleDownload}>
                  <Download size={15} /> Download .txt
                </button>
              </div>
            </div>

            {/* Phase tags */}
            {phases.length > 0 && (
              <div className="rm-phase-row">
                {phases.map((p, i) => (
                  <div key={i} className="rm-phase-tag" style={{ borderColor: PHASE_COLORS[p.phase]?.bg }}>
                    <span className="rm-phase-name" style={{ color: PHASE_COLORS[p.phase]?.text }}>
                      {p.phase}
                    </span>
                    <span className="rm-phase-range">Weeks {p.week_range}</span>
                    <span className="rm-phase-desc">{p.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className="rm-timeline">
              <div className="rm-timeline-line" />
              {weeks.map((week, i) => (
                <WeekCard
                  key={i}
                  week={week}
                  index={i}
                  isOpen={!!openWeeks[i]}
                  onToggle={() => toggleWeek(i)}
                />
              ))}
            </div>

            {/* Pro Tips */}
            {(data.pro_tips || []).length > 0 && (
              <div className="rm-extra-card rm-tips-card">
                <div className="rm-extra-header">
                  <Zap size={18} color="#f59e0b" />
                  <h3>Pro Tips</h3>
                </div>
                <ul className="rm-extra-list">
                  {data.pro_tips.map((t, i) => (
                    <li key={i}><Lightbulb size={14} /> {t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outcomes */}
            {(data.outcomes || []).length > 0 && (
              <div className="rm-extra-card rm-outcomes-card">
                <div className="rm-extra-header">
                  <CheckCircle size={18} color="#10b981" />
                  <h3>Expected Outcomes</h3>
                </div>
                <ul className="rm-extra-list">
                  {data.outcomes.map((o, i) => (
                    <li key={i}><CheckCircle size={14} /> {o}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Download */}
            <div className="rm-download-banner">
              <div>
                <p>Your roadmap is ready! Save it for offline reference.</p>
              </div>
              <button className="rm-btn rm-btn--primary rm-btn--lg" onClick={handleDownload}>
                <Download size={18} /> Download Roadmap (.txt)
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}