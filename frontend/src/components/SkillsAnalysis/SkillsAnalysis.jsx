// SkillsAnalysis.jsx — Skills Match & Gap Analysis
import React from "react";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Gauge
} from "lucide-react";
import "./SkillsAnalysis.css";

const SkillsAnalysis = ({ data }) => {
  // data = { summary: {...}, match_analysis: {...} }
  const summary = data?.summary || data?.analysis?.summary;
  const match = data?.match_analysis || data?.analysis?.match_analysis;

  if (!summary || !match) {
    return (
      <div className="sa-empty">
        <AlertTriangle size={40} />
        <p>No skills analysis data available.</p>
      </div>
    );
  }

  const {
    overall_match_percentage = 0,
    ats_score = 0,
    selection_probability = 0
  } = summary;

  const {
    matching_skills = [],
    missing_skills = [],
    skills_gap_analysis = {},
    experience_match_analysis = "",
    education_match_analysis = "",
    key_strengths = [],
    areas_of_improvement = []
  } = match;

  const matchColor =
    overall_match_percentage >= 75 ? "#10b981"
      : overall_match_percentage >= 50 ? "#3b82f6"
        : overall_match_percentage >= 30 ? "#f59e0b"
          : "#ef4444";

  const probColor =
    selection_probability >= 70 ? "#10b981"
      : selection_probability >= 45 ? "#3b82f6"
        : "#ef4444";

  return (
    <div className="sa-root">

      {/* ─── SCORE CARDS ────────────────────────────── */}
      <div className="sa-scores-row">
        <ScoreCard
          icon={<Target size={22} />}
          label="Overall Match"
          value={overall_match_percentage}
          color={matchColor}
        />
        <ScoreCard
          icon={<Gauge size={22} />}
          label="ATS Score"
          value={ats_score}
          color={ats_score >= 60 ? "#3b82f6" : "#f59e0b"}
        />
        <ScoreCard
          icon={<TrendingUp size={22} />}
          label="Selection Probability"
          value={selection_probability}
          color={probColor}
        />
      </div>

      {/* ─── SKILL MATCH GRID ───────────────────────── */}
      <div className="sa-two-col">

        {/* Matching Skills */}
        <div className="sa-card">
          <div className="sa-card-header">
            <CheckCircle size={18} color="#10b981" />
            <h3>Matching Skills ({matching_skills.length})</h3>
          </div>
          <div className="sa-skill-list">
            {matching_skills.length === 0 && (
              <p className="sa-empty-text">No matching skills found.</p>
            )}
            {matching_skills.map((s, i) => (
              <div key={i} className="sa-skill-item match">
                <div className="sa-skill-top">
                  <span className="sa-skill-name">{s.skill_name}</span>
                  <span className="sa-badge match">{s.proficiency_level || "—"}</span>
                </div>
                {s.evidence && s.evidence.length > 0 && (
                  <ul className="sa-evidence-list">
                    {s.evidence.map((e, j) => (
                      <li key={j}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="sa-card">
          <div className="sa-card-header">
            <XCircle size={18} color="#ef4444" />
            <h3>Missing Skills ({missing_skills.length})</h3>
          </div>
          <div className="sa-skill-list">
            {missing_skills.length === 0 && (
              <p className="sa-empty-text">No critical missing skills!</p>
            )}
            {missing_skills.map((s, i) => (
              <div key={i} className="sa-skill-item missing">
                <div className="sa-skill-top">
                  <span className="sa-skill-name">{s.skill_name}</span>
                  <PriorityBadge priority={s.priority} />
                </div>
                {s.suggestion && (
                  <p className="sa-suggestion">💡 {s.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SKILL GAP ANALYSIS ─────────────────────── */}
      {(skills_gap_analysis.technical_skills || skills_gap_analysis.soft_skills) && (
        <div className="sa-card">
          <div className="sa-card-header">
            <AlertTriangle size={18} color="#f59e0b" />
            <h3>Skill Gap Analysis</h3>
          </div>
          <div className="sa-gap-grid">
            {skills_gap_analysis.technical_skills && (
              <div className="sa-gap-item">
                <h4>🔧 Technical Gap</h4>
                <p>{skills_gap_analysis.technical_skills}</p>
              </div>
            )}
            {skills_gap_analysis.soft_skills && (
              <div className="sa-gap-item">
                <h4>🤝 Soft Skills Gap</h4>
                <p>{skills_gap_analysis.soft_skills}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── EXPERIENCE & EDUCATION ─────────────────── */}
      {(experience_match_analysis || education_match_analysis) && (
        <div className="sa-two-col">
          {experience_match_analysis && (
            <div className="sa-card">
              <div className="sa-card-header">
                <TrendingUp size={18} color="#6366f1" />
                <h3>Experience Match</h3>
              </div>
              <p className="sa-text">{experience_match_analysis}</p>
            </div>
          )}
          {education_match_analysis && (
            <div className="sa-card">
              <div className="sa-card-header">
                <Award size={18} color="#8b5cf6" />
                <h3>Education Match</h3>
              </div>
              <p className="sa-text">{education_match_analysis}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── STRENGTHS & IMPROVEMENTS ───────────────── */}
      <div className="sa-two-col">
        {key_strengths.length > 0 && (
          <div className="sa-card">
            <div className="sa-card-header">
              <CheckCircle size={18} color="#10b981" />
              <h3>Key Strengths</h3>
            </div>
            <ul className="sa-bullet-list green">
              {key_strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {areas_of_improvement.length > 0 && (
          <div className="sa-card">
            <div className="sa-card-header">
              <TrendingDown size={18} color="#ef4444" />
              <h3>Areas to Improve</h3>
            </div>
            <ul className="sa-bullet-list red">
              {areas_of_improvement.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

/* ─── Sub-Components ─── */

const ScoreCard = ({ icon, label, value, color }) => (
  <div className="sa-score-card" style={{ borderColor: color }}>
    <div className="sa-score-icon" style={{ color }}>
      {icon}
    </div>
    <div>
      <p className="sa-score-label">{label}</p>
      <p className="sa-score-value" style={{ color }}>{value}%</p>
    </div>
    <div className="sa-score-bar-bg">
      <div
        className="sa-score-bar-fill"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const PriorityBadge = ({ priority }) => {
  const cls =
    priority === "High" ? "priority-high"
      : priority === "Medium" ? "priority-medium"
        : "priority-low";
  return <span className={`sa-badge ${cls}`}>{priority}</span>;
};

export default SkillsAnalysis;
