import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, wrapWords, prefersReducedMotion } from '../lib/gsap';

/* Ports gsap-animations.js `heroIntro()` — cinematic word-mask title
   reveal + staggered fade-up for the desc/cta/side-links, with a
   simplified mobile path. Bottles/shadows/pour art stay static (CSS-only,
   same as the original — script.js never animated the SVG pour paths). */
export default function Hero() {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const ctaRowRef = useRef(null);
  const sideLinksRef = useRef(null);
  const rootRef = useRef(null);

  useGSAP(
    () => {
      const title = titleRef.current;
      const others = [descRef.current, ctaRowRef.current, sideLinksRef.current].filter(Boolean);
      const reduce = prefersReducedMotion();
      const isMobile = window.innerWidth <= 768;

      if (reduce) {
        gsap.set(others, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
        if (title) gsap.set(title, { opacity: 1, clearProps: 'all' });
        return;
      }

      if (isMobile) {
        if (title) gsap.set(title, { opacity: 0, y: 18 });
        gsap.set(others, { opacity: 0, y: 16 });

        const mtl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
        if (title) mtl.to(title, { opacity: 1, y: 0, duration: 0.6 }, 0);
        mtl.to(others, { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 }, 0.25);
        return;
      }

      const inners = title ? wrapWords(title) : [];
      gsap.set(inners, { yPercent: 118 });
      gsap.set(others, { opacity: 0, y: 30 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
      tl.to(inners, { yPercent: 0, duration: 1.0, stagger: 0.08 }, 0.15);
      if (descRef.current) tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.45);
      if (ctaRowRef.current) tl.to(ctaRowRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.6);
      if (sideLinksRef.current) tl.to(sideLinksRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.7);
    },
    { scope: rootRef }
  );

  return (
    <section className="hero" id="home" ref={rootRef}>
      <div className="hero-container">
        <div className="hero-content" id="hero-content">
          <h1 className="hero-title" ref={titleRef}>
            Texas&apos; Premier<br />
            <em>Spirits Destination</em>
          </h1>

          <p className="hero-desc" ref={descRef}>
            Welcome to Pasadena&rsquo;s #1 trusted liquor authority! Explore 100% authentic Mexican Tequilas, artisanal Mezcals, rare Kentucky Bourbons, and ice-cold Cervezas. Enjoy guaranteed lowest prices, bilingual VIP service, and instant WhatsApp ordering for curbside pickup!
          </p>

          <div className="hero-cta-row" ref={ctaRowRef} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginTop: '24px' }}>
            <a href="#shop" className="btn-dark" id="hero-cta">EXPLORE COLLECTION</a>
          </div>

          <div className="hero-side-links" id="hero-side-links" ref={sideLinksRef}>
            <a href="#shop" id="hs-reds">Tequila &amp; Mezcal</a>
            <a href="#shop" id="hs-whites">Whiskey &amp; Bourbon</a>
            <a href="#shop" id="hs-rose">Beer &amp; Cerveza</a>
            <a href="#tasting" id="hs-tasting">Wine &amp; Vino</a>
          </div>
        </div>

        <div className="hero-stage" id="hero-stage">
          <div className="texas-outline-map" id="texas-outline-map"></div>

          <div className="bottle-shadow shadow-wine" id="shadow-wine"></div>
          <div className="bottle-shadow shadow-bourbon" id="shadow-bourbon"></div>



          <div className="bottle bottle-wine" id="bottle-wine">
            <img src="/assets/images/wine_bottle.png" alt="Premium Tequila Bottle — El Barrilito Liquor" fetchPriority="high" loading="eager" decoding="async" />
          </div>
          <div className="bottle bottle-bourbon" id="bottle-bourbon">
            <img src="/assets/images/bourbon_bottle.png" alt="Kentucky Bourbon — El Barrilito Liquor Store" fetchPriority="high" loading="eager" decoding="async" />
          </div>

          <div className="hero-table" id="hero-table">
            <div className="table-top-surface"></div>
            <div className="table-edge-bevel"></div>
            <div className="table-grain"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
