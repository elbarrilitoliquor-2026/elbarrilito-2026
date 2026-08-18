import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import ImageUploader from './ImageUploader';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const PROMO_CARD_STYLES = [
  { value: 'tequila', label: 'Tequila (gold/amber)' },
  { value: 'mezcal',  label: 'Mezcal (green/earth)' },
  { value: 'whiskey', label: 'Whiskey (slate/dark)' },
];

const AD_CARD_STYLES = [
  { value: 'burgundy', label: 'Burgundy (deep red)' },
  { value: 'amber',    label: 'Amber (warm gold)' },
  { value: 'emerald',  label: 'Emerald (forest green)' },
  { value: 'slate',    label: 'Slate (cool grey)' },
  { value: 'sunset',   label: 'Sunset (orange-red)' },
];

const BADGE_STYLES = [
  { value: 'gold',   label: 'Gold' },
  { value: 'orange', label: 'Orange' },
  { value: 'green',  label: 'Green' },
  { value: 'blue',   label: 'Blue' },
  { value: 'red',    label: 'Red' },
];

const EMPTY_FORM = {
  section: 'promo',
  title: '',
  subtitle: '',
  badge: '',
  badge_style: 'gold',
  discount: '',
  cta_label: '',
  image_url: '',
  card_style: 'tequila',
  sort_order: 0,
  is_active: true,
};

/* ─────────────────────────────────────────────
   PROMO BANNER PREVIEW (mini)
───────────────────────────────────────────── */
function PromoBannerPreview({ form }) {
  return (
    <div className={`banner-preview-promo banner-promo-${form.card_style || 'tequila'}`}>
      <div className="bpp-content">
        <h3 className="bpp-title">{form.title || 'TITLE'}</h3>
        <p className="bpp-subtitle">{form.subtitle || 'Subtitle'}</p>
        {form.discount && <div className="bpp-tag">{form.discount}</div>}
      </div>
      {form.image_url && (
        <img src={form.image_url} alt={form.title} className="bpp-img" />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AD BANNER PREVIEW (mini)
───────────────────────────────────────────── */
function AdBannerPreview({ form }) {
  const badgeColors = {
    gold:   { bg: '#C9A227', color: '#fff' },
    orange: { bg: '#E76F1C', color: '#fff' },
    green:  { bg: '#1E8E3E', color: '#fff' },
    blue:   { bg: '#1565C0', color: '#fff' },
    red:    { bg: '#A80000', color: '#fff' },
  };
  const bc = badgeColors[form.badge_style] || badgeColors.gold;

  return (
    <div className={`banner-preview-ad banner-ad-${form.card_style || 'burgundy'}`}>
      <div className="bpa-content">
        {form.badge && (
          <span className="bpa-badge" style={{ background: bc.bg, color: bc.color }}>
            {form.badge}
          </span>
        )}
        <h3 className="bpa-title">{form.title || 'Card Title'}</h3>
        <p className="bpa-desc">{form.subtitle || 'Description text here...'}</p>
        {form.cta_label && <span className="bpa-cta">{form.cta_label}</span>}
      </div>
      {form.image_url && (
        <div className="bpa-img-wrap">
          <img src={form.image_url} alt={form.title} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BANNER MODAL
───────────────────────────────────────────── */
function BannerModal({ section, banner, onClose, onSaved }) {
  const isEdit = !!banner?.id;
  const [form, setForm] = useState(
    isEdit
      ? { ...banner }
      : { ...EMPTY_FORM, section, card_style: section === 'promo' ? 'tequila' : 'burgundy' }
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function field(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', text: '' });

    try {
      const payload = {
        section: form.section,
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || null,
        badge: form.badge?.trim() || null,
        badge_style: form.badge_style || null,
        discount: form.discount?.trim() || null,
        cta_label: form.cta_label?.trim() || null,
        image_url: form.image_url?.trim() || null,
        card_style: form.card_style || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error } = await supabaseClient
          .from('banners')
          .update(payload)
          .eq('id', banner.id);
        if (error) throw error;
        setStatus({ type: 'success', text: 'Banner updated successfully!' });
      } else {
        const { error } = await supabaseClient.from('banners').insert(payload);
        if (error) throw error;
        setStatus({ type: 'success', text: 'Banner created successfully!' });
      }

      setTimeout(() => {
        onSaved();
        onClose();
      }, 900);
    } catch (err) {
      setStatus({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const { error } = await supabaseClient.from('banners').delete().eq('id', banner.id);
      if (error) throw error;
      onSaved();
      onClose();
    } catch (err) {
      setStatus({ type: 'error', text: `Delete failed: ${err.message}` });
      setDeleting(false);
    }
  }

  const cardStyles = section === 'promo' ? PROMO_CARD_STYLES : AD_CARD_STYLES;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card banner-modal-card">
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <h2>{isEdit ? 'Edit Banner' : `Add ${section === 'promo' ? 'Promo' : 'Ad'} Banner`}</h2>

        <div className="banner-modal-body">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="banner-modal-form">
            <div className="field-group">
              <label className="field-label">Title *</label>
              <input
                className="login-input"
                value={form.title}
                onChange={(e) => field('title', e.target.value)}
                required
                placeholder="e.g. TEQUILA"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Subtitle / Description</label>
              <input
                className="login-input"
                value={form.subtitle || ''}
                onChange={(e) => field('subtitle', e.target.value)}
                placeholder="e.g. Premium Agave Spirits"
              />
            </div>

            {section === 'promo' && (
              <div className="field-group">
                <label className="field-label">Discount / Offer Tag</label>
                <input
                  className="login-input"
                  value={form.discount || ''}
                  onChange={(e) => field('discount', e.target.value)}
                  placeholder="e.g. Up to 20% Off"
                />
                <span className="field-help">Shown as the colored price tag on the card</span>
              </div>
            )}

            {section === 'ad' && (
              <>
                <div className="modal-row">
                  <div className="field-group">
                    <label className="field-label">Badge Text</label>
                    <input
                      className="login-input"
                      value={form.badge || ''}
                      onChange={(e) => field('badge', e.target.value)}
                      placeholder="e.g. NEW LAUNCH"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Badge Color</label>
                    <select
                      className="login-input"
                      style={{ width: '100%' }}
                      value={form.badge_style || 'gold'}
                      onChange={(e) => field('badge_style', e.target.value)}
                    >
                      {BADGE_STYLES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">CTA Button Label</label>
                  <input
                    className="login-input"
                    value={form.cta_label || ''}
                    onChange={(e) => field('cta_label', e.target.value)}
                    placeholder="e.g. CLAIM OFFER →"
                  />
                </div>
              </>
            )}

            <ImageUploader
              label="Banner Image"
              value={form.image_url || null}
              onChange={(url) => field('image_url', url || '')}
              bucket="product-images"
              folder="banners"
            />

            <div className="modal-row">
              <div className="field-group">
                <label className="field-label">Card Color Theme</label>
                <select
                  className="login-input"
                  style={{ width: '100%' }}
                  value={form.card_style || ''}
                  onChange={(e) => field('card_style', e.target.value)}
                >
                  {cardStyles.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Sort Order</label>
                <input
                  type="number"
                  className="login-input"
                  value={form.sort_order}
                  onChange={(e) => field('sort_order', e.target.value)}
                  min="0"
                />
                <span className="field-help">Lower = appears first</span>
              </div>
            </div>

            <label className="check-label">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => field('is_active', e.target.checked)}
              />
              Active (visible on client site)
            </label>

            {status.text && (
              <div className={`form-status ${status.type}`} style={{ marginTop: '12px' }}>
                {status.text}
              </div>
            )}

            <div className="modal-actions">
              {isEdit && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {confirmDelete
                    ? (deleting ? 'Deleting...' : '⚠ Confirm Delete')
                    : 'Delete'}
                </button>
              )}
              <button
                type="button"
                style={{ marginLeft: 'auto' }}
                className="btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Banner'}
              </button>
            </div>
          </form>

          {/* LIVE PREVIEW */}
          <div className="banner-modal-preview">
            <p className="banner-preview-label">Live Preview</p>
            {section === 'promo'
              ? <PromoBannerPreview form={form} />
              : <AdBannerPreview form={form} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BANNER ROW
───────────────────────────────────────────── */
function BannerRow({ banner, onEdit, onToggle, onMove, isFirst, isLast }) {
  return (
    <tr>
      <td>
        {banner.image_url
          ? <img src={banner.image_url} alt={banner.title} className="prod-thumb banner-thumb" />
          : <div className="banner-thumb-empty">No img</div>
        }
      </td>
      <td>
        <strong>{banner.title}</strong>
        {banner.subtitle && (
          <div style={{ fontSize: '0.76rem', color: 'var(--text-light)', marginTop: '2px' }}>
            {banner.subtitle}
          </div>
        )}
      </td>
      <td>{banner.badge || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
      <td>
        {banner.section === 'promo'
          ? (banner.discount || <span style={{ color: 'var(--text-light)' }}>—</span>)
          : (banner.cta_label || <span style={{ color: 'var(--text-light)' }}>—</span>)
        }
      </td>
      <td>
        <label className="toggle-switch">
          <input type="checkbox" checked={banner.is_active} onChange={() => onToggle(banner)} />
          <span className="toggle-slider" />
        </label>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className="btn-sm"
            title="Move Up"
            disabled={isFirst}
            onClick={() => onMove(banner, -1)}
          >↑</button>
          <button
            type="button"
            className="btn-sm"
            title="Move Down"
            disabled={isLast}
            onClick={() => onMove(banner, 1)}
          >↓</button>
        </div>
      </td>
      <td>
        <button type="button" className="btn-sm" onClick={() => onEdit(banner)}>Edit</button>
      </td>
    </tr>
  );
}

/* ─────────────────────────────────────────────
   MAIN BANNERS VIEW
───────────────────────────────────────────── */
export default function BannersView() {
  const [activeTab, setActiveTab] = useState('promo');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('banners')
        .select('*')
        .eq('section', activeTab)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      console.error('Error loading banners:', err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  function openAdd() { setEditingBanner(null); setModalOpen(true); }
  function openEdit(banner) { setEditingBanner(banner); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingBanner(null); }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }

  async function handleToggle(banner) {
    try {
      const { error } = await supabaseClient
        .from('banners')
        .update({ is_active: !banner.is_active, updated_at: new Date().toISOString() })
        .eq('id', banner.id);
      if (error) throw error;
      showToast(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  }

  async function handleMove(banner, direction) {
    const idx = banners.findIndex((b) => b.id === banner.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const swapBanner = banners[swapIdx];
    try {
      await Promise.all([
        supabaseClient.from('banners').update({ sort_order: swapBanner.sort_order }).eq('id', banner.id),
        supabaseClient.from('banners').update({ sort_order: banner.sort_order }).eq('id', swapBanner.id),
      ]);
      fetchBanners();
    } catch (err) {
      console.error('Move error:', err);
    }
  }

  const sectionLabel = activeTab === 'promo' ? 'Promo Banners' : 'Ad Banners';
  const sectionDesc = activeTab === 'promo'
    ? 'The 3-card "Exclusive Offers" grid shown on the client site'
    : 'The horizontally scrolling offer cards (marquee)';

  return (
    <section id="view-banners" className="admin-view">
      <header className="view-header">
        <h1>Banner Management</h1>
        <p>Add, edit, or remove promotional banner cards displayed on the client website</p>
      </header>

      {/* Tabs */}
      <div className="tab-group" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`tab-btn${activeTab === 'promo' ? ' active' : ''}`}
          onClick={() => setActiveTab('promo')}
          id="tab-promo-banners"
        >
          🎯 Promo Banners
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === 'ad' ? ' active' : ''}`}
          onClick={() => setActiveTab('ad')}
          id="tab-ad-banners"
        >
          📢 Ad Banners
        </button>
      </div>

      {/* Section info + Add button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '4px' }}>
            {sectionLabel}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{sectionDesc}</p>
        </div>
        <button type="button" className="btn-primary" id="add-banner-btn" onClick={openAdd}>
          + Add Banner
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="empty-note">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div
          className="dash-panel"
          style={{ textAlign: 'center', padding: '40px' }}
        >
          <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
            No {sectionLabel.toLowerCase()} yet.
          </p>
          <button type="button" className="btn-primary" onClick={openAdd}>
            Add Your First Banner
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title / Subtitle</th>
                <th>Badge</th>
                <th>{activeTab === 'promo' ? 'Discount Tag' : 'CTA Label'}</th>
                <th>Active</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner, idx) => (
                <BannerRow
                  key={banner.id}
                  banner={banner}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  onMove={handleMove}
                  isFirst={idx === 0}
                  isLast={idx === banners.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast notification */}
      {toastMsg && <div className="banner-toast">{toastMsg}</div>}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <BannerModal
          section={activeTab}
          banner={editingBanner}
          onClose={closeModal}
          onSaved={fetchBanners}
        />
      )}
    </section>
  );
}
