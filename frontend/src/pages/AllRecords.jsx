import { useState, useMemo } from 'react';
import { useSheet } from '../services/useSheet';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import './AllRecords.css';

export default function AllRecords({ initialSheetName }) {
  const { isConnected, data, masterSheet } = useSheet();
  const [selectedSheetName, setSelectedSheetName] = useState(initialSheetName || '');

  const activeSheet = useMemo(() => {
    if (!data || !data.sheets || data.sheets.length === 0) return null;
    if (selectedSheetName) {
      const match = data.sheets.find(s => s.name === selectedSheetName);
      if (match) return match;
    }
    return masterSheet || data.sheets[0];
  }, [data, selectedSheetName, masterSheet]);

  if (!isConnected || !activeSheet) {
    return (
      <div className="enterprise-page">
        <EmptyState 
          title="Single Spreadsheet Not Connected"
          message="Connect your single Google Sheet URL or upload a single Excel file to explore the complete master records."
        />
      </div>
    );
  }

  return (
    <div className="enterprise-page">
      {/* If more than 1 sheet in workbook, show tabs */}
      {data.sheets.length > 1 && (
        <div className="enterprise-tabs-bar">
          {data.sheets.map(sheet => {
            const isActive = activeSheet?.name === sheet.name;
            return (
              <button
                key={sheet.name}
                type="button"
                className={`enterprise-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedSheetName(sheet.name)}
              >
                <span className="tab-label">{sheet.name}</span>
                <span className="tab-meta">{sheet.totalRows}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Subheader */}
      <div className="page-subtoolbar">
        <div className="subtoolbar-left">
          <span className="subtoolbar-title">Master Records</span>
          <span className="subtoolbar-meta">
            Sheet: <strong>{activeSheet.name}</strong> ({activeSheet.totalRows} rows, {activeSheet.headers.length} columns)
          </span>
        </div>
      </div>

      <DataTable
        headers={activeSheet.headers}
        rows={activeSheet.rows}
        sheetTitle={activeSheet.name}
        emptyMessage={`No records found in worksheet "${activeSheet.name}".`}
      />
    </div>
  );
}
