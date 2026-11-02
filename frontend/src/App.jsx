import { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Search,
  User,
} from 'lucide-react';
import { searchRecords } from './api';
import './App.css';

function App() {
  const [enrollment, setEnrollment] = useState('');
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('overview');

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
  const totalHours = record?.total ?? results.reduce(
    (sum, result) => sum + (Number(result.hours) || 0),
    0,
  );
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'hours', label: 'Hour Records', icon: Clock },
    { id: 'all-records', label: 'All Records', icon: FileText },
  ];

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
    <main className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-title">ClubHours</span>
          <span className="brand-tag">App</span>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className={`status-dot ${record ? 'online' : ''}`} />
          <span>{isLoading ? 'Loading...' : record ? 'Connected' : 'Search required'}</span>
        </div>
      </aside>

      <section className="app-main-content">
        <header className="navbar">
          <div>
            <p className="navbar-label">Allocated Hours</p>
            <h1>{navItems.find((item) => item.id === activePage)?.label}</h1>
          </div>
          <form className="navbar-search" onSubmit={handleSubmit}>
            <label htmlFor="enrollment">Enrollment number</label>
            <input
              id="enrollment"
              type="search"
              value={enrollment}
              onChange={(event) => setEnrollment(event.target.value)}
              placeholder="Search enrollment..."
              autoComplete="off"
            />
            <button type="submit" disabled={isLoading} aria-label="Search">
              <Search size={16} />
            </button>
          </form>
        </header>

        <div className="page-content">
          {!record ? (
            <section className="empty-panel">
              <User size={28} />
              <h2>Search for a student</h2>
              <p>Enter an enrollment number above to load their allocated hour records.</p>
              {error && <p className="message error">{error}</p>}
            </section>
          ) : (
            <>
              {error && <p className="message error">{error}</p>}
              <section className="student-heading">
                <div>
                  <p className="eyebrow">Student record</p>
                  <h2>{record.name || enrollment}</h2>
                  <p>{enrollment}</p>
                </div>
                <div className="total">
                  <span>Total hours</span>
                  <strong>{totalHours}</strong>
                </div>
              </section>
              <PageContent
                activePage={activePage}
                headers={headers}
                results={results}
                totalHours={totalHours}
                enrollment={enrollment}
                name={record.name}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function PageContent({ activePage, headers, results, totalHours, enrollment, name }) {
  if (activePage === 'overview') {
    return (
      <div className="stats-grid">
        <StatCard label="Student" value={name || enrollment} />
        <StatCard label="Events attended" value={results.length} />
        <StatCard label="Hours allocated" value={totalHours} />
      </div>
    );
  }

  if (activePage === 'events') {
    return <RecordsTable headers={['event', 'role']} rows={results} emptyMessage="No event records found." />;
  }

  if (activePage === 'hours') {
    return <RecordsTable headers={['event', 'hours']} rows={results} emptyMessage="No hour records found." />;
  }

  return <RecordsTable headers={headers} rows={results} emptyMessage="No records found." />;
}

function StatCard({ label, value }) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function RecordsTable({ headers, rows, emptyMessage }) {
  if (!rows.length) return <p className="message">{emptyMessage}</p>;

  return (
    <section className="content-card table-wrap">
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => <td key={header}>{formatValue(row[header])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default App;
