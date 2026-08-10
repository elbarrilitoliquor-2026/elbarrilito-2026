import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import CatalogueView from './CatalogueView';
import LeadsView from './LeadsView';
import ReviewsView from './ReviewsView';

/* State-based view switcher — mirrors the original's JS-toggled
   view visibility (admin/admin.js initSidebarNav()) rather than
   introducing URL routing, which the vanilla admin panel never had. */

export default function AdminApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  function refreshDashboard() {
    setDashboardRefreshKey((k) => k + 1);
  }

  return (
    <div id="admin-app" className="admin-app">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="admin-main">
        {activeView === 'dashboard' && <DashboardView refreshKey={dashboardRefreshKey} />}
        {activeView === 'catalogue' && <CatalogueView onDataChanged={refreshDashboard} />}
        {activeView === 'leads' && <LeadsView />}
        {activeView === 'reviews' && <ReviewsView onDataChanged={refreshDashboard} />}
      </main>
    </div>
  );
}
