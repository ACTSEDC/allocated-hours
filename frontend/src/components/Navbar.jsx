import { useRef } from 'react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { useSheet } from '../services/useSheet';
import './Navbar.css';

export default function Navbar({ pageTitle }) {
  const { isConnected, data, loadFile, clearData, isLoading } = useSheet();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadFile(file);
    } catch {
      // Handled in context
    }
  };

  return (
    <header className="club-navbar">
      <div className="navbar-left">
        <span className="navbar-page-title">{pageTitle}</span>
        {isConnected && data?.spreadsheetTitle && (
          <div className="navbar-sheet-meta">
            <span className="navbar-divider">/</span>
            <FileSpreadsheet size={13} className="meta-icon" />
            <span className="meta-title" title={data.spreadsheetTitle}>
              {data.spreadsheetTitle}
            </span>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {isConnected ? (
          <div className="navbar-actions">
            <button
              type="button"
              className="navbar-action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Replace current spreadsheet"
            >
              <Upload size={12} />
              <span>Replace File</span>
            </button>
            <button
              type="button"
              className="navbar-action-btn danger"
              onClick={clearData}
              title="Clear loaded spreadsheet"
            >
              <X size={12} />
              <span>Clear</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="navbar-action-btn primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload size={12} />
            <span>Upload File</span>
          </button>
        )}
      </div>
    </header>
  );
}
