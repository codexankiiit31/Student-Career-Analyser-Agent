import axios from 'axios';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service Object
const apiService = {
  // Health Check
  healthCheck: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload Resume
  uploadResume: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Analyze Job Description
  analyzeJob: async (jobDescription) => {
    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);

      const response = await api.post('/analyze_job', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Match Resume with Job (Returns structured data)
  matchResumeJob: async () => {
    try {
      const response = await api.get('/match_resume_job');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ATS Optimization (Returns structured data)
  getATSOptimization: async () => {
    try {
      const response = await api.get('/ats_optimization');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate Cover Letter (Returns structured data with metadata)
  generateCoverLetter: async () => {
    try {
      const response = await api.get('/generate_cover_letter');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get Stored Data Status
  getStoredData: async () => {
    try {
      const response = await api.get('/get_stored_data');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Clear All Data
  clearData: async () => {
    try {
      const response = await api.delete('/clear_data');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default apiService;