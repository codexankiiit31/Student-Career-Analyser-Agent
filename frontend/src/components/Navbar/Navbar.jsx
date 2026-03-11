import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BrainCircuit, Home, FileSearch, BarChart3,
  Map, Settings, Zap, Menu, X
} from 'lucide-react';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/job-analyzer', label: 'Job Analyzer', icon: FileSearch },
  { path: '/market-analyzer', label: 'Market', icon: BarChart3 },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <BrainCircuit size={18} />
          </div>
          <span className="brand-text">CareerAI</span>
        </Link>

        {/* Desktop menu — pill nav */}
        <ul className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
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

        {/* Right CTA */}
        <div className="navbar-cta">
          <Link to="/job-analyzer" className="nav-cta-btn">
            <Zap size={14} /> Analyze Now
          </Link>
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
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
        </div>
      )}
    </nav>
  );
}