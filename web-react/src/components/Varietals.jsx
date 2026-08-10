import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/* Ports gsap-animations.js `parallax()` for the `.var-img` /
   `.varietals-left` pair. */
export default function Varietals() {
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
    <section className="varietals" id="varietals">
      <div className="varietals-inner">
        <div className="varietals-left reveal-fade" id="var-img-wrap" ref={wrapRef}>
          <img src="/assets/images/craft_beer.png" alt="Craft Beer and Premium Spirits at El Barrilito" className="var-img" loading="lazy" decoding="async" ref={imgRef} />
        </div>

        <div className="varietals-right reveal-up" id="var-steps">
          <p className="section-pre-title">What Makes Us Different</p>

          <div className="step-item" id="step-1">
            <div className="step-num-wrap">
              <div className="step-num burgundy">01</div>
            </div>
            <div className="step-body">
              <p className="step-eyebrow">Selección Premium</p>
              <h3 className="step-title">Curated with Care</h3>
              <p className="step-desc">Every bottle on our shelves is hand-selected for quality and authenticity. We partner with trusted distributors and import directly from Mexican distilleries to bring you the finest spirits at the best prices in Pasadena, TX.</p>
            </div>
          </div>

          <div className="step-item" id="step-2">
            <div className="step-num-wrap">
              <div className="step-num dark-green">02</div>
            </div>
            <div className="step-body">
              <p className="step-eyebrow">Servicio Bilingüe</p>
              <h3 className="step-title">Bilingual Service</h3>
              <p className="step-desc">Our friendly, bilingual team speaks both English and Spanish fluently. We&apos;re here to help you find the perfect bottle, recommend pairings, and make your shopping experience welcoming and effortless — ¡siempre con una sonrisa!</p>
            </div>
          </div>

          <div className="step-item" id="step-3">
            <div className="step-num-wrap">
              <div className="step-num dark-green-soft">03</div>
            </div>
            <div className="step-body">
              <p className="step-eyebrow">Parte de la Comunidad</p>
              <h3 className="step-title">Community-Rooted</h3>
              <p className="step-desc">El Barrilito isn&apos;t just a liquor store — it&apos;s a neighborhood gathering point. We&apos;re proud to serve the Pasadena, South Houston, and greater Harris County communities with integrity, warmth, and an unmatched product selection.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
