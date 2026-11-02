import { useRef } from 'react';
import { useSheet } from '../services/useSheet';
import { AlertCircle, Upload } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ 
  title = "Upload Spreadsheet to Begin", 
  message = "Select a single Excel or CSV sheet containing your students, events, and hours data to populate the application." 
}) {
  const { loadFile, isLoading, error } = useSheet();
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadFile(file);
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="enterprise-empty-state">
      <div className="empty-state-header">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-desc">{message}</p>
      </div>

      {error && (
        <div className="empty-state-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="file-upload-zone" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        <Upload size={22} className="upload-icon" />
        <div className="upload-text">
          <span>{isLoading ? 'Processing file...' : 'Choose Excel / CSV File (.xlsx, .csv)'}</span>
          <span className="upload-subtext">Click to browse your device</span>
        </div>
      </div>

      <div className="empty-state-instructions">
        <p className="single-sheet-hint">
          All views (Students, Events, Hour Records, All Records) automatically feed from your single sheet.
        </p>
      </div>
    </div>
  );
}
