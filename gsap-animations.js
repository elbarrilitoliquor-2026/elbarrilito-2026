/* ============================================================
   PRESTIGE SPIRITS — Cinematic GSAP ScrollTrigger Layer
   Retro film-title reveals, scrubbed parallax, kinetic type,
   dealt-card products, a pinned "spirit" act, and a pour-style
   scroll-progress bar. Degrades gracefully without GSAP and
   fully respects prefers-reduced-motion.
============================================================ */

(function () {
  'use strict';

  if (!window.gsap) return;                       // no lib → script.js fallbacks stay active
  var gsap = window.gsap;
  var ST = window.ScrollTrigger || null;
  if (ST) gsap.registerPlugin(ST);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  document.documentElement.classList.add('gsap-ready');

  /* ── Split an element's text into per-word masks, preserving <em>/<br> ── */
  function wrapWords(root) {
    var inners = [];
    function proc(node) {
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(node.childNodes, function (child) {
        if (child.nodeType === 3) {                                  // text
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (part === '') return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var mask = document.createElement('span'); mask.className = 'w-mask';
            var inn = document.createElement('span'); inn.className = 'w-in';
            inn.textContent = part;
            mask.appendChild(inn); frag.appendChild(mask); inners.push(inn);
          });
        } else if (child.nodeType === 1) {                           // element
          if (child.tagName === 'BR') { frag.appendChild(document.createElement('br')); }
          else { var clone = child.cloneNode(false); clone.appendChild(proc(child)); frag.appendChild(clone); }
        }
      });
      return frag;
    }
    var built = proc(root);
    root.innerHTML = '';
    root.appendChild(built);
    return inners;
  }

  /* ── 1. Pour-style scroll-progress bar ── */
  function progressBar() {
    if (reduce || !ST) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    gsap.to(bar, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: function () { return document.documentElement.scrollHeight - window.innerHeight; }, scrub: 0.3 }
    });
  }

  /* ── 2. Hero cinematic intro (on load): text + bottles land on the table ── */
  function heroIntro() {
    var title = qs('.hero-title');
    var isMobile = window.innerWidth <= 768;
    var others = ['.hero-desc', '.hero-cta-row', '.hero-side-links'];
    var bottles = ['#bottle-wine', '#bottle-bourbon'];
    var shadows = ['#shadow-wine', '#shadow-bourbon'];

    // Fail-safe: never permanently hide hero content
    if (reduce) {
      gsap.set(others.concat(bottles).concat(shadows), { opacity: 1, y: 0, yPercent: 0, clearProps: 'transform,opacity' });
      if (title) gsap.set(title, { opacity: 1, clearProps: 'all' });
      return;
    }
    // Keep bottles & shadows static (no entrance or scroll animation per requirement)
    gsap.set(bottles.concat(shadows), { opacity: 1, y: 0, scaleX: 1, rotate: 0, clearProps: 'transform,opacity' });

    if (isMobile) {
      if (title) gsap.set(title, { opacity: 0, y: 18 });
      gsap.set(others, { opacity: 0, y: 16 });

      var mtl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
      if (title) mtl.to(title, { opacity: 1, y: 0, duration: 0.6 }, 0);
      mtl.to(others, { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 }, 0.25);
      return;
    }

    var inners = title ? wrapWords(title) : [];

    gsap.set(inners, { yPercent: 118 });
    gsap.set(others, { opacity: 0, y: 30 });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
    tl.to(inners, { yPercent: 0, duration: 1.0, stagger: 0.08 }, 0.15)
      .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8 }, 0.45)
      .to('.hero-cta-row', { opacity: 1, y: 0, duration: 0.7 }, 0.6)
      .to('.hero-side-links', { opacity: 1, y: 0, duration: 0.7 }, 0.7);
  }

  /* ── 2b. Gentle scroll-linked "fall" — removed per user request ── */
  function bottleFall() {
    return;
  }

  /* ── 3. Film-title word wipe on every heading as it scrolls in ── */
  function headingReveals() {
    if (reduce || !ST || window.innerWidth <= 768) return;
    qsa('.section-heading, .section-heading-center, .about-heading, .amb-heading, .section-heading-dark')
      .forEach(function (h) {
        var inners = wrapWords(h);
        gsap.set(inners, { yPercent: 118 });
        gsap.to(inners, {
          yPercent: 0, duration: 0.95, ease: 'power4.out', stagger: 0.07,
          scrollTrigger: { trigger: h, start: 'top 86%' }
        });
      });
  }

  /* ── 4. Generic reveal batches for everything tagged in the markup ── */
  function revealBatches() {
    if (reduce || !ST) {
      gsap.set('.reveal-up, .reveal-fade', { opacity: 1, y: 0, clearProps: 'transform' });
      return;
    }
    var isMobile = window.innerWidth <= 768;
    var riseY = isMobile ? 24 : 46;              // shorter travel on small screens, still noticeable

    var ups = qsa('.reveal-up').filter(function (el) { return !el.classList.contains('wcu-col'); });
    var fades = qsa('.reveal-fade').filter(function (el) { return !el.classList.contains('wcu-col'); });

    gsap.set(ups, { opacity: 0, y: riseY });
    gsap.set(fades, { opacity: 0 });
    gsap.set(qsa('.wcu-col'), { opacity: 1, y: 0, clearProps: 'transform' });

    ST.batch(ups, {
      start: 'top 90%',
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: isMobile ? 0.65 : 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true }); }
    });
    ST.batch(fades, {
      start: 'top 92%',
      onEnter: function (b) { gsap.to(b, { opacity: 1, duration: isMobile ? 0.8 : 1.1, ease: 'power2.out', stagger: 0.1, overwrite: true }); }
    });
  }

  /* ── 5. Scrubbed hero + background parallax (depth) ── */
  function parallax() {
    if (reduce || !ST) return;

    // Framed images drift inside their clipped wrappers (Ken-Burns feel)
    [['.about-img', '.about-img-wrap'], ['.var-img', '.varietals-left'], ['.vintage-main-img img', '.vintage-main-img']]
      .forEach(function (pair) {
        var img = qs(pair[0]), wrap = qs(pair[1]);
        if (!img || !wrap) return;
        gsap.set(img, { scale: 1.16 });
        gsap.fromTo(img, { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
  }

  /* ── 6. Giant "VINE YARD" type drifts horizontally with scroll ── */
  function fullBleedDrift() {
    if (reduce || !ST) return;
    var span = qs('#vineyard-bleed span');
    if (!span) return;
    gsap.fromTo(span, { xPercent: -12 }, {
      xPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '#vineyard-bleed', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ── 7. Kinetic marquee: scroll velocity skews the words ── */
  function marqueeKinetic() {
    if (reduce || !ST) return;
    var spans = qsa('.marquee-track span');
    if (!spans.length) return;
    var setters = spans.map(function (s) { return gsap.quickTo(s, 'skewX', { duration: 0.5, ease: 'power3' }); });
    ST.create({
      trigger: '.marquee-strip', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-14, 14, self.getVelocity() / -140);
        setters.forEach(function (fn) { fn(v); });
      }
    });
  }

  /* ── 8. Product cards clean minimal stagger reveal ── */
  function productCards() {
    var cards = qsa('.product-card');
    if (!cards.length) return;
    if (reduce || !ST) {
      gsap.set(cards, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
      return;
    }
    var isMobile = window.innerWidth <= 768;
    gsap.set(cards, { opacity: 0, y: isMobile ? 20 : 32 });
    ST.batch(cards, {
      start: 'top 92%',
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: isMobile ? 0.6 : 0.85, ease: 'power3.out', stagger: 0.08, overwrite: true }); }
    });
  }

  /* ── 9. "Spirit Behind Our Wine" — minimal vertical fade-up stagger ── */
  function wcuReveal() {
    if (reduce || !ST) return;

    var img = qs('.wcu-center img');
    if (img) {
      gsap.from(img, {
        scale: 0.94, opacity: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: '.why-choose-us', start: 'top 75%' }
      });
    }

    qsa('.wcu-card').forEach(function (card, i) {
      gsap.from(card, {
        y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.1,
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });
  }

  /* ── boot ── */
  function boot() {
    progressBar();
    heroIntro();
    headingReveals();
    revealBatches();
    parallax();
    fullBleedDrift();
    marqueeKinetic();
    productCards();
    wcuReveal();
    if (ST) ST.refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Recompute after fonts settle (metrics shift the word masks)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (ST) ST.refresh(); });
  }
  window.addEventListener('load', function () { if (ST) ST.refresh(); });
})();
