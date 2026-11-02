import { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { exportToCsv } from '../services/sheetsService';
import './DataTable.css';

export default function DataTable({ 
  headers = [], 
  rows = [], 
  sheetTitle = "Records",
  emptyMessage = "No records found in this worksheet."
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('');
  const [selectedColumnValue, setSelectedColumnValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Distinct values for the selected column filter
  const filterOptions = useMemo(() => {
    if (!selectedColumnFilter || !rows.length) return [];
    const set = new Set();
    for (const r of rows) {
      const val = r[selectedColumnFilter];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        set.add(String(val).trim());
      }
    }
    return Array.from(set).sort();
  }, [selectedColumnFilter, rows]);

  // Handle Sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn('');
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter & Search logic
  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Global Search across all columns
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(row => {
        return headers.some(h => {
          const val = row[h];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      });
    }

    // Specific Column Filter
    if (selectedColumnFilter && selectedColumnValue) {
      result = result.filter(row => {
        const val = row[selectedColumnFilter];
        return String(val).trim().toLowerCase() === selectedColumnValue.toLowerCase();
      });
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn] !== undefined ? String(a[sortColumn]) : '';
        const valB = b[sortColumn] !== undefined ? String(b[sortColumn]) : '';
        
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        return sortDirection === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
      });
    }

    return result;
  }, [rows, headers, searchTerm, selectedColumnFilter, selectedColumnValue, sortColumn, sortDirection]);

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const handleExport = () => {
    const filename = `${sheetTitle.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
    exportToCsv(filename, headers, filteredRows);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedColumnFilter('');
    setSelectedColumnValue('');
    setCurrentPage(1);
  };

  if (!headers || headers.length === 0) {
    return (
      <div className="table-empty-box">
        <span>{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="enterprise-table-container">
      {/* Compact Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          {/* Search Box */}
          <div className="toolbar-search-wrap">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              className="toolbar-search-input"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="toolbar-clear-btn" 
                onClick={() => setSearchTerm('')}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Inline Column Filter */}
          <select
            className="toolbar-select"
            value={selectedColumnFilter}
            onChange={(e) => {
              setSelectedColumnFilter(e.target.value);
              setSelectedColumnValue('');
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by column...</option>
            {headers.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          {selectedColumnFilter && (
            <select
              className="toolbar-select"
              value={selectedColumnValue}
              onChange={(e) => {
                setSelectedColumnValue(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All {selectedColumnFilter} values</option>
              {filterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {(searchTerm || selectedColumnFilter || selectedColumnValue) && (
            <button type="button" className="toolbar-reset-link" onClick={clearFilters}>
              Reset
            </button>
          )}
        </div>

        <div className="toolbar-right">
          <button 
            type="button" 
            className="toolbar-btn" 
            onClick={handleExport}
            disabled={filteredRows.length === 0}
            title="Export filtered records to CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Scroll Area */}
      <div className="table-scroll-wrap">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th className="th-index">#</th>
              {headers.map(header => {
                const isSorted = sortColumn === header;
                return (
                  <th 
                    key={header} 
                    onClick={() => handleSort(header)}
                    className={`th-sortable ${isSorted ? 'th-sorted' : ''}`}
                  >
                    <div className="th-content">
                      <span>{header}</span>
                      <span className="th-sort-icon">
                        {isSorted ? (
                          sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={11} className="th-neutral" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="td-empty">
                  {searchTerm || selectedColumnValue ? 'No records match filter criteria.' : 'No records found.'}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="td-index">{startIndex + idx + 1}</td>
                  {headers.map(header => (
                    <td key={header} className="td-cell">
                      {row[header] !== undefined && row[header] !== null ? String(row[header]) : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination Bar */}
      <div className="table-pagination">
        <div className="pagination-count">
          Showing <strong>{totalRows > 0 ? startIndex + 1 : 0}</strong>–<strong>{Math.min(startIndex + rowsPerPage, totalRows)}</strong> of <strong>{totalRows}</strong>
          {totalRows !== rows.length && (
            <span className="pagination-total-note"> ({rows.length} total)</span>
          )}
        </div>

        <div className="pagination-controls">
          <div className="pagination-rows-select">
            <span className="pagination-label">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="toolbar-select compact"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="pagination-nav">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              aria-label="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="pagination-page-text">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              aria-label="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
