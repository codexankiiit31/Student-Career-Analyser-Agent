import React from 'react';
import { 
  Zap, AlertCircle, CheckCircle, FileText, TrendingUp, 
  Target, Edit3, List
} from 'lucide-react';
import './ATSRecommendations.css';

const ATSRecommendations = ({ data }) => {
  const {
    ats_score,
    missing_keywords = {},
    keyword_density_issues = [],
    formatting_recommendations = [],
    section_organization = [],
    optimized_professional_summary,
    priority_action_items = [],
    keyword_recommendations = {},
    // content_suggestions = [], // Not used currently
    improvement_potential,
  } = data;

  const getScoreColor = (score) => {
    if (!score) return '#718096';
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 80) return '#48bb78';
    if (numScore >= 60) return '#4299e1';
    if (numScore >= 40) return '#ed8936';
    return '#f56565';
  };

  const atsScoreNum = ats_score ? parseFloat(ats_score) : 0;
  const scoreColor = getScoreColor(atsScoreNum);

  return (
    <div className="ats-recommendations">
      {/* ATS Score Overview */}
      <div className="ats-score-card" style={{ borderColor: scoreColor }}>
        <div className="score-section">
          <div className="score-icon" style={{ background: scoreColor }}>
            <Zap size={32} color="white" />
          </div>
          <div className="score-content">
            <h2>ATS Compatibility Score</h2>
            <div className="score-value" style={{ color: scoreColor }}>
              {ats_score || 'N/A'}
            </div>
            {improvement_potential && (
              <div className="improvement-info">
                <TrendingUp size={16} />
                <span>{improvement_potential}</span>
              </div>
            )}
          </div>
        </div>

        <div className="score-interpretation">
          {atsScoreNum >= 80 && (
            <p>✅ Excellent! Your resume is well-optimized for ATS systems.</p>
          )}
          {atsScoreNum >= 60 && atsScoreNum < 80 && (
            <p>👍 Good progress! A few improvements will make it ATS-perfect.</p>
          )}
          {atsScoreNum >= 40 && atsScoreNum < 60 && (
            <p>⚠️ Moderate ATS compatibility. Follow recommendations to improve.</p>
          )}
          {atsScoreNum < 40 && atsScoreNum > 0 && (
            <p>🔧 Needs work. Your resume may not pass ATS filters effectively.</p>
          )}
        </div>
      </div>

      {/* Priority Action Items */}
      {priority_action_items.length > 0 && (
        <div className="priority-section">
          <div className="section-header priority">
            <Target size={24} />
            <h3>Priority Action Items</h3>
          </div>
          <div className="priority-grid">
            {priority_action_items.map((item, index) => (
              <PriorityActionCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {Object.keys(missing_keywords).length > 0 && (
        <div className="keywords-section">
          <div className="section-header keywords">
            <FileText size={24} />
            <h3>Missing Keywords</h3>
          </div>
          <div className="keywords-grid">
            {Object.entries(missing_keywords).map(([category, keywords]) => (
              <KeywordCategory 
                key={category} 
                category={category} 
                keywords={keywords} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Keyword Density Issues */}
      {keyword_density_issues.length > 0 && (
        <div className="density-section">
          <div className="section-header density">
            <TrendingUp size={24} />
            <h3>Keyword Density Optimization</h3>
          </div>
          <div className="density-list">
            {keyword_density_issues.map((issue, index) => (
              <DensityIssueCard key={index} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* Optimized Professional Summary */}
      {optimized_professional_summary && (
        <div className="summary-section">
          <div className="section-header summary">
            <Edit3 size={24} />
            <h3>Optimized Professional Summary</h3>
          </div>
          <div className="summary-content">
            <p className="summary-note">
              💡 <strong>Tip:</strong> Use this ATS-optimized summary to replace your current one:
            </p>
            <div className="summary-text">
              {optimized_professional_summary}
            </div>
          </div>
        </div>
      )}

      {/* Formatting Recommendations */}
      {formatting_recommendations.length > 0 && (
        <div className="formatting-section">
          <div className="section-header formatting">
            <List size={24} />
            <h3>Formatting Recommendations</h3>
          </div>
          <div className="formatting-list">
            {formatting_recommendations.map((rec, index) => (
              <FormattingCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Section Organization */}
      {section_organization.length > 0 && (
        <div className="organization-section">
          <div className="section-header organization">
            <CheckCircle size={24} />
            <h3>Section Organization</h3>
          </div>
          <div className="organization-list">
            {section_organization.map((org, index) => (
              <OrganizationCard key={index} organization={org} />
            ))}
          </div>
        </div>
      )}

      {/* Keyword Recommendations */}
      {Object.keys(keyword_recommendations).length > 0 && (
        <div className="keyword-rec-section">
          <div className="section-header keyword-rec">
            <Target size={24} />
            <h3>Keyword Strategy</h3>
          </div>
          <div className="keyword-rec-grid">
            {Object.entries(keyword_recommendations).map(([type, keywords]) => (
              <KeywordRecommendationCard 
                key={type} 
                type={type} 
                keywords={keywords} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PriorityActionCard = ({ item, index }) => {
  if (typeof item === 'string') {
    return (
      <div className="priority-card">
        <div className="priority-number">{index + 1}</div>
        <div className="priority-content">
          <p>{item}</p>
        </div>
      </div>
    );
  }

  const { action, details, impact, estimated_improvement } = item;

  return (
    <div className="priority-card">
      <div className="priority-header">
        <div className="priority-number">{index + 1}</div>
        {impact && (
          <span className={`impact-badge impact-${impact.toLowerCase()}`}>
            {impact} Impact
          </span>
        )}
      </div>
      <div className="priority-content">
        <h4>{action}</h4>
        {details && <p>{details}</p>}
        {estimated_improvement && (
          <div className="improvement-badge">
            <TrendingUp size={14} />
            <span>+{estimated_improvement} improvement</span>
          </div>
        )}
      </div>
    </div>
  );
};

const KeywordCategory = ({ category, keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="keyword-category">
      <h4>{category.replace(/_/g, ' ').toUpperCase()}</h4>
      <div className="keyword-tags">
        {keywords.map((keyword, index) => (
          <span key={index} className="keyword-tag">
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

const DensityIssueCard = ({ issue }) => {
  if (typeof issue === 'string') {
    return <div className="density-card"><p>{issue}</p></div>;
  }

  const { keyword, current_frequency, recommended_frequency, suggestion } = issue;

  return (
    <div className="density-card">
      <div className="density-keyword">{keyword}</div>
      <div className="density-comparison">
        <span className="current">Current: {current_frequency}x</span>
        <span className="arrow">→</span>
        <span className="recommended">Recommended: {recommended_frequency}x</span>
      </div>
      {suggestion && <p className="density-suggestion">{suggestion}</p>}
    </div>
  );
};

const FormattingCard = ({ recommendation }) => {
  if (typeof recommendation === 'string') {
    return <div className="formatting-card"><p>{recommendation}</p></div>;
  }

  const { issue, section, suggestion, priority } = recommendation;

  return (
    <div className="formatting-card">
      <div className="formatting-header">
        <AlertCircle size={18} />
        <strong>{issue}</strong>
        {priority && (
          <span className={`priority-badge priority-${priority.toLowerCase()}`}>
            {priority}
          </span>
        )}
      </div>
      {section && <div className="formatting-section">Section: {section}</div>}
      {suggestion && <p className="formatting-suggestion">✓ {suggestion}</p>}
    </div>
  );
};

const OrganizationCard = ({ organization }) => {
  if (typeof organization === 'string') {
    return <div className="organization-card"><p>{organization}</p></div>;
  }

  const { current, recommended, reason } = organization;

  return (
    <div className="organization-card">
      <div className="org-comparison">
        <div className="org-current">
          <span className="org-label">Current:</span>
          <span>{current}</span>
        </div>
        <div className="org-arrow">→</div>
        <div className="org-recommended">
          <span className="org-label">Recommended:</span>
          <span>{recommended}</span>
        </div>
      </div>
      {reason && <p className="org-reason">💡 {reason}</p>}
    </div>
  );
};

const KeywordRecommendationCard = ({ type, keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  const typeColors = {
    must_have: '#f56565',
    good_to_have: '#ed8936',
    optional: '#4299e1',
  };

  return (
    <div className="keyword-rec-card">
      <h4 style={{ color: typeColors[type] || '#718096' }}>
        {type.replace(/_/g, ' ').toUpperCase()}
      </h4>
      <div className="keyword-rec-tags">
        {keywords.map((keyword, index) => (
          <span 
            key={index} 
            className="keyword-rec-tag"
            style={{ borderColor: typeColors[type] || '#718096' }}
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ATSRecommendations;