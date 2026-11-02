import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  Layers, 
  FileSpreadsheet
} from 'lucide-react';
import { useSheet } from '../services/useSheet';
import actsLogo from '../assets/acts logo png.png';
import './Sidebar.css';

export default function Sidebar({ activePage, setActivePage }) {
  const { isConnected, data, isLoading } = useSheet();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'hours', label: 'Hour Records', icon: Clock },
    { id: 'all-records', label: 'All Records', icon: Layers },
  ];

  return (
    <aside className="club-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <img src={actsLogo} alt="ACTS Logo" className="brand-logo-img" />
        <span className="brand-title">ClubHours</span>
        <span className="brand-tag">ACTS</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={15} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.id === 'all-records' && isConnected && data?.sheets && (
                <span className="nav-count">{data.sheets.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Compact Status Indicator */}
      <div className="sidebar-footer">
        <div className="sidebar-status-row">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span className="status-label">
            {isLoading ? 'Loading...' : (isConnected ? 'Sheet Loaded' : 'No File Loaded')}
          </span>
        </div>
        {isConnected && data?.spreadsheetTitle && (
          <div className="sidebar-sheet-title" title={data.spreadsheetTitle}>
            <FileSpreadsheet size={12} />
            <span>{data.spreadsheetTitle}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
