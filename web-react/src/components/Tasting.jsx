import { useRef } from 'react';

export default function Tasting() {
  const contentRef = useRef(null);
  const visualRef = useRef(null);

  return (
    <section className="tasting" id="tasting">
      <div className="tasting-inner">
        <div className="tasting-content reveal-up" id="tasting-content" ref={contentRef}>
          <p className="eyebrow-line"><span className="eyebrow-dash"></span> Curated Collection <span className="eyebrow-dash"></span></p>
          <h2 className="section-heading">Premium Spirits<br /><em>Selection</em></h2>
          <p className="section-body">From rare tequilas and artisanal mezcals to smooth bourbons and crisp craft beers — El Barrilito brings you a handpicked collection of the world&apos;s finest spirits. Our knowledgeable, bilingual staff is here to guide you to the perfect bottle for any occasion.</p>

          <ul className="tasting-list">
            <li id="tl-1">
              <span className="list-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8M12 15v7M12 15a7 7 0 0 0 7-7V3H5v5a7 7 0 0 0 7 7z" /><path d="M5 8h14" /></svg>
              </span> Hand-Selected Spirits
            </li>
            <li id="tl-2">
              <span className="list-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" /><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" /></svg>
              </span> Authentic Mexican Imports
            </li>
            <li id="tl-3">
              <span className="list-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></svg>
              </span> Unbeatable Prices
            </li>
          </ul>

          <a href="#store-info" className="btn-dark" id="tasting-cta">VISIT US TODAY</a>
        </div>

        <div className="tasting-visual reveal-fade" id="tasting-visual" ref={visualRef}>
          <div className="stat-card dark-card" id="stat-vineyard">
            <span className="stat-num">1000+</span>
            <span className="stat-label-sm">Brands Available</span>
          </div>
          <div className="stat-card light-card" id="stat-awards">
            <span className="stat-num">5★</span>
            <span className="stat-label-sm">Customer Rating</span>
          </div>
          <img src="/assets/images/collection_bottles.png" alt="Prestige Spirits Collection — El Barrilito" className="tasting-main-img" loading="lazy" decoding="async" />
          <div className="tasting-sub-grid">
            <img src="/assets/images/whiskey_product.png" alt="Premium Whiskey Selection" loading="lazy" decoding="async" />
            <img src="/assets/images/bourbon_product.png" alt="Bourbon & Tequila Collection" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  );
}
