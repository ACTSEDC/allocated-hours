import { useMemo } from 'react';
import { useSheet } from '../services/useSheet';
import { detectColumns } from '../services/dataFeed';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import './HourRecords.css';

export default function HourRecords() {
  const { isConnected, masterSheet } = useSheet();

  const cols = useMemo(() => {
    if (!masterSheet) return null;
    return detectColumns(masterSheet.headers);
  }, [masterSheet]);

  const totalAllocatedHours = useMemo(() => {
    if (!masterSheet || !cols?.hoursCol) return null;
    let sum = 0;
    let validCount = 0;
    for (const r of masterSheet.rows) {
      const val = parseFloat(r[cols.hoursCol]);
      if (!isNaN(val)) {
        sum += val;
        validCount++;
      }
    }
    return validCount > 0 ? { columnName: cols.hoursCol, total: Math.round(sum * 100) / 100 } : null;
  }, [masterSheet, cols]);

  if (!isConnected || !masterSheet) {
    return (
      <div className="enterprise-page">
        <EmptyState 
          title="Hour Records Not Connected"
          message="Allocated club hours and volunteer logs feed directly from your single master spreadsheet. Connect your Google Sheet or upload an Excel file to view hour logs."
        />
      </div>
    );
  }

  return (
    <div className="enterprise-page">
      <div className="page-subtoolbar">
        <div className="subtoolbar-left">
          <span className="subtoolbar-title">Allocated Hour Records</span>
          <span className="subtoolbar-meta">
            From single sheet: <strong>{masterSheet.name}</strong> ({masterSheet.totalRows} logs)
          </span>
          {totalAllocatedHours && (
            <span className="hours-stat-pill">
              Total {totalAllocatedHours.columnName}: <strong>{totalAllocatedHours.total.toLocaleString()}</strong>
            </span>
          )}
        </div>
      </div>

      <DataTable
        headers={masterSheet.headers}
        rows={masterSheet.rows}
        sheetTitle="Hour Records"
        emptyMessage="No hour records found in sheet."
      />
    </div>
  );
}
