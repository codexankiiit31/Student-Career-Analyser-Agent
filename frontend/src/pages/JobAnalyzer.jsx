import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Briefcase,
  Upload,
  Target,
  Zap,
  Mail,
  Loader,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import apiService from "../services/api";

import ResumeUploader from "../components/ResumeUploader/ResumeUploader";
import JobDescriptionForm from "../components/JobDescriptionForm/JobDescriptionForm";

import SkillsAnalysis from "../components/SkillsAnalysis/SkillsAnalysis";
import ATSRecommendations from "../components/ATSRecommendations/ATSRecommendations";
import CoverLetterGenerator from "../components/CoverLetterGenerator/CoverLetterGenerator";

import "../Styles/JobAnalyzer.css";

const JobAnalyzer = () => {
  const [activeTab, setActiveTab] = useState("upload");

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobAnalyzed, setJobAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [matchData, setMatchData] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [coverLetterData, setCoverLetterData] = useState(null);

  const tabs = [
    { id: "upload", label: "Upload & Analyze", icon: Upload },
    { id: "skills", label: "Skills Analysis", icon: Target, disabled: !matchData },
    { id: "ats", label: "ATS Optimization", icon: Zap, disabled: !atsData },
    { id: "cover-letter", label: "Cover Letter", icon: Mail, disabled: !coverLetterData }
  ];

  const handleResumeUpload = () => {
    setResumeUploaded(true);
    toast.success("Resume uploaded successfully");
  };

  const handleJobAnalyze = () => {
    setJobAnalyzed(true);
    toast.success("Job description saved");
  };

  const handleAnalyzeAll = async () => {
    if (!resumeUploaded || !jobAnalyzed) {
      toast.warning("Please upload resume and job description first");
      return;
    }

    setAnalyzing(true);

    try {
      toast.info("Running complete AI analysis...");

      // ✅ Unified backend call
      const result = await apiService.analyzeResume();
      // const result = ANALYZE_RESPONSE;

      // ✅ IMPORTANT: normalize backend response
      const analysis = result?.analysis;

      if (!analysis) {
        throw new Error("Invalid analysis response from backend");
      }

      // ✅ Skills Analysis Tab
      setMatchData({
        summary: analysis.summary,
        match_analysis: analysis.match_analysis
      });

      // ✅ ATS Optimization Tab
      setAtsData({
        summary: analysis.summary,
        ats_optimization: analysis.ats_optimization
      });

      // ✅ Cover Letter
      const coverLetterResponse = await apiService.generateCoverLetter();
      setCoverLetterData(coverLetterResponse);

      toast.success("Complete analysis finished");
      setActiveTab("skills");

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error?.detail || error?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
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
                  <h3>Ready to Analyze</h3>
                  <p>Your resume and job description are ready.</p>

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

            {analyzing && (
              <div className="analysis-progress">
                <Loader size={48} className="spinner" />
                <h3>AI Analysis in Progress</h3>
                <p>This may take 10–30 seconds.</p>

                <div className="progress-steps">
                  <div className="progress-step">
                    <CheckCircle size={20} />
                    <span>Analyzing resume</span>
                  </div>
                  <div className="progress-step">
                    <Loader size={20} className="spinner" />
                    <span>Matching skills</span>
                  </div>
                  <div className="progress-step">
                    <Loader size={20} className="spinner" />
                    <span>Optimizing for ATS</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        );

      case "skills":
        return matchData
          ? <SkillsAnalysis data={matchData} />
          : <EmptyState message="No skills analysis available yet." />;

      case "ats":
        return atsData
          ? <ATSRecommendations data={atsData} />
          : <EmptyState message="No ATS optimization available yet." />;

      case "cover-letter":
        return coverLetterData
          ? <CoverLetterGenerator data={coverLetterData} />
          : <EmptyState message="No cover letter generated yet." />;

      default:
        return null;
    }
  };

  return (
    <div className="job-analyzer-page">

      <div className="page-header">
        <Briefcase size={40} className="page-icon" />
        <h1>AI Job Analyzer</h1>
        <p>Upload resume, analyze job descriptions, and get instant AI insights</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""} ${tab.disabled ? "disabled" : ""}`}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

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
