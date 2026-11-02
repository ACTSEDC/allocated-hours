import { useState, useCallback, useMemo } from 'react';
import { SheetContext } from './context';
import { parseExcelFile } from './sheetsService';
import { computeSingleSheetStats } from './dataFeed';

export function SheetProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadFile = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseExcelFile(file);
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to parse Excel file.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLastUpdated(null);
  }, []);

  const masterSheet = useMemo(() => {
    if (!data || !data.sheets || data.sheets.length === 0) return null;
    return data.sheets[0];
  }, [data]);

  const singleSheetStats = useMemo(() => {
    if (!masterSheet) return null;
    return computeSingleSheetStats(masterSheet.headers, masterSheet.rows);
  }, [masterSheet]);

  const isConnected = !!(data && data.sheets && data.sheets.length > 0);

  return (
    <SheetContext.Provider
      value={{
        data,
        isLoading,
        error,
        lastUpdated,
        isConnected,
        loadFile,
        clearData,
        masterSheet,
        singleSheetStats,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}
