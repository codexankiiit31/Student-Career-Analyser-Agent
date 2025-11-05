import React from 'react';
import { 
  Briefcase, GraduationCap, TrendingUp, AlertCircle, 
  CheckCircle, Lightbulb, Star 
} from 'lucide-react';
import './ExperienceMatch.css';

const ExperienceMatch = ({ data }) => {
  const {
    experience_match_analysis,
    education_match_analysis,
    key_strengths,
    areas_of_improvement,
    recommendations_for_improvement = [],
    job_analysis = {},
    resume_analysis = {},
  } = data;

  return (
    <div className="experience-match">
      {/* Experience Analysis */}
      <div className="analysis-card">
        <div className="card-header experience">
          <Briefcase size={28} />
          <h3>Experience Match Analysis</h3>
        </div>
        <div className="card-content">
          <div className="analysis-text">
            {experience_match_analysis || 'No experience analysis available'}
          </div>

          {/* Experience Details Comparison */}
          {job_analysis.years_experience && resume_analysis.years_experience && (
            <div className="comparison-grid">
              <div className="comparison-item">
                <span className="label">Required Experience</span>
                <span className="value required">{job_analysis.years_experience}</span>
              </div>
              <div className="comparison-item">
                <span className="label">Your Experience</span>
                <span className="value candidate">{resume_analysis.years_experience}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Education Analysis */}
      <div className="analysis-card">
        <div className="card-header education">
          <GraduationCap size={28} />
          <h3>Education Match Analysis</h3>
        </div>
        <div className="card-content">
          <div className="analysis-text">
            {education_match_analysis || 'No education analysis available'}
          </div>

          {/* Education Details */}
          {resume_analysis.education && resume_analysis.education.length > 0 && (
            <div className="education-list">
              <h4>Your Education</h4>
              {resume_analysis.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <GraduationCap size={20} />
                  <div className="education-info">
                    <div className="education-degree">
                      {edu.degree} in {edu.field}
                    </div>
                    {edu.institution && (
                      <div className="education-institution">{edu.institution}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="strengths-improvements">
        {/* Key Strengths */}
        <div className="strength-card">
          <div className="card-header strengths">
            <Star size={24} />
            <h3>Key Strengths</h3>
          </div>
          <div className="card-content">
            <div className="text-content success">
              {key_strengths || 'No strengths identified'}
            </div>
          </div>
        </div>

        {/* Areas of Improvement */}
        <div className="improvement-card">
          <div className="card-header improvements">
            <TrendingUp size={24} />
            <h3>Areas of Improvement</h3>
          </div>
          <div className="card-content">
            <div className="text-content warning">
              {areas_of_improvement || 'No improvement areas identified'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations_for_improvement.length > 0 && (
        <div className="recommendations-section">
          <div className="section-header">
            <Lightbulb size={28} />
            <h3>Detailed Recommendations</h3>
          </div>
          <div className="recommendations-grid">
            {recommendations_for_improvement.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Job Requirements Overview */}
      {job_analysis.key_responsibilities && (
        <div className="requirements-card">
          <div className="card-header requirements">
            <CheckCircle size={24} />
            <h3>Key Job Requirements</h3>
          </div>
          <div className="card-content">
            <ul className="requirements-list">
              {job_analysis.key_responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const RecommendationCard = ({ recommendation, index }) => {
  // Handle both string and object formats
  if (typeof recommendation === 'string') {
    return (
      <div className="recommendation-card">
        <div className="rec-number">{index + 1}</div>
        <div className="rec-content">
          <p>{recommendation}</p>
        </div>
      </div>
    );
  }

  const { 
    recommendation: recText, 
    section, 
    guidance, 
    priority, 
    example 
  } = recommendation;

  return (
    <div className="recommendation-card">
      <div className="rec-header">
        <div className="rec-number">{index + 1}</div>
        {priority && (
          <span className={`rec-priority priority-${priority.toLowerCase()}`}>
            {priority}
          </span>
        )}
      </div>
      <div className="rec-content">
        {section && (
          <div className="rec-section">
            <span className="rec-label">Section:</span>
            <span className="rec-value">{section}</span>
          </div>
        )}
        <div className="rec-recommendation">
          <strong>{recText}</strong>
        </div>
        {guidance && (
          <div className="rec-guidance">
            <AlertCircle size={16} />
            <span>{guidance}</span>
          </div>
        )}
        {example && (
          <div className="rec-example">
            <Lightbulb size={16} />
            <span><strong>Example:</strong> {example}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceMatch;