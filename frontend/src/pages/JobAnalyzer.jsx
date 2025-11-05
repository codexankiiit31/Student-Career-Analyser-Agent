import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  Briefcase, Upload, Target, Zap, Mail, 
  Loader, CheckCircle, AlertCircle 
} from 'lucide-react';
import apiService from '../services/api';
import ResumeUploader from '../components/ResumeUploader/ResumeUploader';
import JobDescriptionForm from '../components/JobDescriptionForm/JobDescriptionForm';
import SkillsAnalysis from '../components/SkillsAnalysis/SkillsAnalysis';
import ExperienceMatch from '../components/ExperienceMatch/ExperienceMatch';
import ATSRecommendations from '../components/ATSRecommendations/ATSRecommendations';
import CoverLetterGenerator from '../components/CoverLetterGenerator/CoverLetterGenerator';
import './JobAnalyzer.css';

const JobAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobAnalyzed, setJobAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Store analysis data
  const [matchData, setMatchData] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [coverLetterData, setCoverLetterData] = useState(null);

  const tabs = [
    { id: 'upload', label: 'Upload & Analyze', icon: Upload },
    { id: 'skills', label: 'Skills Analysis', icon: Target, disabled: !matchData },
    { id: 'experience', label: 'Experience Match', icon: Briefcase, disabled: !matchData },
    { id: 'ats', label: 'ATS Recommendations', icon: Zap, disabled: !atsData },
    { id: 'cover-letter', label: 'Cover Letter', icon: Mail, disabled: !coverLetterData },
  ];

  const handleResumeUpload = (response) => {
    console.log('✅ Resume uploaded:', response);
    setResumeUploaded(true);
    toast.success('Resume uploaded successfully!');
  };

  const handleJobAnalyze = (response) => {
    console.log('✅ Job analyzed:', response);
    setJobAnalyzed(true);
    toast.success('Job description analyzed successfully!');
  };

  const handleAnalyzeAll = async () => {
    if (!resumeUploaded || !jobAnalyzed) {
      toast.warning('Please upload resume and job description first');
      return;
    }

    setAnalyzing(true);

    try {
      // Step 1: Match Analysis
      toast.info('Analyzing resume-job match...');
      const matchResponse = await apiService.matchResumeJob();
      setMatchData(matchResponse);
      
      // Step 2: ATS Optimization
      toast.info('Getting ATS recommendations...');
      const atsResponse = await apiService.getATSOptimization();
      setAtsData(atsResponse);
      
      // Step 3: Cover Letter Generation
      toast.info('Generating cover letter...');
      const coverLetterResponse = await apiService.generateCoverLetter();
      setCoverLetterData(coverLetterResponse);

      toast.success('Complete analysis finished!');
      setActiveTab('skills'); // Switch to first results tab
      
    } catch (error) {
      toast.error(error.detail || 'Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="upload-tab-content">
            <div className="upload-sections">
              <div className="upload-section">
                <div className="section-badge">Step 1</div>
                <ResumeUploader onUploadSuccess={handleResumeUpload} />
              </div>

              <div className="upload-section">
                <div className="section-badge">Step 2</div>
                <JobDescriptionForm onAnalyzeSuccess={handleJobAnalyze} />
              </div>
            </div>

            {resumeUploaded && jobAnalyzed && (
              <div className="analyze-section">
                <div className="analyze-card">
                  <h3>Ready to Analyze!</h3>
                  <p>Your resume and job description are uploaded. Click below to start the complete AI analysis.</p>
                  <button 
                    onClick={handleAnalyzeAll} 
                    disabled={analyzing}
                    className="analyze-all-button"
                  >
                    {analyzing ? (
                      <>
                        <Loader size={20} className="spinner" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target size={20} />
                        Start Complete Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Debug Info - Remove after testing */}
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: '#f0f0f0', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <strong>Debug Info:</strong><br/>
              Resume Uploaded: {resumeUploaded ? '✅ Yes' : '❌ No'}<br/>
              Job Analyzed: {jobAnalyzed ? '✅ Yes' : '❌ No'}<br/>
              Match Data: {matchData ? '✅ Available' : '❌ Null'}<br/>
              ATS Data: {atsData ? '✅ Available' : '❌ Null'}<br/>
              Cover Letter Data: {coverLetterData ? '✅ Available' : '❌ Null'}
            </div>

            {analyzing && (
              <div className="analysis-progress">
                <Loader size={48} className="spinner" />
                <h3>AI Analysis in Progress...</h3>
                <p>This may take 10-30 seconds. Please wait.</p>
                <div className="progress-steps">
                  <div className="progress-step">
                    <CheckCircle size={20} />
                    <span>Matching resume with job</span>
                  </div>
                  <div className="progress-step">
                    <Loader size={20} className="spinner" />
                    <span>Optimizing for ATS</span>
                  </div>
                  <div className="progress-step">
                    <Loader size={20} className="spinner" />
                    <span>Generating cover letter</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'skills':
        return matchData ? (
          <SkillsAnalysis data={matchData} />
        ) : (
          <EmptyState message="No skills analysis available. Please complete the upload and analysis first." />
        );

      case 'experience':
        return matchData ? (
          <ExperienceMatch data={matchData} />
        ) : (
          <EmptyState message="No experience match data available. Please complete the upload and analysis first." />
        );

      case 'ats':
        return atsData ? (
          <ATSRecommendations data={atsData} />
        ) : (
          <EmptyState message="No ATS recommendations available. Please complete the upload and analysis first." />
        );

      case 'cover-letter':
        return coverLetterData ? (
          <CoverLetterGenerator data={coverLetterData} />
        ) : (
          <EmptyState message="No cover letter generated yet. Please complete the upload and analysis first." />
        );

      default:
        return null;
    }
  };

  return (
    <div className="job-analyzer-page">
      <div className="page-header">
        <Briefcase size={40} className="page-icon" />
        <h1>AI Job Analyzer</h1>
        <p>Upload your resume, analyze job descriptions, and get AI-powered insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="empty-state">
    <AlertCircle size={48} />
    <h3>No Data Available</h3>
    <p>{message}</p>
  </div>
);

export default JobAnalyzer;