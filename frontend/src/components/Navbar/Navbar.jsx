import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Home, Target, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/job-analyzer', label: 'Job Analyzer', icon: Target },
    { path: '/market-analyzer', label: 'Market Analyzer', icon: Target },
    { path: '/roadmap', label: 'RoadMap', icon: Target },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Briefcase size={28} />
          <span>AI Career Agent</span>
        </Link>

        <ul className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path} className="nav-link">
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;