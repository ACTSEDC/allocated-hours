/**
 * Service to parse Excel / CSV files and export records in browser
 */
import * as XLSX from 'xlsx';

/**
 * Parse an Excel file (.xlsx, .xls, .csv) into sheet data structure
 * @param {File} file - Excel or CSV file
 * @returns {Promise<object>}
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(e.target.result);
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetsData = [];

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (!json || json.length === 0) continue;

          const rawHeaders = json[0] || [];
          const headers = rawHeaders.map((h, i) => String(h || `Column_${i + 1}`).trim());
          const rows = [];

          for (let r = 1; r < json.length; r++) {
            const rowValues = json[r];
            if (!rowValues || rowValues.length === 0) continue;
            const rowObj = {};
            let hasVal = false;
            headers.forEach((h, c) => {
              const val = rowValues[c] !== undefined && rowValues[c] !== null ? String(rowValues[c]).trim() : '';
              rowObj[h] = val;
              if (val !== '') hasVal = true;
            });
            if (hasVal) rows.push(rowObj);
          }

          sheetsData.push({
            name: sheetName,
            headers,
            rows,
            totalRows: rows.length,
          });
        }

        resolve({
          status: 'success',
          spreadsheetTitle: file.name.replace(/\.[^/.]+$/, ''),
          totalSheets: sheetsData.length,
          sheets: sheetsData,
        });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`, { cause: err }));
      }
    };
    reader.onerror = (err) => reject(new Error('File reading failed.', { cause: err }));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export rows to CSV file and trigger browser download
 * @param {string} filename - Output filename (e.g. "records.csv")
 * @param {string[]} headers - Array of column names
 * @param {object[]} rows - Array of row objects
 */
export function exportToCsv(filename, headers, rows) {
  if (!headers || headers.length === 0 || !rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  const csvRows = [];
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  for (const row of rows) {
    const values = headers.map(header => {
      const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
