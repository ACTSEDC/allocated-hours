import RecordsTable from './RecordsTable';
import StatCard from './StatCard';

export default function PageContent({
  activePage,
  headers,
  results,
  totalHours,
  enrollment,
  name,
}) {
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
    return (
      <RecordsTable
        headers={['event', 'role']}
        rows={results}
        emptyMessage="No event records found."
      />
    );
  }

  if (activePage === 'hours') {
    return (
      <RecordsTable
        headers={['event', 'hours']}
        rows={results}
        emptyMessage="No hour records found."
      />
    );
  }

  return <RecordsTable headers={headers} rows={results} emptyMessage="No records found." />;
}
