import React, { useState } from 'react';
import { Mail, Download, Copy, Check, Eye, FileText, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import './CoverLetterGenerator.css';

const CoverLetterGenerator = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const {
    generated_letter,
    word_count,
    tone,
    key_highlights = [],
    customization_notes,
    opening_hook,
    call_to_action,
    suggested_improvements = [],
  } = data;

  const handleCopy = () => {
    if (generated_letter) {
      navigator.clipboard.writeText(generated_letter);
      setCopied(true);
      toast.success('Cover letter copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generated_letter) {
      const element = document.createElement('a');
      const file = new Blob([generated_letter], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `cover_letter_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Cover letter downloaded!');
    }
  };

  const handlePrint = () => {
    if (generated_letter) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Cover Letter</title>
            <style>
              body {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.8;
                padding: 2rem;
                max-width: 800px;
                margin: 0 auto;
              }
              pre {
                white-space: pre-wrap;
                font-family: inherit;
                font-size: 12pt;
              }
            </style>
          </head>
          <body>
            <pre>${generated_letter}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="cover-letter-generator">
      {/* Header with Actions */}
      <div className="letter-header">
        <div className="header-info">
          <Mail size={32} />
          <div>
            <h2>Your Professional Cover Letter</h2>
            <div className="letter-meta">
              <span>📝 {word_count || 0} words</span>
              {tone && <span>🎭 Tone: {tone}</span>}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleCopy} className="action-button copy">
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="action-button download">
            <Download size={20} />
            Download
          </button>
          <button onClick={handlePrint} className="action-button print">
            <Eye size={20} />
            Print
          </button>
        </div>
      </div>

      {/* Cover Letter Content */}
      <div className="letter-content-section">
        <div className="letter-paper">
          <pre className="letter-text">{generated_letter}</pre>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="metadata-section">
        {/* Key Highlights */}
        {key_highlights.length > 0 && (
          <div className="metadata-card highlights">
            <div className="metadata-header">
              <Sparkles size={24} />
              <h3>Key Highlights Included</h3>
            </div>
            <ul className="highlights-list">
              {key_highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Customization Notes */}
        {customization_notes && (
          <div className="metadata-card customization">
            <div className="metadata-header">
              <FileText size={24} />
              <h3>Customization Details</h3>
            </div>
            <p className="customization-text">{customization_notes}</p>
          </div>
        )}
      </div>

      {/* Letter Structure Breakdown */}
      {(opening_hook || call_to_action) && (
        <div className="structure-section">
          <h3 className="structure-title">Letter Structure Analysis</h3>
          <div className="structure-grid">
            {opening_hook && (
              <div className="structure-card opening">
                <h4>Opening Hook</h4>
                <p>{opening_hook}</p>
              </div>
            )}
            {call_to_action && (
              <div className="structure-card closing">
                <h4>Call to Action</h4>
                <p>{call_to_action}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested Improvements */}
      {suggested_improvements.length > 0 && (
        <div className="improvements-section">
          <div className="improvements-header">
            <Sparkles size={24} />
            <h3>Optional Improvements</h3>
          </div>
          <ul className="improvements-list">
            {suggested_improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips Section */}
      <div className="tips-section">
        <h3 className="tips-title">💡 Pro Tips for Using This Cover Letter</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">1</div>
            <div className="tip-content">
              <h4>Personalize Further</h4>
              <p>Add specific company details or recent news about the organization to show genuine interest.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">2</div>
            <div className="tip-content">
              <h4>Proofread Carefully</h4>
              <p>Review for any errors and ensure contact information is accurate before sending.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">3</div>
            <div className="tip-content">
              <h4>Save as PDF</h4>
              <p>When sending, convert to PDF to maintain formatting and professional appearance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;