import { useState } from 'react';
import { SheetProvider } from './services/SheetContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import Students from './pages/Students';
import Events from './pages/Events';
import HourRecords from './pages/HourRecords';
import AllRecords from './pages/AllRecords';
import './App.css';

function MainLayout() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedSheetName, setSelectedSheetName] = useState('');

  const getPageTitle = () => {
    switch (activePage) {
      case 'overview':
        return 'System Overview & Sheets Status';
      case 'students':
        return 'Student Directory';
      case 'events':
        return 'Event Records';
      case 'hours':
        return 'Allocated Hour Logs';
      case 'all-records':
        return 'Complete Spreadsheet Records';
      default:
        return 'ClubHours';
    }
  };

  return (
    <div className="app-layout">
      {/* Dark Navy Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="app-main-content">
        <Navbar pageTitle={getPageTitle()} />
        
        <main className="app-page-wrapper">
          {activePage === 'overview' && (
            <Overview 
              setActivePage={setActivePage} 
              setSelectedSheetName={setSelectedSheetName} 
            />
          )}
          {activePage === 'students' && <Students />}
          {activePage === 'events' && <Events />}
          {activePage === 'hours' && <HourRecords />}
          {activePage === 'all-records' && (
            <AllRecords initialSheetName={selectedSheetName} />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SheetProvider>
      <MainLayout />
    </SheetProvider>
  );
}

export default App;
