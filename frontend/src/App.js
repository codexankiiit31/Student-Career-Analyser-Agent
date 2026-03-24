// ==============================================================
// App.js  —  Main Application with Routes and Auth Guards
// ==============================================================
//
// WHAT'S CHANGED (JWT Auth):
//   - Added /login route   → Login page (public, no auth needed)
//   - Added /register route → Register page (public, no auth needed)
//   - All other routes are now wrapped in <ProtectedRoute>
//     so unauthenticated users are redirected to /login automatically
//
// HOW ProtectedRoute WORKS:
//   If the user has a token in localStorage → show the page
//   If not → redirect to /login
// ==============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout components (visible on all pages)
import Navbar    from './components/Navbar/Navbar.jsx';
import ChatWidget from './components/ChatWidget/ChatWidget.jsx';

// Catches unhandled crashes — prevents blank white screen
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Route guard — redirects to /login if user is not authenticated
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages — accessible without login
import Login    from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Protected pages — require login
import Dashboard      from './pages/Dashboard.jsx';
import JobAnalyzer    from './pages/JobAnalyzer.jsx';
import MarketAnalyzer from './pages/MarketAnalyzer.jsx';
import RoadMap        from './pages/RoadMap.jsx';
import Settings       from './pages/Settings.jsx';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <div className="App">

        {/* Navbar is shown on every page (includes Login/Logout button) */}
        <Navbar />

        <main className="main-content">
          <Routes>

            {/* ── PUBLIC ROUTES ─────────────────────────────────
                These pages do NOT require the user to be logged in.
                Anyone can access /login and /register.
            ──────────────────────────────────────────────────── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── PROTECTED ROUTES ──────────────────────────────
                Every route below is wrapped in <ProtectedRoute>.
                If the user is not logged in (no token in localStorage),
                ProtectedRoute automatically redirects them to /login.
                Once logged in, the page renders normally.
            ──────────────────────────────────────────────────── */}

            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            <Route path="/job-analyzer" element={
              <ProtectedRoute><JobAnalyzer /></ProtectedRoute>
            } />

            <Route path="/market-analyzer" element={
              <ProtectedRoute><MarketAnalyzer /></ProtectedRoute>
            } />

            <Route path="/roadmap" element={
              <ProtectedRoute><RoadMap /></ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />

            {/* Redirects for old route paths */}
            <Route path="/upload"       element={<ProtectedRoute><JobAnalyzer /></ProtectedRoute>} />
            <Route path="/match"        element={<ProtectedRoute><JobAnalyzer /></ProtectedRoute>} />
            <Route path="/ats"          element={<ProtectedRoute><JobAnalyzer /></ProtectedRoute>} />
            <Route path="/cover-letter" element={<ProtectedRoute><JobAnalyzer /></ProtectedRoute>} />

          </Routes>
        </main>

        {/* Toast notifications — shown on top of any page */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Floating AI Chatbot — visible on all pages except login/register */}
        <ChatWidget />

      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;