import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

const DEFAULT_SETTINGS = {
  address: '3370 Shaver St, Pasadena, TX 77504',
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=3370+Shaver+St+Pasadena+TX+77504',
  phone: '+1 (713) 360-6526',
  whatsapp_number: '18327367123',
  whatsapp_display: '+1 (832) 736-7123',
  email: 'info@elbarrilito.com',
  hours: 'Mon–Sat: 10 AM – 9 PM · Sunday: Closed',
};

export default function SettingsView() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabaseClient
          .from('store_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.warn('Store settings query warning:', error.message);
        }

        if (data) {
          setForm({
            address: data.address || DEFAULT_SETTINGS.address,
            google_maps_url: data.google_maps_url || DEFAULT_SETTINGS.google_maps_url,
            phone: data.phone || DEFAULT_SETTINGS.phone,
            whatsapp_number: data.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
            whatsapp_display: data.whatsapp_display || DEFAULT_SETTINGS.whatsapp_display,
            email: data.email || DEFAULT_SETTINGS.email,
            hours: data.hours || DEFAULT_SETTINGS.hours,
          });
        }
      } catch (err) {
        console.error('Error fetching store settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const payload = {
        id: 'default',
        address: form.address.trim(),
        google_maps_url: form.google_maps_url.trim(),
        phone: form.phone.trim(),
        whatsapp_number: form.whatsapp_number.trim(),
        whatsapp_display: form.whatsapp_display.trim(),
        email: form.email.trim(),
        hours: form.hours.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient.from('store_settings').upsert(payload);

      if (error) {
        throw error;
      }

      setStatusMsg({ type: 'success', text: 'Store contact & address settings saved successfully!' });
    } catch (err) {
      console.error('Error saving settings:', err);
      setStatusMsg({
        type: 'error',
        text: `Error saving settings: ${err.message || 'Make sure store_settings table exists in Supabase.'}`,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="admin-view">
        <header className="view-header">
          <h1>Store Settings</h1>
          <p>Loading current store details...</p>
        </header>
      </section>
    );
  }

  return (
    <section id="view-settings" className="admin-view">
      <header className="view-header">
        <h1>Store & Contact Settings</h1>
        <p>Edit store address, phone numbers, WhatsApp line, email, and operating hours</p>
      </header>

      {statusMsg.text && (
        <div className={`form-status ${statusMsg.type}`} style={{ marginBottom: '20px', fontSize: '0.95rem', fontWeight: 600 }}>
          {statusMsg.text}
        </div>
      )}

      <div className="settings-grid">
        <form className="settings-card" onSubmit={handleSubmit}>
          <h2>Manage Details</h2>

          <div className="field-group">
            <label className="field-label">Store Address</label>
            <input
              type="text"
              className="login-input"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
            <span className="field-help">Physical address shown on the website</span>
          </div>

          <div className="field-group">
            <label className="field-label">Google Maps Directions URL</label>
            <input
              type="url"
              className="login-input"
              value={form.google_maps_url}
              onChange={(e) => handleChange('google_maps_url', e.target.value)}
              required
            />
            <span className="field-help">Link opened when customer clicks "Get Directions"</span>
          </div>

          <div className="field-group">
            <label className="field-label">Main Store Phone</label>
            <input
              type="text"
              className="login-input"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
            <span className="field-help">e.g. +1 (713) 360-6526</span>
          </div>

          <div className="field-group">
            <label className="field-label">WhatsApp Phone Number (API format, numbers only)</label>
            <input
              type="text"
              className="login-input"
              value={form.whatsapp_number}
              onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              required
            />
            <span className="field-help">Used for wa.me links, e.g. 18327367123 (country code + area code + number)</span>
          </div>

          <div className="field-group">
            <label className="field-label">WhatsApp Display Text</label>
            <input
              type="text"
              className="login-input"
              value={form.whatsapp_display}
              onChange={(e) => handleChange('whatsapp_display', e.target.value)}
              required
            />
            <span className="field-help">e.g. +1 (832) 736-7123</span>
          </div>

          <div className="field-group">
            <label className="field-label">Store Email Address</label>
            <input
              type="email"
              className="login-input"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Operating Hours</label>
            <input
              type="text"
              className="login-input"
              value={form.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              required
            />
            <span className="field-help">e.g. Mon–Sat: 10 AM – 9 PM · Sunday: Closed</span>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '14px', width: '100%' }} disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>

        <div className="settings-card">
          <h2>Live Customer Preview</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-light)', marginBottom: '14px' }}>
            This is how your store contact information will appear on the customer website:
          </p>

          <div className="preview-box">
            <div className="preview-item">
              <span className="preview-icon">📍</span>
              <div>
                <strong>Address:</strong>
                <div>{form.address}</div>
              </div>
            </div>

            <div className="preview-item">
              <span className="preview-icon">🕒</span>
              <div>
                <strong>Hours:</strong>
                <div>{form.hours}</div>
              </div>
            </div>

            <div className="preview-item">
              <span className="preview-icon">📞</span>
              <div>
                <strong>Store Phone:</strong>
                <div>{form.phone}</div>
              </div>
            </div>

            <div className="preview-item">
              <span className="preview-icon">💬</span>
              <div>
                <strong>WhatsApp Order Line:</strong>
                <div>{form.whatsapp_display} ({form.whatsapp_number})</div>
              </div>
            </div>

            <div className="preview-item">
              <span className="preview-icon">✉️</span>
              <div>
                <strong>Email:</strong>
                <div>{form.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
