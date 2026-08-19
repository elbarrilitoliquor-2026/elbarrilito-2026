import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { formatDate, sourceLabel, SOURCE_LABELS } from '../lib/format';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#A80000', '#D32F2F', '#FF6659', '#FF9E80', '#FFCCBC'];

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
    salesTotal: '—',
  });
  const [lowStockProducts, setLowStockProducts] = useState(null);
  const [waSourceCounts, setWaSourceCounts] = useState(null);
  const [topProductCounts, setTopProductCounts] = useState(null);
  const [recentLeads, setRecentLeads] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const [productsRes, waTotalRes, waWeekRes, reviewsRes, salesRes] = await Promise.all([
        supabaseClient.from('products').select('id', { count: 'exact', head: true }),
        supabaseClient.from('whatsapp_clicks').select('id', { count: 'exact', head: true }),
        supabaseClient.from('whatsapp_clicks').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabaseClient.from('reviews').select('status, rating'),
        supabaseClient.from('sales').select('total_amount'),
      ]);

      if (cancelled) return;

      const reviews = reviewsRes.data || [];
      const pending = reviews.filter((r) => r.status === 'pending').length;
      const approved = reviews.filter((r) => r.status === 'approved');
      const avgRating = approved.length
        ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1)
        : '—';

      const sales = salesRes.data || [];
      const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);

      setStats({
        products: productsRes.count ?? 0,
        waTotal: waTotalRes.count ?? 0,
        waWeek: waWeekRes.count ?? 0,
        reviewsPending: pending,
        reviewsApproved: approved.length,
        avgRating,
        salesTotal: totalRevenue.toFixed(2),
      });

      loadLowStock();
      loadWaSourceChart();
      loadTopProductsChart();
      loadRecentLeads();
    }

    async function loadLowStock() {
      const { data } = await supabaseClient.from('products').select('*');
      if (cancelled) return;
      if (data) {
        setLowStockProducts(data.filter(p => p.stock_quantity <= p.low_stock_threshold));
      }
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
          onClick={() => onNavigate?.('billing')}
          title="Click to view Offline Billing"
        >
          <span className="stat-label">Total Sales Revenue</span>
          <span className="stat-value">${stats.salesTotal}</span>
          <span className="stat-card-hint">View Billing →</span>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => onNavigate?.('catalogue')}
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

      <div className="dash-panels" style={{ marginBottom: '2rem' }}>
        <div className="dash-panel" style={{ borderLeft: '4px solid #a00000' }}>
          <h2 style={{ color: '#a00000' }}>Low Stock Alerts</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Current Stock</th><th>Threshold</th></tr>
              </thead>
              <tbody>
                {lowStockProducts === null ? null : lowStockProducts.length === 0 ? (
                  <tr><td colSpan={3} className="empty-note">All products are adequately stocked.</td></tr>
                ) : (
                  lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td style={{ color: '#a00000', fontWeight: 'bold' }}>{p.stock_quantity}</td>
                      <td>{p.low_stock_threshold}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dash-panels">
        <div className="dash-panel">
          <h2>WhatsApp Clicks by Source</h2>
          {waSourceCounts === null ? null : Object.keys(waSourceCounts).length === 0 ? (
             <p className="empty-note">No WhatsApp clicks recorded yet.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={Object.entries(waSourceCounts).map(([k, v]) => ({ name: SOURCE_LABELS[k] || k, value: v }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.entries(waSourceCounts).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="dash-panel">
          <h2>Most Asked-About Products</h2>
          {topProductCounts === null ? null : Object.keys(topProductCounts).length === 0 ? (
             <p className="empty-note">No product enquiries yet.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={Object.entries(topProductCounts).map(([k, v]) => ({ 
                    name: k.length > 15 ? k.substring(0, 15) + '...' : k, 
                    clicks: v 
                  }))}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#A80000" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#A80000', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
