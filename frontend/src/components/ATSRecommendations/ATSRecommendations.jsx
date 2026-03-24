import React from "react";
import {
  Zap,
  FileText,
  ListChecks,
  Layers,
  AlertTriangle
} from "lucide-react";
import "./ATSRecommendations.css";


const ATSRecommendations = ({ data }) => {
  // JobAnalyzer passes { summary, ats_optimization } as atsData
  // Support both old shape (data.analysis.ats_optimization) and new (data.ats_optimization)
  const ats = data?.ats_optimization ?? data?.analysis?.ats_optimization;

  if (!ats) {
    return (
      <div className="ats-no-data">
        <p>No ATS Optimization Data Available</p>
      </div>
    );
  }

  const atsScore = ats.ats_score ?? 0;

  const scoreColor =
    atsScore >= 80 ? "#10b981"
      : atsScore >= 60 ? "#3b82f6"
        : atsScore >= 40 ? "#f59e0b"
          : "#ef4444";

  return (
    <div className="ats-wrapper">

      {/* ================= ATS SCORE ================= */}
      <div className="ats-card ats-score-card" style={{ borderColor: scoreColor }}>
        <div className="ats-score-header">
          <div className="ats-round-icon" style={{ background: scoreColor }}>
            <Zap size={26} color="#fff" />
          </div>
          <div>
            <h3>ATS Compatibility Score</h3>
            <p className="ats-score" style={{ color: scoreColor }}>
              {atsScore}%
            </p>
          </div>
        </div>

        <p className="ats-score-text">
          {atsScore >= 80 && "Excellent ATS alignment."}
          {atsScore >= 60 && atsScore < 80 && "Good fit. Minor improvements possible."}
          {atsScore >= 40 && atsScore < 60 && "Moderate compatibility. Needs polishing."}
          {atsScore < 40 && "Weak ATS optimization. Requires significant improvements."}
        </p>
      </div>

      {/* ================= MISSING KEYWORDS ================= */}
      {ats.missing_keywords && (
        <Section title="Missing Keywords" icon={<FileText />}>
          <div className="grid-3">
            {Object.entries(ats.missing_keywords).map(([cat, items]) =>
              items.length > 0 ? (
                <CategoryBox key={cat} title={cat}>
                  {items.map((kw, i) => (
                    <span key={i} className="tag">{kw}</span>
                  ))}
                </CategoryBox>
              ) : null
            )}
          </div>
        </Section>
      )}

      {/* ================= FORMATTING RECOMMENDATIONS ================= */}
      {ats.formatting_recommendations?.length > 0 && (
        <Section title="Formatting Recommendations" icon={<ListChecks />}>
          {ats.formatting_recommendations.map((rec, i) => (
            <RecommendationCard
              key={i}
              issue={rec.issue}
              section={rec.section}
              suggestion={rec.suggestion}
              priority={rec.priority}
            />
          ))}
        </Section>
      )}

      {/* ================= SECTION ORGANIZATION ================= */}
      {ats.section_organization?.length > 0 && (
        <Section title="Section Organization" icon={<Layers />}>
          {ats.section_organization.map((sec, i) => (
            <div key={i} className="org-card">
              <h4>Current</h4>
              <p>{sec.current}</p>

              <h4>Recommended</h4>
              <p>{sec.recommended}</p>

              <p className="reason">
                <strong>Reason:</strong> {sec.reason}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* ================= KEYWORD DENSITY ISSUES ================= */}
      {ats.keyword_density_issues?.length > 0 && (
        <Section title="Keyword Density Issues" icon={<AlertTriangle />}>
          {ats.keyword_density_issues.map((kd, i) => (
            <DensityCard
              key={i}
              keyword={kd.keyword}
              current={kd.current_frequency}
              recommended={kd.recommended_frequency}
              suggestion={kd.suggestion}
            />
          ))}
        </Section>
      )}

    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const Section = ({ title, icon, children }) => (
  <div className="ats-card">
    <div className="section-header">
      {icon}
      <h3>{title}</h3>
    </div>
    {children}
  </div>
);

const CategoryBox = ({ title, children }) => (
  <div className="category-box">
    <h4>{title.replace(/_/g, " ").toUpperCase()}</h4>
    <div className="tag-list">{children}</div>
  </div>
);

const RecommendationCard = ({ issue, section, suggestion, priority }) => (
  <div className="recommend-card">
    <h4>{issue}</h4>
    <p><strong>Section:</strong> {section}</p>
    <p>{suggestion}</p>
    {priority && (
      <span className={`priority-badge ${priority.toLowerCase()}`}>
        {priority}
      </span>
    )}
  </div>
);

const DensityCard = ({ keyword, current, recommended, suggestion }) => (
  <div className="density-card">
    <h4>{keyword}</h4>
    <p>Current: {current}</p>
    <p>Recommended: {recommended}</p>
    <p><strong>Suggestion:</strong> {suggestion}</p>
  </div>
);

export default ATSRecommendations;
