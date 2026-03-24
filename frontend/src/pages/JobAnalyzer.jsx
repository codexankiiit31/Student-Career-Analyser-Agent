import React, { useState, useEffect } from "react";
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

// 🌍 Global State to persist active promises across React unmounts/remounts
let globalAnalyzing = false;
let globalAnalysisPromise = null;

const JobAnalyzer = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("ja_activeTab") || "upload";
  });

  const [resumeUploaded, setResumeUploaded] = useState(() => {
    return sessionStorage.getItem("ja_resume") === "true";
  });
  const [jobAnalyzed, setJobAnalyzed] = useState(() => {
    return sessionStorage.getItem("ja_job") === "true";
  });
  const [analyzing, setAnalyzing] = useState(globalAnalyzing);

  const isMountedRef = React.useRef(true);

  // Hook into active global promise on mount
  useEffect(() => {
    isMountedRef.current = true;
    if (globalAnalyzing && globalAnalysisPromise) {
      setAnalyzing(true);
      globalAnalysisPromise.then((res) => {
        if (!isMountedRef.current) return;
        setAnalyzing(false);
        if (res.success) {
          setMatchData(res.matchData);
          setAtsData(res.atsData);
          setCoverLetterData(res.coverLetterData);
          setActiveTab("skills");
          toast.success("Complete analysis finished (Resumed)");
        } else {
          toast.error(res.error?.detail || res.error?.message || "Analysis failed");
        }
      });
    }
    return () => { isMountedRef.current = false; };
  }, []);

  const [matchData, setMatchData] = useState(() => {
    const saved = sessionStorage.getItem("ja_matchData");
    return saved ? JSON.parse(saved) : null;
  });
  const [atsData, setAtsData] = useState(() => {
    const saved = sessionStorage.getItem("ja_atsData");
    return saved ? JSON.parse(saved) : null;
  });
  const [coverLetterData, setCoverLetterData] = useState(() => {
    const saved = sessionStorage.getItem("ja_coverLetterData");
    return saved ? JSON.parse(saved) : null;
  });

  // Persist state to sessionStorage
  useEffect(() => { sessionStorage.setItem("ja_activeTab", activeTab); }, [activeTab]);
  useEffect(() => { sessionStorage.setItem("ja_resume", resumeUploaded); }, [resumeUploaded]);
  useEffect(() => { sessionStorage.setItem("ja_job", jobAnalyzed); }, [jobAnalyzed]);

  useEffect(() => {
    if (matchData) sessionStorage.setItem("ja_matchData", JSON.stringify(matchData));
    else sessionStorage.removeItem("ja_matchData");
  }, [matchData]);

  useEffect(() => {
    if (atsData) sessionStorage.setItem("ja_atsData", JSON.stringify(atsData));
    else sessionStorage.removeItem("ja_atsData");
  }, [atsData]);

  useEffect(() => {
    if (coverLetterData) sessionStorage.setItem("ja_coverLetterData", JSON.stringify(coverLetterData));
    else sessionStorage.removeItem("ja_coverLetterData");
  }, [coverLetterData]);

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

  const handleAnalyzeAll = () => {
    if (!resumeUploaded || !jobAnalyzed) {
      toast.warning("Please upload resume and job description first");
      return;
    }

    setAnalyzing(true);
    globalAnalyzing = true;
    toast.info("Running complete AI analysis... You can navigate away and come back!");

    globalAnalysisPromise = (async () => {
      try {
        // ✅ Unified backend call
        const result = await apiService.analyzeResume();
        const analysis = result?.analysis;

        if (!analysis) {
          throw new Error("Invalid analysis response from backend");
        }

        // ✅ Prepare Data
        const newMatchData = {
          summary: analysis.summary,
          match_analysis: analysis.match_analysis
        };
        const newAtsData = {
          summary: analysis.summary,
          ats_optimization: analysis.ats_optimization
        };
        const newCoverLetterData = await apiService.generateCoverLetter();

        // ✅ Lock data in sessionStorage synchronously
        sessionStorage.setItem("ja_matchData", JSON.stringify(newMatchData));
        sessionStorage.setItem("ja_atsData", JSON.stringify(newAtsData));
        sessionStorage.setItem("ja_coverLetterData", JSON.stringify(newCoverLetterData));
        sessionStorage.setItem("ja_activeTab", "skills");

        globalAnalyzing = false;
        return { success: true, matchData: newMatchData, atsData: newAtsData, coverLetterData: newCoverLetterData };

      } catch (error) {
        console.error("Analysis error:", error);
        globalAnalyzing = false;
        return { success: false, error };
      }
    })();

    // ✅ Attach UI handler to the global promise for THIS mounted instance
    globalAnalysisPromise.then((res) => {
      if (!isMountedRef.current) return; // If user navigated away, UI update handled by useEffect on remount
      setAnalyzing(false);
      
      if (res.success) {
        setMatchData(res.matchData);
        setAtsData(res.atsData);
        setCoverLetterData(res.coverLetterData);
        setActiveTab("skills");
        toast.success("Complete analysis finished");
      } else {
        toast.error(res.error?.detail || res.error?.message || "Analysis failed");
      }
    });
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
