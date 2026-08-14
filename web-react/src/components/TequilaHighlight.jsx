import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/* ───────────────────────────────────────────
   Vintage LED Marquee Board – "Welcome to the
   World of Tequila" – chase-light border,
   hanging-sign animation, liquor image showcase.
   ─────────────────────────────────────────── */

const TEQUILA_IMAGES = [
  { src: '/assets/images/tequila_collection_dark.png', alt: 'Premium Tequila Collection',   label: 'Our Collection' },
  { src: '/assets/images/tequila_golden_pour.png',        alt: 'Golden Tequila Pour',          label: 'The Pour' },
  { src: '/assets/images/cocktail_glasses_bar.png',       alt: 'Craft Tequila Cocktails',      label: 'Craft Cocktails' },
];

/* Generates the small LED bulbs around the marquee border */
function MarqueeBulbs({ count = 80 }) {
  const bulbs = [];
  for (let i = 0; i < count; i++) {
    bulbs.push(
      <span
        key={i}
        className={`marquee-bulb bulb-phase-${i % 3}`}
        style={{ '--bulb-i': i, '--bulb-total': count }}
      />
    );
  }
  return <div className="marquee-bulbs-ring">{bulbs}</div>;
}

export default function TequilaHighlight() {
  const rootRef = useRef(null);
  const boardRef = useRef(null);
  const [activeImg, setActiveImg] = useState(0);

  /* Auto-rotate images */
  useEffect(() => {
    const id = setInterval(() => setActiveImg((p) => (p + 1) % TEQUILA_IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  /* GSAP hanging sign entrance */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const board = boardRef.current;
      if (!board) return;

      gsap.fromTo(
        board,
        { rotateX: -90, y: -120, opacity: 0, transformOrigin: 'top center' },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'elastic.out(1, 0.55)',
          scrollTrigger: { trigger: rootRef.current, start: 'top 80%' },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section className="tequila-marquee-section" id="tequila-highlight" ref={rootRef}>
      {/* Hanging chains / ropes */}
      <div className="marquee-chains">
        <span className="chain chain-left" />
        <span className="chain chain-right" />
      </div>

      {/* The vintage sign board */}
      <div className="marquee-board" ref={boardRef}>
        <MarqueeBulbs count={90} />

        <div className="marquee-inner-border">
          <div className="marquee-content">
            {/* Eyebrow */}
            <p className="marquee-eyebrow">★ Our Signature Selection ★</p>

            {/* Main heading with neon glow */}
            <h2 className="marquee-heading">
              <span className="marquee-heading-line">Welcome to the</span>
              <span className="marquee-heading-line marquee-heading-accent">World of Tequila</span>
            </h2>

            {/* Quote */}
            <p className="marquee-quote">
              "Discover the soul of Mexico in every drop. From crisp blancos to rich, aged añejos—El Barrilito brings you the finest agave spirits."
            </p>

            {/* Image carousel */}
            <div className="marquee-img-showcase">
              {TEQUILA_IMAGES.map((img, i) => (
                <button
                  key={i}
                  className={`marquee-img-card ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  type="button"
                >
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  <span className="marquee-img-label">{img.label}</span>
                </button>
              ))}
            </div>

            {/* CTA */}
            <a href="#shop" className="marquee-cta">
              <span className="marquee-cta-text">EXPLORE TEQUILA</span>
              <span className="marquee-cta-arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
