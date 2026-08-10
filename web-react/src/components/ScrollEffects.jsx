import { useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, wrapWords, prefersReducedMotion } from '../lib/gsap';

/* Ports the app-wide (non section-scoped) pieces of gsap-animations.js:
   1. progressBar()   — pour-style scroll progress bar appended to <body>
   2. headingReveals() — film-title word wipe on every heading as it scrolls in
   3. revealBatches()  — generic .reveal-up / .reveal-fade batch reveals
   4. marqueeKinetic()  — scroll-velocity skew on marquee words

   Mounted once near the root (in App.jsx) after all sections have
   rendered, mirroring the original script's DOMContentLoaded boot()
   order (query the live DOM, since JSX renders plain elements with the
   same class names as the static site). */
export default function ScrollEffects() {
  useEffect(() => {
    document.documentElement.classList.add('gsap-ready');
  }, []);

  // Ports script.js `initSmoothScroll()` — every in-page `#hash` link
  // scrolls with a 90px offset to clear the sticky navbar, instead of
  // relying on plain CSS `scroll-behavior: smooth` (which has no offset).
  useEffect(() => {
    function scrollToTarget(target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    function onClick(e) {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);

      // Sections below the click target (e.g. lazy-loaded images inside
      // reveal-up/reveal-fade blocks such as StoreInfo's store photo) can
      // still be loading their real height when the scroll above commits,
      // so the browser lands short. Re-issue the scroll once those assets
      // finish loading and settle to the corrected offset.
      const lazyImages = Array.from(document.querySelectorAll('img[loading="lazy"]:not([data-loaded])'));
      lazyImages.forEach((img) => {
        if (img.complete) return;
        img.addEventListener(
          'load',
          () => {
            img.dataset.loaded = 'true';
            scrollToTarget(target);
          },
          { once: true }
        );
      });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useGSAP(() => {
    const reduce = prefersReducedMotion();

    /* 1. Scroll progress bar */
    let bar;
    if (!reduce) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);
      gsap.to(bar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: () => document.documentElement.scrollHeight - window.innerHeight,
          scrub: 0.3,
        },
      });
    }

    /* 2. Heading word-wipe reveals (desktop only, matches original) */
    if (!reduce && window.innerWidth > 768) {
      document
        .querySelectorAll('.section-heading, .section-heading-center, .about-heading, .amb-heading, .section-heading-dark')
        .forEach((h) => {
          const inners = wrapWords(h);
          gsap.set(inners, { yPercent: 118 });
          gsap.to(inners, {
            yPercent: 0,
            duration: 0.95,
            ease: 'power4.out',
            stagger: 0.07,
            scrollTrigger: { trigger: h, start: 'top 86%' },
          });
        });
    }

    /* 3. Generic reveal batches for .reveal-up / .reveal-fade (excluding
       .wcu-col, which WhyChooseUs animates itself via wcuReveal-equivalent).
       Skipped entirely when the page loads on a URL hash (e.g. a nav link
       to /#contact opened directly, or a refresh): the browser jumps to
       that anchor before ScrollTrigger has scanned the layout, so its
       target section — and everything the native jump skips past — would
       otherwise stay stuck at opacity:0 forever since no scroll event
       ever fires "into view" for them. */
    const loadedOnHash = !!window.location.hash;
    if (reduce || loadedOnHash) {
      gsap.set('.reveal-up, .reveal-fade', { opacity: 1, y: 0, clearProps: 'transform' });
    } else {
      const isMobile = window.innerWidth <= 768;
      const riseY = isMobile ? 24 : 46;

      const ups = Array.from(document.querySelectorAll('.reveal-up')).filter((el) => !el.classList.contains('wcu-col'));
      const fades = Array.from(document.querySelectorAll('.reveal-fade')).filter((el) => !el.classList.contains('wcu-col'));

      gsap.set(ups, { opacity: 0, y: riseY });
      gsap.set(fades, { opacity: 0 });
      gsap.set(document.querySelectorAll('.wcu-col'), { opacity: 1, y: 0, clearProps: 'transform' });

      ScrollTrigger.batch(ups, {
        start: 'top 90%',
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: isMobile ? 0.65 : 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true }),
      });
      ScrollTrigger.batch(fades, {
        start: 'top 92%',
        onEnter: (b) => gsap.to(b, { opacity: 1, duration: isMobile ? 0.8 : 1.1, ease: 'power2.out', stagger: 0.1, overwrite: true }),
      });
    }

    // If we loaded directly on a hash, the browser's native jump usually
    // fires before layout (images, GSAP word-wipe reveals) finishes
    // shifting content height, landing the viewport in the wrong spot.
    // Re-run it next frame, offset for the sticky navbar like in-page
    // hash clicks already are (see the click handler above).
    if (loadedOnHash) {
      const snapToHash = () => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          const offset = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: offset, behavior: 'auto' });
        }
      };
      requestAnimationFrame(snapToHash);
      // Lazy images below the fold (e.g. StoreInfo's store photo) can still
      // be loading when the frame above fires, so re-snap once they settle.
      window.addEventListener('load', snapToHash, { once: true });
    }

    /* 4. Kinetic marquee: scroll velocity skews the words */
    if (!reduce) {
      const spans = document.querySelectorAll('.marquee-track span');
      if (spans.length) {
        const setters = Array.from(spans).map((s) => gsap.quickTo(s, 'skewX', { duration: 0.5, ease: 'power3' }));
        ScrollTrigger.create({
          trigger: '.marquee-strip',
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-14, 14, self.getVelocity() / -140);
            setters.forEach((fn) => fn(v));
          },
        });
      }
    }

    ScrollTrigger.refresh();

    return () => {
      bar?.remove();
    };
  }, []);

  return null;
}
