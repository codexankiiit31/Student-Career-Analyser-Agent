import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Country, State, City } from "country-state-city";
import "../Styles/MarketAnalyzer.css";
import marketAnalyzerImg from "../assests/market_analyze.jpg";

const MarketAnalyzer = () => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    experience: "",
    skills: "",
    country: "",
    state: "",
    city: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const countries = Country.getAllCountries();
  const states = formData.country ? State.getStatesOfCountry(formData.country) : [];
  const cities = formData.state ? City.getCitiesOfState(formData.country, formData.state) : [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setJobs([]);

    try {
      const response = await fetch("https://api.example.com/market-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch(
        `https://api.example.com/jobs?title=${formData.jobTitle}&location=${formData.city}`
      );
      const jobData = await res.json();
      setJobs(jobData.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([{ title: "No jobs found", company: "", location: "" }]);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="market-analyzer-page">
      {/* HERO SECTION */}
      <section className="hero-section-market">
        <img src={marketAnalyzerImg} alt="Market Analysis" className="hero-image" />
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <motion.h1
            className="intro-title"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Market Analyzer
          </motion.h1>
          <motion.p
            className="intro-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Gain insights into job trends, skill demand, and salary expectations.
            Enter your details and let AI analyze the career market for you.
          </motion.p>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="form-section">
        <motion.form
          onSubmit={handleSubmit}
          className="analyzer-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="form-heading">Fill Required Details</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                placeholder="e.g., Software Developer"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experience"
                placeholder="e.g., 3"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Key Skills</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g., React, Node.js, AI"
                value={formData.skills}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value, state: "", city: "" })
                }
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value, city: "" })
                }
                required
                disabled={!formData.country}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={!formData.state}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="btn-container">
            <button type="submit" disabled={loading} className="execute-btn">
              {loading ? (
                <>
                  <Loader2 className="spin-icon" /> Executing...
                </>
              ) : (
                "Execute"
              )}
            </button>
          </div>
        </motion.form>
      </section>

      {/* RESULT SECTION */}
      <section className="result-section">
        <motion.div
          className="result-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="result-heading">Show Your Result</h2>

          {loading && <p className="loading-text">Analyzing your data...</p>}

          {!loading && result && (
            <div className="result-content">
              {result.error ? (
                <p className="error-text">{result.error}</p>
              ) : (
                <>
                  <p><strong>Job Demand:</strong> {result.jobDemand || "High demand in your area"}</p>
                  <p><strong>Average Salary:</strong> {result.salaryRange || "₹6–12 LPA"}</p>
                  <p><strong>Top Skills Required:</strong> {result.topSkills?.join(", ") || formData.skills}</p>
                  <p><strong>Location Insights:</strong> {result.locationInsights || `Opportunities in ${formData.city}`}</p>
                  <p className="recommendation">
                    Recommendation: {result.recommendation || "Upskill in AI tools for better growth."}
                  </p>

                  <div className="current-job-container">
                    <button
                      onClick={handleFetchJobs}
                      disabled={loadingJobs}
                      className="current-job-btn"
                    >
                      {loadingJobs ? "Loading Jobs..." : "Show Current Jobs"}
                    </button>
                  </div>

                  {jobs.length > 0 && (
                    <div className="job-list">
                      <h3 className="job-list-heading">Current Job Openings</h3>
                      <ul>
                        {jobs.map((job, index) => (
                          <li key={index} className="job-item">
                            <strong>{job.title}</strong> — {job.company} ({job.location})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default MarketAnalyzer;
