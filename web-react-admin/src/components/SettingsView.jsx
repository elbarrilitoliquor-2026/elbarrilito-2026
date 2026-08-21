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
  msg_tpl_order: '*NEW ORDER — El Barrilito Liquor Store* 🥃\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Customer:* {CustomerName}\n📞 *Phone:* {CustomerPhone}\n📍 *Order Type:* {OrderType}\n📌 *Address/Note:* {Address}\n━━━━━━━━━━━━━━━━━━━━━━\n*ORDER ITEMS:*\n{OrderLines}\n━━━━━━━━━━━━━━━━━━━━━━\n*Subtotal:* ${Subtotal}\n*TX Tax (8.25%):* ${Tax}\n*TOTAL BILLING:* ${TotalBilling}\n━━━━━━━━━━━━━━━━━━━━━━\nHello! Please confirm my order availability and pickup/delivery time. Thank you!',
  msg_tpl_enquiry: 'Hello, I am interested in {ProductName}. Can you provide more details?',
  msg_tpl_offline_bill: '*INVOICE — El Barrilito Liquor Store* 🥃\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Customer:* {CustomerName}\n📞 *Phone:* {CustomerPhone}\n━━━━━━━━━━━━━━━━━━━━━━\n*ITEMS:*\n{OrderLines}\n━━━━━━━━━━━━━━━━━━━━━━\n*TOTAL PAID:* ${TotalBilling}\n━━━━━━━━━━━━━━━━━━━━━━\nThank you for your purchase! We hope to see you again soon.',
  bulk_discount_qty: 12,
  bulk_discount_percent: 15.00,
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
            msg_tpl_order: data.msg_tpl_order || DEFAULT_SETTINGS.msg_tpl_order,
            msg_tpl_enquiry: data.msg_tpl_enquiry || DEFAULT_SETTINGS.msg_tpl_enquiry,
            msg_tpl_offline_bill: data.msg_tpl_offline_bill || DEFAULT_SETTINGS.msg_tpl_offline_bill,
            bulk_discount_qty: data.bulk_discount_qty ?? DEFAULT_SETTINGS.bulk_discount_qty,
            bulk_discount_percent: data.bulk_discount_percent ?? DEFAULT_SETTINGS.bulk_discount_percent,
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
        msg_tpl_order: form.msg_tpl_order.trim(),
        msg_tpl_enquiry: form.msg_tpl_enquiry.trim(),
        msg_tpl_offline_bill: form.msg_tpl_offline_bill.trim(),
        bulk_discount_qty: parseInt(form.bulk_discount_qty, 10) || 0,
        bulk_discount_percent: parseFloat(form.bulk_discount_percent) || 0,
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

        <form className="settings-card" onSubmit={handleSubmit}>
          <h2>Message Templates</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-light)', marginBottom: '14px' }}>
            Customize the pre-filled WhatsApp messages. You can use variables like {'{CustomerName}'}, {'{OrderLines}'}, {'{TotalBilling}'}, etc.
          </p>

          <div className="field-group">
            <label className="field-label">Cart Checkout Template (Online Order)</label>
            <textarea
              className="login-input"
              rows={12}
              value={form.msg_tpl_order}
              onChange={(e) => handleChange('msg_tpl_order', e.target.value)}
              required
            />
            <span className="field-help">Variables: {'{CustomerName}'}, {'{CustomerPhone}'}, {'{OrderType}'}, {'{Address}'}, {'{OrderLines}'}, {'{Subtotal}'}, {'{Tax}'}, {'{TotalBilling}'}</span>
          </div>

          <div className="field-group">
            <label className="field-label">Offline Bill Template (In-Store Print/Send)</label>
            <textarea
              className="login-input"
              rows={8}
              value={form.msg_tpl_offline_bill}
              onChange={(e) => handleChange('msg_tpl_offline_bill', e.target.value)}
              required
            />
            <span className="field-help">Variables: {'{CustomerName}'}, {'{CustomerPhone}'}, {'{OrderLines}'}, {'{TotalBilling}'}</span>
          </div>

          <div className="field-group">
            <label className="field-label">General Product Enquiry Template</label>
            <textarea
              className="login-input"
              rows={3}
              value={form.msg_tpl_enquiry}
              onChange={(e) => handleChange('msg_tpl_enquiry', e.target.value)}
              required
            />
            <span className="field-help">Variables: {'{ProductName}'}</span>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '14px', width: '100%' }} disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Templates'}
          </button>
        </form>

        <form className="settings-card" onSubmit={handleSubmit}>
          <h2>Bulk Discount Settings</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-light)', marginBottom: '14px' }}>
            Configure the bulk discount applied automatically when the cart quantity threshold is met.
          </p>

          <div className="field-group">
            <label className="field-label">Quantity Threshold</label>
            <input
              type="number"
              className="login-input"
              value={form.bulk_discount_qty}
              onChange={(e) => handleChange('bulk_discount_qty', e.target.value)}
              min="0"
              required
            />
            <span className="field-help">Minimum total items in cart to trigger the discount (e.g., 12).</span>
          </div>

          <div className="field-group">
            <label className="field-label">Discount Percentage (%)</label>
            <input
              type="number"
              className="login-input"
              value={form.bulk_discount_percent}
              onChange={(e) => handleChange('bulk_discount_percent', e.target.value)}
              min="0"
              max="100"
              step="0.01"
              required
            />
            <span className="field-help">Percentage off the subtotal (e.g., 15 or 20).</span>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '14px', width: '100%' }} disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Discount Settings'}
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
