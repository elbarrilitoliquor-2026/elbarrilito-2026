import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export default function SubscribersView() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      const { data, error } = await supabaseClient
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyAllEmails() {
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setCopyStatus('Failed to copy');
    });
  }

  return (
    <section id="view-subscribers" className="admin-view">
      <header className="view-header">
        <h1>Newsletter Subscribers</h1>
        <p>Emails collected from the footer subscription form.</p>
        <button 
          className="btn-primary" 
          onClick={copyAllEmails}
          disabled={subscribers.length === 0}
          style={{ marginTop: '1rem' }}
        >
          {copyStatus || 'Copy All Emails'}
        </button>
      </header>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <div className="table-wrapper" style={{ marginTop: '2rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: '500' }}>{sub.email}</td>
                  <td style={{ color: '#666', fontSize: '0.9em' }}>
                    {new Date(sub.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
