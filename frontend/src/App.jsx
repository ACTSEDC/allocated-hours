import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { searchRecords } from './api';
import './App.css';

function App() {
  const [enrollment, setEnrollment] = useState('');
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const results = useMemo(
    () => (Array.isArray(record?.results) ? record.results : []),
    [record],
  );
  const headers = useMemo(() => {
    if (!results.length || typeof results[0] !== 'object' || results[0] === null) {
      return [];
    }

    return [...new Set(results.flatMap((result) => Object.keys(result)))];
  }, [results]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = enrollment.trim();
    if (!value) {
      setError('Enter an enrollment number to search.');
      setRecord(null);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      setRecord(await searchRecords({ enrollment: value }));
    } catch (requestError) {
      setRecord(null);
      setError(requestError.message || 'Unable to load records.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app">
      <section className="search-card">
        <p className="eyebrow">Allocated Hours</p>
        <h1>Find your records</h1>
        <p className="intro">Search your allocated hours using your enrollment number.</p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="enrollment">Enrollment number</label>
          <div className="search-input-row">
            <input
              id="enrollment"
              type="search"
              value={enrollment}
              onChange={(event) => setEnrollment(event.target.value)}
              placeholder="Enter enrollment number"
              autoComplete="off"
            />
            <button type="submit" disabled={isLoading}>
              <Search size={17} />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && <p className="message error">{error}</p>}

        {record && (
          <section className="results">
            <div className="results-header">
              <div>
                <p className="results-label">Student</p>
                <h2>{record.name || enrollment}</h2>
              </div>
              <div className="total">
                <span>Total</span>
                <strong>{record.total ?? results.length}</strong>
              </div>
            </div>

            {!results.length ? (
              <p className="message">No records found for this enrollment number.</p>
            ) : headers.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        {headers.map((header) => (
                          <td key={header}>{formatValue(result[header])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="value-list">
                {results.map((result, index) => <li key={index}>{formatValue(result)}</li>)}
              </ul>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default App;
