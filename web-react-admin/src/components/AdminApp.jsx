import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import CatalogueView from './CatalogueView';
import LeadsView from './LeadsView';
import ReviewsView from './ReviewsView';
import SettingsView from './SettingsView';
import BannersView from './BannersView';
import BillingView from './BillingView';

export default function AdminApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [reviewsTabStatus, setReviewsTabStatus] = useState('pending');
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  function refreshDashboard() {
    setDashboardRefreshKey((k) => k + 1);
  }

  function handleNavigate(view, extra) {
    if (view === 'reviews' && extra) {
      setReviewsTabStatus(extra);
    }
    setActiveView(view);
  }

  return (
    <div id="admin-app" className="admin-app">
      <Sidebar activeView={activeView} onNavigate={(view) => handleNavigate(view)} />
      <main className="admin-main">
        {activeView === 'dashboard' && (
          <DashboardView
            refreshKey={dashboardRefreshKey}
            onNavigate={handleNavigate}
          />
        )}
        {activeView === 'catalogue' && <CatalogueView onDataChanged={refreshDashboard} />}
        {activeView === 'leads' && <LeadsView />}
        {activeView === 'reviews' && (
          <ReviewsView
            onDataChanged={refreshDashboard}
            initialStatus={reviewsTabStatus}
          />
        )}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'banners' && <BannersView />}
        {activeView === 'billing' && <BillingView />}
      </main>
    </div>
  );
}
