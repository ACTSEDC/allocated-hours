import {
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'hours', label: 'Hour Records', icon: Clock },
  { id: 'all-records', label: 'All Records', icon: FileText },
];

export default function Sidebar({ activePage, onPageChange, isLoading, hasRecord }) {
  return (
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
            onClick={() => onPageChange(id)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className={`status-dot ${hasRecord ? 'online' : ''}`} />
        <span>{isLoading ? 'Loading...' : hasRecord ? 'Connected' : 'Search required'}</span>
      </div>
    </aside>
  );
}
