import React from 'react';
import { 
  CheckCircle2, XCircle, Target, AlertTriangle 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './SkillsAnalysis.css';

const SkillsAnalysis = ({ data }) => {
  const {
    overall_match_percentage,
    similarity_score,
    match_category,
    matching_skills = [],
    missing_skills = [],
    skills_gap_analysis = {},
    selection_probability,
  } = data;

  // Prepare chart data
  const chartData = [
    { name: 'Matching Skills', value: matching_skills.length, color: '#48bb78' },
    { name: 'Missing Skills', value: missing_skills.length, color: '#f56565' },
  ];

  const getScoreColor = (score) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 80) return '#48bb78';
    if (numScore >= 65) return '#4299e1';
    if (numScore >= 50) return '#ed8936';
    return '#f56565';
  };

  const overallScore = parseFloat(overall_match_percentage) || similarity_score;
  const scoreColor = getScoreColor(overallScore);

  return (
    <div className="skills-analysis">
      {/* Overall Score Card */}
      <div className="score-overview">
        <div className="score-card-main" style={{ borderColor: scoreColor }}>
          <div className="score-header">
            <Target size={40} color={scoreColor} />
            <div className="score-info">
              <h2>Overall Match Score</h2>
              <p className="match-category">{match_category}</p>
            </div>
          </div>

          <div className="score-display">
            <div className="score-number" style={{ color: scoreColor }}>
              {overallScore}%
            </div>
            <div className="score-subtitle">
              {selection_probability && (
                <span>Selection Probability: {selection_probability}</span>
              )}
            </div>
          </div>

          <div className="score-interpretation">
            {overallScore >= 80 && (
              <p>🎉 Excellent match! You're a strong candidate for this position.</p>
            )}
            {overallScore >= 65 && overallScore < 80 && (
              <p>👍 Good match! Consider highlighting relevant skills more prominently.</p>
            )}
            {overallScore >= 50 && overallScore < 65 && (
              <p>⚠️ Moderate match. Focus on developing key skills mentioned in the job description.</p>
            )}
            {overallScore < 50 && (
              <p>📚 Significant skill gap detected. Consider upskilling or applying to better-matched positions.</p>
            )}
          </div>
        </div>

        {/* Skills Distribution Chart */}
        <div className="chart-card">
          <h3>Skills Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <div className="summary-item">
              <CheckCircle2 size={20} color="#48bb78" />
              <span>{matching_skills.length} Matching</span>
            </div>
            <div className="summary-item">
              <XCircle size={20} color="#f56565" />
              <span>{missing_skills.length} Missing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Details */}
      <div className="skills-details">
        {/* Matching Skills */}
        <div className="skills-section">
          <div className="section-header matching">
            <CheckCircle2 size={24} />
            <h3>Matching Skills ({matching_skills.length})</h3>
          </div>
          <div className="skills-grid">
            {matching_skills.length > 0 ? (
              matching_skills.map((skill, index) => (
                <SkillCard key={index} skill={skill} type="matching" />
              ))
            ) : (
              <p className="no-data">No matching skills found</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="skills-section">
          <div className="section-header missing">
            <XCircle size={24} />
            <h3>Missing Skills ({missing_skills.length})</h3>
          </div>
          <div className="skills-grid">
            {missing_skills.length > 0 ? (
              missing_skills.map((skill, index) => (
                <SkillCard key={index} skill={skill} type="missing" />
              ))
            ) : (
              <p className="no-data">No missing skills identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills Gap Analysis */}
      {(skills_gap_analysis.technical_skills || skills_gap_analysis.soft_skills) && (
        <div className="gap-analysis">
          <div className="gap-header">
            <AlertTriangle size={24} />
            <h3>Detailed Skills Gap Analysis</h3>
          </div>
          <div className="gap-content">
            {skills_gap_analysis.technical_skills && (
              <div className="gap-section">
                <h4>💻 Technical Skills Gap</h4>
                <p>{skills_gap_analysis.technical_skills}</p>
              </div>
            )}
            {skills_gap_analysis.soft_skills && (
              <div className="gap-section">
                <h4>🤝 Soft Skills Gap</h4>
                <p>{skills_gap_analysis.soft_skills}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SkillCard = ({ skill, type }) => {
  const isMatching = type === 'matching';
  
  // Handle both string and object skill formats
  const skillName = typeof skill === 'string' ? skill : skill.skill_name || 'Unknown Skill';
  const proficiency = skill.proficiency_level || null;
  const priority = skill.priority || null;
  const suggestion = skill.suggestion || null;

  return (
    <div className={`skill-card ${isMatching ? 'matching' : 'missing'}`}>
      <div className="skill-icon">
        {isMatching ? (
          <CheckCircle2 size={20} color="#48bb78" />
        ) : (
          <XCircle size={20} color="#f56565" />
        )}
      </div>
      <div className="skill-content">
        <div className="skill-name">{skillName}</div>
        {proficiency && (
          <div className="skill-meta">
            <span className="proficiency">Level: {proficiency}</span>
          </div>
        )}
        {priority && (
          <div className="skill-meta">
            <span className={`priority priority-${priority.toLowerCase()}`}>
              Priority: {priority}
            </span>
          </div>
        )}
        {suggestion && (
          <div className="skill-suggestion">
            <span>💡 {suggestion}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsAnalysis;