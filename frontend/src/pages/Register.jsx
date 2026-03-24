// ==============================================================
// Register.jsx  —  Registration Page Component
// ==============================================================
//
// WHAT THIS PAGE DOES:
//   1. Shows a form: Username + Email + Password + Confirm Password
//   2. Validates that both passwords match BEFORE sending to the server
//   3. On submit → calls apiService.register(username, email, password)
//   4. On success → shows a success message then redirects to /login
//   5. On failure → shows the error from the backend (e.g. "username taken")
//
// The user must then log in with their new credentials on /login
// ==============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import './Register.css';

function Register() {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]               = useState('');   // backend or validation error
  const [success, setSuccess]           = useState('');   // success message after registration
  const [loading, setLoading]           = useState(false);

  const navigate = useNavigate();

  // ─────────────────────────────────────────
  // DERIVED STATE: do passwords currently match?
  // This updates live as the user types, giving instant feedback
  // ─────────────────────────────────────────
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  // ─────────────────────────────────────────
  // HANDLE FORM SUBMIT
  // ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();   // prevent default page reload on form submit
    setError('');
    setSuccess('');

    // ── Client-side validation ──────────────
    // Check passwords match before even sending to the backend.
    // This avoids an unnecessary network request.
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter them.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Call the backend: POST /register with { username, email, password }
      const result = await apiService.register(username, email, password);

      // ✅ Registration successful!
      setSuccess(result.message || 'Account created! Redirecting to login...');

      // Wait 1.5 seconds so the user can read the success message, then redirect
      setTimeout(() => navigate('/login'), 1500);

    } catch (err) {
      // ❌ Registration failed — e.g. username already taken
      const message =
        err?.detail ||
        err?.error ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo icon */}
        <div className="auth-logo">🚀</div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join CareerAI and unlock your potential</p>

        {/* Error message — only shown when there's an error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Success message — shown after successful registration */}
        {success && <div className="auth-success">{success}</div>}

        {/* Registration form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Username field */}
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm password field with live match feedback */}
          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {/* Live feedback: shows ✓ or ✗ as user types the confirmation */}
            {passwordsMatch   && <span className="password-hint match">✓ Passwords match</span>}
            {passwordsMismatch && <span className="password-hint no-match">✗ Passwords do not match</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        {/* Link to Login page */}
        <p className="auth-switch">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
