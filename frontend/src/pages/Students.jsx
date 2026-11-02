import { useState, useMemo } from 'react';
import { useSheet } from '../services/useSheet';
import { extractStudentsFromSingleSheet } from '../services/dataFeed';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import './Students.css';

export default function Students() {
  const { isConnected, masterSheet } = useSheet();
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'raw'

  const studentData = useMemo(() => {
    if (!masterSheet) return null;
    return extractStudentsFromSingleSheet(masterSheet.headers, masterSheet.rows);
  }, [masterSheet]);

  if (!isConnected || !masterSheet) {
    return (
      <div className="enterprise-page">
        <EmptyState 
          title="Student Records Not Connected"
          message="Student records feed directly from your single master spreadsheet. Connect your Google Sheet or upload an Excel file to display student data."
        />
      </div>
    );
  }

  const isAggregated = studentData?.isAggregated;
  const currentHeaders = viewMode === 'summary' && isAggregated ? studentData.headers : masterSheet.headers;
  const currentRows = viewMode === 'summary' && isAggregated ? studentData.rows : masterSheet.rows;

  return (
    <div className="enterprise-page">
      {/* Subtoolbar */}
      <div className="page-subtoolbar">
        <div className="subtoolbar-left">
          <span className="subtoolbar-title">Students</span>
          <span className="subtoolbar-meta">
            From single sheet: <strong>{masterSheet.name}</strong> 
            {isAggregated && ` (${studentData.totalStudents} unique students)`}
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
                Student Summary
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
        sheetTitle="Students"
        emptyMessage="No student records found in sheet."
      />
    </div>
  );
}
