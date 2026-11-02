import { useMemo, useState } from 'react';
import { searchRecords } from './services/api';
import EmptyState from './components/EmptyState';
import Navbar from './components/Navbar';
import PageContent from './components/PageContent';
import Sidebar from './components/Sidebar';
import StudentSummary from './components/StudentSummary';
import './App.css';

const pageTitles = {
  overview: 'Overview',
  events: 'Events',
  hours: 'Hour Records',
  'all-records': 'All Records',
};

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
    if (!results.length || typeof results[0] !== 'object' || results[0] === null) return [];
    return [...new Set(results.flatMap((result) => Object.keys(result)))];
  }, [results]);
  const totalHours = record?.total ?? results.reduce(
    (sum, result) => sum + (Number(result.hours) || 0),
    0,
  );

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
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        isLoading={isLoading}
        hasRecord={Boolean(record)}
      />
      <section className="app-main-content">
        <Navbar
          pageTitle={pageTitles[activePage]}
          enrollment={enrollment}
          isLoading={isLoading}
          onEnrollmentChange={setEnrollment}
          onSubmit={handleSubmit}
        />
        <div className="page-content">
          {!record ? (
            <EmptyState error={error} />
          ) : (
            <>
              {error && <p className="message error">{error}</p>}
              <StudentSummary
                name={record.name}
                enrollment={enrollment}
                totalHours={totalHours}
              />
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

export default App;
