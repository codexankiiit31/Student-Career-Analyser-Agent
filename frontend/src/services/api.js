import axios from 'axios';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://127.0.0.1:8000/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for long-running operations
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// API SERVICE OBJECT
// ============================================

const apiService = {
  // ==========================================
  // SYSTEM ENDPOINTS
  // ==========================================

  /**
   * Check API health and system status
   * @returns {Promise<Object>} System health information
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Get main API information
   * @returns {Promise<Object>} API information and available endpoints
   */
  getApiInfo: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // ==========================================
  // CAREER AGENT ENDPOINTS
  // ==========================================

  /**
   * Upload resume file (PDF or DOCX)
   * @param {File} file - Resume file to upload
   * @returns {Promise<Object>} Upload status and metadata
   */
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
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Analyze and store job description
   * @param {string} jobDescription - Job description text
   * @returns {Promise<Object>} Analysis status and metadata
   */
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
      throw error.response?.data || { error: error.message };
    }
  },

  /**
  * Unified Resume Analysis (Match + ATS Optimization + Rewrites)
  * @returns {Promise<Object>} Complete JSON with all sections
  */
  analyzeResume: async () => {
    try {
      const response = await api.get('/analyze_resume');
      return response.data;  // Contains BOTH match analysis + ATS + rewrites
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  generateCoverLetter: async () => {
    try {
      const response = await api.get('/generate_cover_letter');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Get stored resume and job data status
   * @returns {Promise<Object>} Current data storage status
   */
  getStoredData: async () => {
    try {
      const response = await api.get('/get_stored_data');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Clear stored career data (resume and job description)
   * @returns {Promise<Object>} Deletion confirmation
   */
  clearData: async () => {
    try {
      const response = await api.delete('/clear_data');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // ==========================================
  // MARKET ANALYSIS ENDPOINTS
  // ==========================================

  /**
   * Analyze job market for a specific role
   * @param {Object} params - Market analysis parameters
   * @param {string} params.role - Job role/title
   * @param {string} [params.location] - Geographic location (optional)
   * @param {string} [params.experience_level] - Experience level (default: "entry")
   * @returns {Promise<Object>} Market analysis with salary, skills, and jobs
   */
  analyzeMarket: async ({ role, location = null, experience_level = "entry" }) => {
    try {
      const response = await api.post('/api/market_analysis', {
        role,
        location,
        experience_level,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Get cached market analysis data
   * @returns {Promise<Object>} Historical market data cache
   */
  getMarketCache: async () => {
    try {
      const response = await api.get('/api/cache');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Clear market analysis cache
   * @returns {Promise<Object>} Cache clear confirmation
   */
  clearMarketCache: async () => {
    try {
      const response = await api.delete('/api/cache');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // ==========================================
  // CAREER ROADMAP ENDPOINTS
  // ==========================================

  /**
   * Generate personalized career roadmap
   * @param {Object} params - Roadmap generation parameters
   * @param {string} params.query - Career query (e.g., "Become a Full Stack Developer")
   * @param {number} [params.duration_months] - Roadmap duration in months (default: 3)
   * @returns {Promise<Object>} Week-by-week roadmap with resources
   */
  getRoadmap: async ({ query, duration_months = 3 }) => {
    try {
      const response = await api.post('/api/get_roadmap', {
        query,
        duration_months,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Get quick career tips for a specific role
   * @param {string} career - Career/role name
   * @returns {Promise<Object>} List of actionable career tips
   */
  getCareerTips: async (career) => {
    try {
      const response = await api.post('/api/get_tips', {
        career,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // ==========================================
  // GLOBAL DATA MANAGEMENT
  // ==========================================

  /**
   * Clear all data (career data + market cache)
   * @returns {Promise<Object>} Complete deletion confirmation
   */
  clearAllData: async () => {
    try {
      const response = await api.delete('/clear_all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format location string from country, state, city
 * @param {string} country - Country ISO code
 * @param {string} state - State ISO code
 * @param {string} city - City name
 * @returns {string} Formatted location string
 */
export const formatLocation = (country, state, city) => {
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (country) parts.push(country);
  return parts.join(', ');
};

/**
 * Validate file for resume upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result { valid: boolean, error?: string }
 */
export const validateResumeFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.docx'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'Only PDF and DOCX files are allowed' };
  }

  if (!allowedTypes.includes(file.type) && file.type !== '') {
    return { valid: false, error: 'Invalid file type' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
};

/**
 * Format experience level for API
 * @param {string|number} experience - Experience in years
 * @returns {string} Formatted experience level
 */
export const formatExperienceLevel = (experience) => {
  const years = parseInt(experience);
  if (isNaN(years)) return 'entry';
  if (years === 0) return 'entry';
  if (years <= 2) return 'junior';
  if (years <= 5) return 'mid';
  if (years <= 10) return 'senior';
  return 'expert';
};

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  if (error.detail) {
    return error.detail;
  }
  if (error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

export default apiService;