// ==============================================================
// Login.jsx  —  Login Page Component
// ==============================================================
//
// WHAT THIS PAGE DOES:
//   1. Shows a form: Username + Password
//   2. On submit → calls apiService.login(username, password)
//   3. The backend verifies credentials and returns a JWT token
//   4. We store the token in localStorage as 'access_token'
//   5. Redirect the user to the main Dashboard
//
// If the user has no account yet, a link sends them to /register
// ==============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import './Login.css';

function Login() {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [username, setUsername]   = useState(''); // controlled input for username
  const [password, setPassword]   = useState(''); // controlled input for password
  const [error, setError]         = useState(''); // error message to show if login fails
  const [loading, setLoading]     = useState(false); // disables button while request is in-flight

  const navigate = useNavigate(); // used to redirect after successful login

  // ─────────────────────────────────────────
  // HANDLE FORM SUBMIT
  // ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();     // prevent page from refreshing (default HTML form behaviour)
    setError('');           // clear any previous error message
    setLoading(true);       // show loading state on button

    try {
      // Call the backend: POST /token with username + password
      // On success, apiService.login() automatically stores the token
      // in localStorage under the key 'access_token'
      await apiService.login(username, password);

      // ✅ Login successful — go to the main dashboard
      navigate('/');

    } catch (err) {
      // ❌ Login failed — show the error message from the backend
      const message =
        err?.detail ||                  // FastAPI sends errors under "detail"
        err?.error ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);  // re-enable the button regardless of success/failure
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo icon at the top */}
        <div className="auth-logo">🧠</div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your CareerAI account</p>

        {/* Error message — only shown when there's an error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Login form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Username field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit button — disabled while the request is loading */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Link to Register page */}
        <p className="auth-switch">
          Don't have an account?
          <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
