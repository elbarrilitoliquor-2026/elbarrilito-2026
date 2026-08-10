import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/* Ports gsap-animations.js `parallax()` for the `.about-img` /
   `.about-img-wrap` pair — Ken-Burns style scrubbed drift. */
export default function About() {
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
    <section className="about" id="about">
      <div className="about-inner">
        <div className="about-text-panel reveal-up" id="about-text-panel">
          <div className="about-watermark-bg"></div>
          <p className="eyebrow-italic">About El Barrilito —</p>
          <h2 className="about-heading">Your Trusted<br />Liquor Store in<br />Pasadena, TX</h2>
          <p className="section-body">El Barrilito Liquor Store is more than just a place to buy spirits — it&apos;s a cornerstone of the Pasadena, Texas community. Located at 3370 Shaver St, we take pride in offering one of the largest and most diverse selections of tequila, mezcal, whiskey, beer, wine, and premium spirits in the greater Houston area.</p>
          <p className="section-body" style={{ marginTop: '16px' }}>Rooted in Mexican and Latin American heritage, El Barrilito celebrates the rich culture and traditions that make our community unique. Whether you&apos;re looking for an authentic añejo tequila for a special celebration, a crisp Mexican cerveza for a weekend cookout, or a smooth bourbon for sipping — our bilingual team is here to help you find exactly what you need.</p>
          <p className="section-body" style={{ marginTop: '16px' }}><strong>Horario / Hours:</strong> Mon–Sat: 10 AM – 9 PM · Sunday: Closed</p>
          <a href="#store-info" className="btn-dark" id="about-cta">VISIT US</a>
        </div>
        <div className="about-img-wrap reveal-fade" id="about-img-wrap" ref={wrapRef}>
          <img src="/assets/images/collection_bottles.png" alt="El Barrilito Liquor Store Premium Spirit Collection in Pasadena TX" className="about-img" loading="lazy" decoding="async" ref={imgRef} />
          <div className="organic-badge" id="organic-badge">
            <div className="badge-inner">
              <span className="badge-top">TRUSTED</span>
              <span className="badge-mid">LOCAL</span>
              <span className="badge-org">STORE</span>
              <span className="badge-pct">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
