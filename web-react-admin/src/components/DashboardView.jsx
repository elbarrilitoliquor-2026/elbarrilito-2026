import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { formatDate, sourceLabel, SOURCE_LABELS } from '../lib/format';
import BarChart from './BarChart';

/* Ports loadDashboard()/loadWaSourceChart()/loadTopProductsChart()/
   loadRecentLeads() from admin/admin.js. */

export default function DashboardView({ refreshKey, onNavigate }) {
  const [stats, setStats] = useState({
    products: '—',
    waTotal: '—',
    waWeek: '—',
    reviewsPending: '—',
    reviewsApproved: '—',
    avgRating: '—',
  });
  const [waSourceCounts, setWaSourceCounts] = useState(null);
  const [topProductCounts, setTopProductCounts] = useState(null);
  const [recentLeads, setRecentLeads] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const [productsRes, waTotalRes, waWeekRes, reviewsRes] = await Promise.all([
        supabaseClient.from('products').select('id', { count: 'exact', head: true }),
        supabaseClient.from('whatsapp_clicks').select('id', { count: 'exact', head: true }),
        supabaseClient.from('whatsapp_clicks').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabaseClient.from('reviews').select('status, rating'),
      ]);

      if (cancelled) return;

      const reviews = reviewsRes.data || [];
      const pending = reviews.filter((r) => r.status === 'pending').length;
      const approved = reviews.filter((r) => r.status === 'approved');
      const avgRating = approved.length
        ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1)
        : '—';

      setStats({
        products: productsRes.count ?? 0,
        waTotal: waTotalRes.count ?? 0,
        waWeek: waWeekRes.count ?? 0,
        reviewsPending: pending,
        reviewsApproved: approved.length,
        avgRating,
      });

      loadWaSourceChart();
      loadTopProductsChart();
      loadRecentLeads();
    }

    async function loadWaSourceChart() {
      const { data } = await supabaseClient.from('whatsapp_clicks').select('source');
      if (cancelled) return;
      if (!data || data.length === 0) {
        setWaSourceCounts({});
        return;
      }
      const counts = {};
      data.forEach((r) => { counts[r.source] = (counts[r.source] || 0) + 1; });
      setWaSourceCounts(counts);
    }

    async function loadTopProductsChart() {
      const { data } = await supabaseClient
        .from('whatsapp_clicks')
        .select('product_name')
        .not('product_name', 'is', null);

      if (cancelled) return;
      if (!data || data.length === 0) {
        setTopProductCounts({});
        return;
      }
      const counts = {};
      data.forEach((r) => {
        counts[r.product_name] = (counts[r.product_name] || 0) + 1;
      });
      const top = Object.fromEntries(
        Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
      );
      setTopProductCounts(top);
    }

    async function loadRecentLeads() {
      const { data } = await supabaseClient
        .from('whatsapp_clicks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (cancelled) return;
      setRecentLeads(data || []);
    }

    loadDashboard();

    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <section id="view-dashboard" className="admin-view">
      <header className="view-header">
        <h1>Dashboard</h1>
        <p>Overview of your store's activity</p>
      </header>

      <div className="stat-grid">
        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('catalogue')}
          title="Click to manage Catalogue"
        >
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{stats.products}</span>
          <span className="stat-card-hint">View Catalogue →</span>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('leads')}
          title="Click to view WhatsApp Leads"
        >
          <span className="stat-label">WhatsApp Clicks (All Time)</span>
          <span className="stat-value">{stats.waTotal}</span>
          <span className="stat-card-hint">View Leads →</span>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('leads')}
          title="Click to view WhatsApp Leads"
        >
          <span className="stat-label">WhatsApp Clicks (Last 7 Days)</span>
          <span className="stat-value">{stats.waWeek}</span>
          <span className="stat-card-hint">View Leads →</span>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('reviews', 'pending')}
          title="Click to manage Pending Reviews"
        >
          <span className="stat-label">Pending Reviews</span>
          <span className="stat-value">{stats.reviewsPending}</span>
          <span className="stat-card-hint">Manage Pending →</span>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('reviews', 'approved')}
          title="Click to view Approved Reviews"
        >
          <span className="stat-label">Approved Reviews</span>
          <span className="stat-value">{stats.reviewsApproved}</span>
          <span className="stat-card-hint">View Approved →</span>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('reviews', 'approved')}
          title="Click to view Reviews"
        >
          <span className="stat-label">Average Rating</span>
          <span className="stat-value">{stats.avgRating}</span>
          <span className="stat-card-hint">View Reviews →</span>
        </div>
      </div>

      <div className="dash-panels">
        <div className="dash-panel">
          <h2>WhatsApp Clicks by Source</h2>
          {waSourceCounts === null ? null : (
            <BarChart
              counts={waSourceCounts}
              labelMap={SOURCE_LABELS}
              emptyMessage="No WhatsApp clicks recorded yet."
            />
          )}
        </div>
        <div className="dash-panel">
          <h2>Most Asked-About Products</h2>
          {topProductCounts === null ? null : (
            <BarChart
              counts={topProductCounts}
              labelMap={{}}
              emptyMessage="No product enquiries yet."
            />
          )}
        </div>
      </div>

      <div className="dash-panel">
        <h2>Recent WhatsApp Activity</h2>
        <div className="table-wrap">
          <table className="admin-table" id="recent-leads-table">
            <thead>
              <tr><th>Time</th><th>Source</th><th>Product / Order</th><th>Customer</th><th>Phone</th></tr>
            </thead>
            <tbody>
              {recentLeads === null ? null : recentLeads.length === 0 ? (
                <tr><td colSpan={5} className="empty-note">No activity yet.</td></tr>
              ) : (
                recentLeads.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.created_at)}</td>
                    <td><span className={`pill pill-source-${r.source}`}>{sourceLabel(r.source)}</span></td>
                    <td>{r.product_name || '—'}</td>
                    <td>{r.customer_name || '—'}</td>
                    <td>{r.customer_phone || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
