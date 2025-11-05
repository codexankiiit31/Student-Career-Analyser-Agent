import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import apiService from '../services/api';
import './Dashboard.css';
import './DashboardNew.css';

const Dashboard = () => {
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await apiService.healthCheck();
      setBackendStatus({ connected: true, data: response });
    } catch (error) {
      setBackendStatus({ connected: false, error: error });
    }
  };

  const features = [
    {
      icon: Target,
      title: 'Resume-Job Matching',
      description: 'AI-powered analysis to match your resume with job descriptions and get detailed similarity scores',
      color: '#667eea',
    },
    {
      icon: Sparkles,
      title: 'Skills Analysis',
      description: 'Identify matching and missing skills with visual charts and actionable recommendations',
      color: '#764ba2',
    },
    {
      icon: TrendingUp,
      title: 'ATS Optimization',
      description: 'Optimize your resume for Applicant Tracking Systems with keyword suggestions and formatting tips',
      color: '#f093fb',
    },
    {
      icon: CheckCircle,
      title: 'Cover Letter Generator',
      description: 'Generate professional, tailored cover letters that complement your resume perfectly',
      color: '#4facfe',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Upload Resume',
      description: 'Upload your resume in PDF or DOCX format',
    },
    {
      number: '2',
      title: 'Add Job Description',
      description: 'Paste the complete job description you want to apply for',
    },
    {
      number: '3',
      title: 'Get AI Analysis',
      description: 'Receive comprehensive analysis across multiple tabs with actionable insights',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">AI Career Agent</span>
          </h1>
          <p className="hero-subtitle">
            Your intelligent assistant for resume optimization, job matching, and career success powered by advanced AI
          </p>

          {backendStatus && (
            <div className={`backend-status ${backendStatus.connected ? 'connected' : 'disconnected'}`}>
              {backendStatus.connected ? (
                <>
                  <CheckCircle size={20} />
                  <span>Backend Connected • {backendStatus.data.version}</span>
                </>
              ) : (
                <>
                  <span>⚠️ Backend Disconnected</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">What We Offer</h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card-static">
                  <div className="feature-icon" style={{ background: feature.color }}>
                    <Icon size={28} color="white" />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="steps-section">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <TrendingUp size={48} className="cta-icon" />
            <h2>Ready to Boost Your Career?</h2>
            <p>Start by uploading your resume and let our AI-powered system analyze your job match in seconds</p>
            <Link to="/job-analyzer" className="cta-button">
              Get Started Now
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="section-title">Why Choose AI Career Agent?</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Get comprehensive analysis in under 30 seconds</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">🎯</div>
              <h3>Highly Accurate</h3>
              <p>Advanced AI models trained on thousands of resumes</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">📊</div>
              <h3>Detailed Insights</h3>
              <p>Multi-tab analysis with charts and visualizations</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your data is processed securely and never shared</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;