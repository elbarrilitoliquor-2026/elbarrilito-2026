import { useStoreSettings } from '../hooks/useStoreSettings';

export default function StoreInfo() {
  const { settings } = useStoreSettings();

  return (
    <section className="store-info" id="store-info">
      <div className="store-inner">
        <div className="store-left reveal-up" id="store-left">
          <p className="eyebrow-italic">Find Us —</p>
          <h2 className="section-heading">Visit <em>El Barrilito</em></h2>
          <p className="section-body">Step into El Barrilito Liquor Store and explore our world of premium spirits. Our knowledgeable, bilingual staff is ready to help you discover your next favorite bottle. Conveniently located on Shaver Street in Pasadena, TX — ¡te esperamos!</p>

          <div className="store-details">
            <p><span className="detail-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span> {settings.address}</p>
            <p><span className="detail-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></span> {settings.hours}</p>
            <p><span className="detail-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span> <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} style={{ color: 'inherit' }}>{settings.phone}</a></p>
            <p><span className="detail-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></span> <a href={`mailto:${settings.email}`} style={{ color: 'inherit' }}>{settings.email}</a></p>
          </div>

          <a href={settings.google_maps_url} target="_blank" rel="noopener" className="btn-dark" id="directions-btn">GET DIRECTIONS</a>
        </div>

        <div className="store-right reveal-fade" id="store-right">
          <img src="/assets/images/collection_bottles.png" alt="El Barrilito Liquor Store Display — Pasadena TX" className="store-img" loading="lazy" decoding="async" />
          <div className="store-overlay-card">
            <strong>Open Today</strong>
            <span>{settings.hours.split('·')[0] || '10:00 AM — 9:00 PM'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
