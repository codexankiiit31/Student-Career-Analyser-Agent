// / ==================== pages/Settings.jsx ====================
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Settings as SettingsIcon, Trash2, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import '../Styles/Pages.css';

const Settings = () => {
  const [clearing, setClearing] = useState(false);

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    setClearing(true);

    try {
      await apiService.clearData();
      toast.success('All data cleared successfully!');
    } catch (error) {
      toast.error('Failed to clear data');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <SettingsIcon size={40} className="page-icon" />
        <h1>Settings</h1>
        <p>Manage your application settings and data</p>
      </div>

      <div className="settings-section">
        <div className="settings-card">
          <h3>Data Management</h3>
          <p>Clear all uploaded resumes and job descriptions from the system.</p>
          <button onClick={handleClearData} disabled={clearing} className="danger-button">
            <Trash2 size={20} />
            {clearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>

        <div className="info-card">
          <AlertCircle size={32} />
          <h3>About</h3>
          <p>AI Career Agent v1.0</p>
          <p>Powered by Google Gemini and FastAPI</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;