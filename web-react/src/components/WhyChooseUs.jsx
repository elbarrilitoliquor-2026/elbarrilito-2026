import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/* Ports gsap-animations.js `wcuReveal()` — center image scale-in +
   card fade-up-with-delay stagger, scoped to this section only. */
export default function WhyChooseUs() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const img = sectionRef.current?.querySelector('.wcu-center img');
      if (img) {
        gsap.from(img, {
          scale: 0.94,
          opacity: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        });
      }
      const cards = sectionRef.current?.querySelectorAll('.wcu-card') || [];
      cards.forEach((card, i) => {
        gsap.from(card, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: { trigger: card, start: 'top 90%' },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section className="why-choose-us" id="why-choose-us" ref={sectionRef}>
      <div className="wcu-inner">
        <div className="wcu-header reveal-up">
          <p className="eyebrow-red">WHY CHOOSE US</p>
          <h2 className="section-heading-dark">Why El Barrilito Liquor Store</h2>
        </div>

        <div className="wcu-grid">
          <div className="wcu-col wcu-left reveal-fade">
            <div className="wcu-card">
              <div className="wcu-icon-wrap">
                <span className="wcu-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#A80000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4v4l2 4v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-4V2z" /><line x1="8" y1="15" x2="16" y2="15" /></svg>
                </span>
              </div>
              <h3 className="wcu-title">100% Authentic Vault</h3>
              <p className="wcu-desc">Handpicked VIP releases &amp; rare Mexican tequilas you won&apos;t find anywhere else in Texas!</p>
            </div>
            <div className="wcu-card">
              <div className="wcu-icon-wrap">
                <span className="wcu-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#A80000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A9 9 0 0 0 20 11V3h-8a9 9 0 0 0-9 9 9 9 0 0 0 8 8z" /><path d="M11 20v-9" /><path d="M12 3a9 9 0 0 0 9 9" /></svg>
                </span>
              </div>
              <h3 className="wcu-title">VIP Bilingual Service</h3>
              <p className="wcu-desc">Pasadena&apos;s #1 trusted neighborhood team offering custom party orders &amp; expert advice.</p>
            </div>
          </div>

          <div className="wcu-col wcu-center reveal-up">
            <img src="/assets/images/wine-spirit.png" alt="Premium Spirits at El Barrilito Liquor Store" className="wcu-main-img" loading="lazy" decoding="async" />
          </div>

          <div className="wcu-col wcu-right reveal-fade">
            <div className="wcu-card">
              <div className="wcu-icon-wrap">
                <span className="wcu-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#A80000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                </span>
              </div>
              <h3 className="wcu-title">Lowest Price Guarantee</h3>
              <p className="wcu-desc">Guaranteed lowest prices in Pasadena &amp; Greater Houston—unbeatable value on everyday classics.</p>
            </div>
            <div className="wcu-card">
              <div className="wcu-icon-wrap">
                <span className="wcu-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#A80000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8M12 15v7M12 15a7 7 0 0 0 7-7V3H5v5a7 7 0 0 0 7 7z" /><path d="M5 8h14" /></svg>
                </span>
              </div>
              <h3 className="wcu-title">Instant WhatsApp Orders</h3>
              <p className="wcu-desc">Order live from your phone via WhatsApp! Lightning-fast curbside pickup &amp; bottle availability checks.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
