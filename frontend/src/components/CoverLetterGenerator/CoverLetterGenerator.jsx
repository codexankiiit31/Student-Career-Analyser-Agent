// CoverLetterGenerator.jsx
import React, { useState } from "react";
import { Copy, Download, Printer, Check } from "lucide-react";
import { toast } from "react-toastify";
import "./CoverLetterGenerator.css";

const CoverLetterGenerator = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // Guard: require either generated_letter or a successful status
  const letter = data?.generated_letter || data?.cover_letter || "";
  const isReady = data && (data.status === "success" || letter.length > 10);

  if (!isReady) {
    return (
      <div className="clg-empty">
        <p>No cover letter available. Generate one from the analysis tab.</p>
      </div>
    );
  }

  const { word_count = 0, tone = "" } = data;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      toast.success("Cover letter copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDownload = () => {
    try {
      const el = document.createElement("a");
      const file = new Blob([letter], { type: "text/plain" });
      el.href = URL.createObjectURL(file);
      el.download = `cover_letter_${Date.now()}.txt`;
      document.body.appendChild(el);
      el.click();
      el.remove();
      toast.success("Downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      toast.error("Unable to open print window");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter</title>
          <style>
            body { font-family: Georgia, 'Times New Roman', serif; padding: 2rem; color:#222; line-height:1.6; }
            pre { white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body><pre>${escapeHtml(letter)}</pre></body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="clg-root">
      <div className="clg-header">
        <div className="clg-meta">
          <div className="clg-title">Cover Letter</div>
          <div className="clg-sub">
            <span className="clg-count">📝 {word_count} words</span>
            {tone && <span className="clg-tone">• Tone: {tone}</span>}
          </div>
        </div>

        <div className="clg-actions">
          <button className="clg-btn" onClick={handleCopy} aria-label="Copy">
            {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
          </button>

          <button className="clg-btn" onClick={handleDownload} aria-label="Download">
            <Download size={16} /> Download
          </button>

          <button className="clg-btn" onClick={handlePrint} aria-label="Print">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="clg-body">
        <pre className="clg-letter" aria-label="Generated cover letter">
          {letter}
        </pre>
      </div>
    </div>
  );
};

// small helper to avoid breaking HTML when printing
function escapeHtml(text = "") {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default CoverLetterGenerator;
