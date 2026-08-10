import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { formatDate, sourceLabel, truncate } from '../lib/format';

/* Ports loadLeads()/renderLeadsPager()/initLeadsFilter() from
   admin/admin.js. Note: admin.js's <select> lists a `contact_form`
   option (and label) even though schema.sql's check constraint on
   whatsapp_clicks.source only allows 4 values (product, cart_checkout,
   enquiry_form, floating_button, chatbot) plus 'contact_form' appears
   in the label maps but not the constraint list. Ported as-is. */

const LEADS_PAGE_SIZE = 25;

export default function LeadsView() {
  const [page, setPage] = useState(0);
  const [sourceFilter, setSourceFilter] = useState('');
  const [leads, setLeads] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeads() {
      let query = supabaseClient
        .from('whatsapp_clicks')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * LEADS_PAGE_SIZE, page * LEADS_PAGE_SIZE + LEADS_PAGE_SIZE - 1);

      if (sourceFilter) query = query.eq('source', sourceFilter);

      const { data, count, error } = await query;
      if (cancelled) return;

      if (error) {
        setError(error.message);
        setLeads(null);
        return;
      }
      setError(null);
      setLeads(data || []);
      setTotal(count || 0);
    }

    loadLeads();
    return () => { cancelled = true; };
  }, [page, sourceFilter]);

  function handleFilterChange(e) {
    setSourceFilter(e.target.value);
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE));

  return (
    <section id="view-leads" className="admin-view">
      <header className="view-header">
        <h1>WhatsApp Leads</h1>
        <p>Every visitor redirected to WhatsApp from the site</p>
        <select className="filter-select" value={sourceFilter} onChange={handleFilterChange}>
          <option value="">All Sources</option>
          <option value="product">Product Ask</option>
          <option value="cart_checkout">Cart Checkout</option>
          <option value="enquiry_form">Enquiry Form</option>
          <option value="contact_form">Contact Form</option>
          <option value="floating_button">Floating Button</option>
          <option value="chatbot">Chatbot</option>
        </select>
      </header>

      <div className="table-wrap">
        <table className="admin-table" id="leads-table">
          <thead>
            <tr><th>Date/Time</th><th>Source</th><th>Product / Order</th><th>Customer</th><th>Phone</th><th>Message</th></tr>
          </thead>
          <tbody>
            {error ? (
              <tr><td colSpan={6} className="empty-note">Error: {error}</td></tr>
            ) : leads === null ? null : leads.length === 0 ? (
              <tr><td colSpan={6} className="empty-note">No WhatsApp leads found.</td></tr>
            ) : (
              leads.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.created_at)}</td>
                  <td><span className={`pill pill-source-${r.source}`}>{sourceLabel(r.source)}</span></td>
                  <td>{r.product_name || '—'}</td>
                  <td>{r.customer_name || '—'}</td>
                  <td>{r.customer_phone || '—'}</td>
                  <td className="lead-message" title={r.message || ''}>{truncate(r.message, 60)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {leads && leads.length > 0 && (
        <div className="pager" id="leads-pager">
          <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>&larr; Prev</button>
          <span style={{ alignSelf: 'center', fontSize: '0.82rem', color: 'var(--text-light)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next &rarr;</button>
        </div>
      )}
    </section>
  );
}
