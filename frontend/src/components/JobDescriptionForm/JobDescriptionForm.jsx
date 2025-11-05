import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import apiService from '../../services/api';
import './JobDescriptionForm.css';

const JobDescriptionForm = ({ onAnalyzeSuccess }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setAnalyzeStatus({
        type: 'error',
        message: 'Please enter a job description',
      });
      return;
    }

    if (jobDescription.trim().length < 20) {
      setAnalyzeStatus({
        type: 'error',
        message: 'Job description is too short. Please provide more details.',
      });
      return;
    }

    setAnalyzing(true);
    setAnalyzeStatus(null);

    try {
      const response = await apiService.analyzeJob(jobDescription);
      setAnalyzeStatus({
        type: 'success',
        message: response.message,
        data: response,
      });

      if (onAnalyzeSuccess) {
        onAnalyzeSuccess(response);
      }
    } catch (error) {
      setAnalyzeStatus({
        type: 'error',
        message: error.detail || 'Failed to analyze job description',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const clearForm = () => {
    setJobDescription('');
    setAnalyzeStatus(null);
  };

  const wordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="job-description-form">
      <div className="form-header">
        <FileText size={32} className="form-icon" />
        <h2>Job Description</h2>
        <p>Paste the job description you want to match with your resume</p>
      </div>

      <div className="form-body">
        <textarea
          className="job-textarea"
          placeholder="Paste the complete job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in Python, React, and cloud technologies. The ideal candidate will have strong problem-solving skills and experience with FastAPI, Docker, and AWS..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={12}
        />

        <div className="form-footer">
          <div className="word-count">
            <span className={wordCount > 0 ? 'active' : ''}>
              {wordCount} words
            </span>
          </div>

          <div className="form-actions">
            <button
              onClick={clearForm}
              className="clear-btn"
              disabled={!jobDescription || analyzing}
            >
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              className="analyze-btn"
              disabled={analyzing || !jobDescription.trim()}
            >
              {analyzing ? (
                <>
                  <Loader size={20} className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Analyze Job
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {analyzeStatus && (
        <div className={`analyze-status ${analyzeStatus.type}`}>
          {analyzeStatus.type === 'success' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <div className="status-content">
            <p className="status-message">{analyzeStatus.message}</p>
            {analyzeStatus.data && (
              <div className="status-details">
                <span>📄 Length: {analyzeStatus.data.description_length} characters</span>
                <span>📝 Words: {analyzeStatus.data.word_count}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionForm;