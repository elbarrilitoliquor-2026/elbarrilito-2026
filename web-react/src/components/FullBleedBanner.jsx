import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/* Ports gsap-animations.js `fullBleedDrift()` — the giant "El Barrilito"
   type drifts horizontally (xPercent -12 -> 12) scrubbed to scroll. */
export default function FullBleedBanner() {
  const rootRef = useRef(null);
  const spanRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const span = spanRef.current;
      if (!span) return;
      gsap.fromTo(
        span,
        { xPercent: -12 },
        { xPercent: 12, ease: 'none', scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    },
    { scope: rootRef }
  );

  return (
    <div className="full-bleed-text" id="vineyard-bleed" ref={rootRef}>
      <span ref={spanRef}>El Barrilito</span>
    </div>
  );
}
