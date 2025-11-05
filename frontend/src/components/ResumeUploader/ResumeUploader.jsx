import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import apiService from '../../services/api';
import './ResumeUploader.css';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a PDF or DOCX file',
      });
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file first',
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const response = await apiService.uploadResume(file);
      setUploadStatus({
        type: 'success',
        message: response.message,
        data: response,
      });

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.detail || 'Failed to upload resume',
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadStatus(null);
  };

  return (
    <div className="resume-uploader">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <Upload size={48} className="upload-icon" />
            <h3>Upload Your Resume</h3>
            <p>Drag and drop your resume here, or click to browse</p>
            <p className="file-types">Supported formats: PDF, DOCX</p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileInput}
              className="file-input"
              id="resume-file"
            />
            <label htmlFor="resume-file" className="browse-button">
              Browse Files
            </label>
          </>
        ) : (
          <div className="file-selected">
            <FileText size={48} className="file-icon" />
            <h3>{file.name}</h3>
            <p>{(file.size / 1024).toFixed(2)} KB</p>
            <div className="file-actions">
              <button onClick={handleUpload} disabled={uploading} className="upload-button">
                {uploading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Uploading...
                  </>
                ) : (
                  'Upload Resume'
                )}
              </button>
              <button onClick={clearFile} className="clear-button" disabled={uploading}>
                Choose Different File
              </button>
            </div>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.type}`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <div className="status-content">
            <p className="status-message">{uploadStatus.message}</p>
            {uploadStatus.data && (
              <div className="status-details">
                <span>📄 Length: {uploadStatus.data.resume_length} characters</span>
                <span>📝 Words: {uploadStatus.data.word_count}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;