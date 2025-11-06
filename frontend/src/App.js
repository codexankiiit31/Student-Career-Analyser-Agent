// ==================== src/App.js ====================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import JobAnalyzer from './pages/JobAnalyzer.jsx';
import Settings from './pages/Settings.jsx';

import './App.css';
import MarketAnalyzer from './pages/MarketAnalyzer.jsx';
import RoadMap from './pages/RoadMap.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/job-analyzer" element={<JobAnalyzer />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Redirect old routes to job-analyzer */}
            <Route path="/upload" element={<JobAnalyzer />} />
            <Route path="/match" element={<JobAnalyzer />} />
            <Route path="/ats" element={<JobAnalyzer />} />
            <Route path="/cover-letter" element={<JobAnalyzer />} />
            <Route path="/market-analyzer" element={<MarketAnalyzer />} />
            <Route path="/roadmap" element={<RoadMap />} />
          </Routes>
        </main>
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
      </div>
    </Router>
  );
}

export default App;