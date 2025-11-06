import React, { useState } from "react";
import "../Styles/RoadMap.css";
import RoadmapVideo from "../assests/roadmap3.mp4"; // your background video

const RoadMap = () => {
  const [formData, setFormData] = useState({
    course: "",
    duration: "",
    technology: "",
  });

  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.course || !formData.duration) {
      setError("Please fill all required fields.");
      return;
    }

    // Example Roadmap Data
    const fakeRoadmap = {
      duration: formData.duration,
      course: formData.course,
      technology: formData.technology || "General",
      weeks: [
        {
          title: "Week 1: Basics & Fundamentals",
          details: [
            "Understand course overview and prerequisites.",
            "Learn basics of the chosen technology.",
            "Resources: W3Schools, YouTube – FreeCodeCamp.",
          ],
        },
        {
          title: "Week 2: Core Concepts",
          details: [
            "Start with main modules of the course.",
            "Hands-on small exercises daily.",
            "Resources: GeeksforGeeks, TutorialsPoint.",
          ],
        },
        {
          title: "Week 3–4: Advanced Topics & Projects",
          details: [
            "Build a mini-project with learned skills.",
            "Explore real-world applications.",
            "Resources: YouTube – Traversy Media, MDN Docs.",
          ],
        },
      ],
    };

    setTimeout(() => {
      setRoadmap(fakeRoadmap);
    }, 1000);
  };

  return (
    <div className="roadmap-container">
      {/* Hero Section with Background Video */}
      <section className="roadmap-hero">
        <video
          className="roadmap-video"
          src={RoadmapVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-overlay">
          <h1>Career Roadmap Generator</h1>
          <p>
            Build your personalized learning roadmap. <br />
            Enter your course, duration, and technology to get a structured
            week-by-week plan with top learning resources.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="roadmap-form-section">
        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="roadmap-form">
            <h2 className="form-title">🚀 Generate Your Learning Path</h2>
            <p className="form-subtitle">
              Fill in the details below and get a personalized step-by-step
              roadmap for your chosen course.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  name="course"
                  placeholder="e.g., Web Development"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (in weeks or months) *</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g., 12 weeks"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Technology (optional)</label>
                <input
                  type="text"
                  name="technology"
                  placeholder="e.g., React, Python, AI"
                  value={formData.technology}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="btn-container">
              <button type="submit" className="generate-btn">
                🎯 Generate My Roadmap
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Result Section */}
      {roadmap && (
        <section className="roadmap-result-section">
          <h2>Your Learning Roadmap</h2>
          <div className="result-box">
            <h3>
              {roadmap.course} ({roadmap.duration})
            </h3>
            <p>
              <strong>Technology Focus:</strong> {roadmap.technology}
            </p>
            <div className="week-plan">
              {roadmap.weeks.map((week, index) => (
                <div key={index} className="week-card">
                  <h4>{week.title}</h4>
                  <ul>
                    {week.details.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default RoadMap;
