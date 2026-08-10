import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

const ITEMS = [
  { id: 'wl-1', img: '/assets/images/wine_product.png', alt: 'Tequila', label: 'Tequila' },
  { id: 'wl-2', img: '/assets/images/whiskey_product.png', alt: 'Whiskey', label: 'Whiskey' },
  { id: 'wl-3', img: '/assets/images/limited_edition.png', alt: 'Mezcal', label: 'Mezcal' },
  { id: 'wl-4', img: '/assets/images/bourbon_product.png', alt: 'Bourbon', label: 'Bourbon' },
  { id: 'wl-5', img: '/assets/images/craft_beer.png', alt: 'Cerveza / Beer', label: 'Cerveza' },
  { id: 'wl-6', img: '/assets/images/wine_product.png', alt: 'Wine / Vino', label: 'Vino' },
];

/* Ports gsap-animations.js `parallax()` for the
   `.vintage-main-img img` / `.vintage-main-img` pair. */
export default function Vintage() {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const img = imgRef.current;
      const wrap = wrapRef.current;
      if (!img || !wrap) return;
      gsap.set(img, { scale: 1.16 });
      gsap.fromTo(
        img,
        { yPercent: -8 },
        { yPercent: 8, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    },
    { scope: wrapRef }
  );

  return (
    <section className="vintage" id="vintage">
      <div className="vintage-inner">
        <div className="vintage-header reveal-up">
          <p className="eyebrow-center">Our Collection</p>
          <h2 className="section-heading-center">A Glimpse into <em>Our Spirits</em></h2>
        </div>

        <div className="vintage-grid">
          <div className="vintage-list-col reveal-up" id="vintage-list">
            <div className="wine-list-grid">
              {ITEMS.map((it) => (
                <div className="wine-list-item" id={it.id} key={it.id}>
                  <div className="wl-thumb"><img src={it.img} alt={it.alt} loading="lazy" decoding="async" /></div>
                  <span>{it.label}</span>
                </div>
              ))}
            </div>
            <a href="#shop" className="btn-outline" id="buy-now-btn">SHOP NOW</a>
          </div>

          <div className="vintage-stat-col reveal-fade" id="vintage-stats">
            <div className="big-stat-wrap">
              <div className="big-stat" id="bs-1">
                <span className="big-num">1000</span>
                <span className="big-label">Brands to explore at El Barrilito</span>
              </div>
            </div>
            <div className="vintage-main-img" ref={wrapRef}>
              <img src="/assets/images/collection_bottles.png" alt="Full Spirit Collection — El Barrilito Liquor" loading="lazy" decoding="async" ref={imgRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
