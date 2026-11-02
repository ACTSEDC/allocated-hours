import { useRef } from 'react';
import { 
  Upload,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useSheet } from '../services/useSheet';
import EmptyState from '../components/EmptyState';
import './Overview.css';

export default function Overview({ setActivePage }) {
  const { 
    isConnected, 
    data, 
    loadFile,
    clearData, 
    error,
    masterSheet,
    singleSheetStats
  } = useSheet();

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
    <div className="enterprise-page">
      {!isConnected || !masterSheet ? (
        <EmptyState 
          title="Upload Spreadsheet to Begin"
          message="Select a single Excel or CSV file containing students, events, and hours records to populate the system."
        />
      ) : (
        <>
          {/* Metadata Bar */}
          <div className="overview-meta-bar">
            <div className="meta-item">
              <span className="meta-label">File</span>
              <span className="meta-value bold">{data.spreadsheetTitle || masterSheet.name}</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <span className="meta-label">Total Rows</span>
              <span className="meta-value">{masterSheet.totalRows.toLocaleString()}</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <span className="meta-label">Unique Students</span>
              <span className="meta-value">{singleSheetStats?.uniqueStudents ?? '-'}</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <span className="meta-label">Unique Events</span>
              <span className="meta-value">{singleSheetStats?.uniqueEvents ?? '-'}</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <span className="meta-label">Total Hours</span>
              <span className="meta-value status-online">
                {singleSheetStats?.totalHours?.toLocaleString() ?? '-'}
              </span>
            </div>
          </div>

          {/* File Control Bar */}
          <div className="endpoint-bar">
            <div className="endpoint-info">
              <span className="endpoint-label">Active Sheet:</span>
              <span className="endpoint-url">{data.spreadsheetTitle}</span>
            </div>

            <div className="endpoint-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button 
                type="button" 
                className="endpoint-action-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Upload a different Excel sheet"
              >
                <Upload size={12} />
                <span>Replace File</span>
              </button>

              <button 
                type="button" 
                className="endpoint-action-btn danger" 
                onClick={clearData}
                title="Clear current spreadsheet"
              >
                <X size={12} />
                <span>Clear Data</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="overview-alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Single Sheet Column Mapping Summary */}
          <div className="sheets-table-container">
            <div className="sheets-table-header">
              <span className="sheets-table-title">Single Sheet Structure & Data Feed</span>
            </div>

            <div className="data-feed-summary-box">
              <div className="feed-grid">
                <div className="feed-col">
                  <span className="feed-col-label">Mapped Student Column:</span>
                  <span className="feed-col-value">
                    {singleSheetStats?.cols?.studentNameCol || singleSheetStats?.cols?.studentIdCol ? (
                      <span className="feed-tag success">
                        <CheckCircle2 size={11} />
                        {singleSheetStats.cols.studentNameCol || singleSheetStats.cols.studentIdCol}
                      </span>
                    ) : (
                      <span className="feed-tag warning">Auto-detecting</span>
                    )}
                  </span>
                </div>

                <div className="feed-col">
                  <span className="feed-col-label">Mapped Event Column:</span>
                  <span className="feed-col-value">
                    {singleSheetStats?.cols?.eventNameCol ? (
                      <span className="feed-tag success">
                        <CheckCircle2 size={11} />
                        {singleSheetStats.cols.eventNameCol}
                      </span>
                    ) : (
                      <span className="feed-tag warning">Auto-detecting</span>
                    )}
                  </span>
                </div>

                <div className="feed-col">
                  <span className="feed-col-label">Mapped Hours Column:</span>
                  <span className="feed-col-value">
                    {singleSheetStats?.cols?.hoursCol ? (
                      <span className="feed-tag success">
                        <CheckCircle2 size={11} />
                        {singleSheetStats.cols.hoursCol}
                      </span>
                    ) : (
                      <span className="feed-tag warning">Auto-detecting</span>
                    )}
                  </span>
                </div>

                <div className="feed-col">
                  <span className="feed-col-label">Department Column:</span>
                  <span className="feed-col-value">
                    {singleSheetStats?.cols?.deptCol ? (
                      <span className="feed-tag success">
                        <CheckCircle2 size={11} />
                        {singleSheetStats.cols.deptCol}
                      </span>
                    ) : (
                      <span className="feed-tag muted">Not specified</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="all-headers-strip">
                <span className="all-headers-label">All Available Sheet Columns ({masterSheet.headers.length}):</span>
                <span className="all-headers-list">{masterSheet.headers.join(' • ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="quick-views-bar">
            <button type="button" className="quick-view-btn" onClick={() => setActivePage('students')}>
              View Students Summary ({singleSheetStats?.uniqueStudents ?? 0})
            </button>
            <button type="button" className="quick-view-btn" onClick={() => setActivePage('events')}>
              View Events Summary ({singleSheetStats?.uniqueEvents ?? 0})
            </button>
            <button type="button" className="quick-view-btn" onClick={() => setActivePage('hours')}>
              View Hour Logs ({masterSheet.totalRows})
            </button>
            <button type="button" className="quick-view-btn primary" onClick={() => setActivePage('all-records')}>
              Open Full Master Sheet Table
            </button>
          </div>
        </>
      )}
    </div>
  );
}
