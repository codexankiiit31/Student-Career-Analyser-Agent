// ==============================================================
// Navbar.jsx  —  Navigation Bar with Auth State
// ==============================================================
//
// WHAT'S NEW (JWT Auth):
//   - Reads 'access_token' from localStorage to know if user is logged in
//   - If logged in  → shows a "Logout" button in the top-right
//   - If not logged in → shows a "Login" button that links to /login
//   - Logout clears the token from localStorage and redirects to /login
//
// The rest of the navbar is unchanged (nav links, brand, mobile menu).
// ==============================================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Home, FileSearch, BarChart3,
  Map, Settings, Zap, Menu, X, LogIn, LogOut
} from 'lucide-react';
import './Navbar.css';

// List of navigation links shown in the navbar
const navItems = [
  { path: '/',                label: 'Home',      icon: Home      },
  { path: '/job-analyzer',    label: 'Job Analyzer', icon: FileSearch },
  { path: '/market-analyzer', label: 'Market',    icon: BarChart3 },
  { path: '/roadmap',         label: 'Roadmap',   icon: Map       },
  { path: '/settings',        label: 'Settings',  icon: Settings  },
];

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── Auth State ──────────────────────────────────────────────
  // Check if there's a token in localStorage. If yes → user is logged in.
  // We read this fresh on every render so the button updates immediately
  // after login or logout without needing a full page reload.
  const isLoggedIn = Boolean(localStorage.getItem('access_token'));

  // ─── Logout Handler ──────────────────────────────────────────
  const handleLogout = () => {
    // 1. Remove the JWT token so the user is considered "not logged in"
    localStorage.removeItem('access_token');

    // 2. Close mobile menu if open
    setMobileOpen(false);

    // 3. Redirect to /login — ProtectedRoute will also enforce this
    navigate('/login');
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* ── Brand ───────────────────────────────────────────── */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <BrainCircuit size={18} />
          </div>
          <span className="brand-text">CareerAI</span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────── */}
        <ul className="navbar-menu">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path} className="nav-link">
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Right side: Auth button + CTA ────────────────────── */}
        <div className="navbar-cta">

          {isLoggedIn ? (
            // LOGGED IN → show Logout button
            <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          ) : (
            // NOT LOGGED IN → show Login link
            <Link to="/login" className="nav-login-btn" title="Login">
              <LogIn size={14} />
              <span>Login</span>
            </Link>
          )}

          {/* Analyze Now button — always visible */}
          <Link to="/job-analyzer" className="nav-cta-btn">
            <Zap size={14} /> Analyze Now
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* ── Mobile dropdown menu ─────────────────────────────── */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}

          {/* Mobile auth button */}
          {isLoggedIn ? (
            <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn size={16} /> Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}