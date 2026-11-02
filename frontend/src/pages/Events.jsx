import { useState, useMemo } from 'react';
import { useSheet } from '../services/useSheet';
import { extractEventsFromSingleSheet } from '../services/dataFeed';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import './Events.css';

export default function Events() {
  const { isConnected, masterSheet } = useSheet();
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'raw'

  const eventData = useMemo(() => {
    if (!masterSheet) return null;
    return extractEventsFromSingleSheet(masterSheet.headers, masterSheet.rows);
  }, [masterSheet]);

  if (!isConnected || !masterSheet) {
    return (
      <div className="enterprise-page">
        <EmptyState 
          title="Event Records Not Connected"
          message="Event records feed directly from your single master spreadsheet. Connect your Google Sheet or upload an Excel file to display event data."
        />
      </div>
    );
  }

  const isAggregated = eventData?.isAggregated;
  const currentHeaders = viewMode === 'summary' && isAggregated ? eventData.headers : masterSheet.headers;
  const currentRows = viewMode === 'summary' && isAggregated ? eventData.rows : masterSheet.rows;

  return (
    <div className="enterprise-page">
      <div className="page-subtoolbar">
        <div className="subtoolbar-left">
          <span className="subtoolbar-title">Events</span>
          <span className="subtoolbar-meta">
            From single sheet: <strong>{masterSheet.name}</strong>
            {isAggregated && ` (${eventData.totalEvents} unique events)`}
          </span>
        </div>

        {isAggregated && (
          <div className="subtoolbar-right">
            <span className="subtoolbar-label">View:</span>
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'summary' ? 'active' : ''}`}
                onClick={() => setViewMode('summary')}
              >
                Event Summary
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'raw' ? 'active' : ''}`}
                onClick={() => setViewMode('raw')}
              >
                All Rows ({masterSheet.totalRows})
              </button>
            </div>
          </div>
        )}
      </div>

      <DataTable
        headers={currentHeaders}
        rows={currentRows}
        sheetTitle="Events"
        emptyMessage="No event records found in sheet."
      />
    </div>
  );
}
