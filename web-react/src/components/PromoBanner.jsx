import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';
import { supabaseClient } from '../lib/supabaseClient';

/* ─── Fallback data (used when DB is empty or unavailable) ─── */
const FALLBACK_CARDS = [
  {
    id: 'f-tequila',
    card_style: 'tequila',
    title: 'TEQUILA',
    subtitle: 'Premium Agave Spirits',
    discount: 'Up to 20% Off',
    image_url: '/assets/images/promo_tequila.png',
  },
  {
    id: 'f-mezcal',
    card_style: 'mezcal',
    title: 'MEZCAL',
    subtitle: 'Artisanal & Smoky',
    discount: 'Special Deals',
    image_url: '/assets/images/promo_mezcal.png',
  },
  {
    id: 'f-whiskey',
    card_style: 'whiskey',
    title: 'WHISKEY',
    subtitle: 'Rare Bourbons & Scotch',
    discount: 'Members Only',
    image_url: '/assets/images/promo_whiskey.png',
  },
];

/* ─── Map card_style → CSS class suffix ─── */
const STYLE_MAP = {
  tequila: 'pr-bg-tequila',
  mezcal:  'pr-bg-mezcal',
  whiskey: 'pr-bg-whiskey',
};

function PromoBannerCard({ card }) {
  const bgClass = STYLE_MAP[card.card_style] || 'pr-bg-tequila';
  return (
    <div className="promo-retro-card">
      <div className={`pr-card-bg ${bgClass}`}></div>
      <div className="pr-card-content">
        <h3 className="pr-card-title">{card.title}</h3>
        {card.subtitle && <p className="pr-card-desc">{card.subtitle}</p>}
        {card.discount && <div className="pr-price-tag">{card.discount}</div>}
      </div>
      {card.image_url && (
        <img
          src={card.image_url}
          alt={card.title}
          className={`pr-bottle-img${card.card_style === 'mezcal' ? ' pr-bottle-mezcal' : card.card_style === 'whiskey' ? ' pr-bottle-whiskey' : ''}`}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default function PromoBanner() {
  const rootRef = useRef(null);
  const [cards, setCards] = useState(FALLBACK_CARDS);

  /* ─── Fetch from Supabase ─── */
  useEffect(() => {
    async function loadBanners() {
      try {
        const { data, error } = await supabaseClient
          .from('banners')
          .select('id, title, subtitle, discount, image_url, card_style, sort_order')
          .eq('section', 'promo')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) setCards(data);
      } catch {
        // silently fall back to hardcoded cards
      }
    }
    loadBanners();
  }, []);

  /* ─── GSAP animations ─── */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const domCards = gsap.utils.toArray('.promo-retro-card');

      gsap.fromTo(
        domCards,
        { y: 50, opacity: 0, rotationX: -15 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 75%',
          },
        }
      );
    },
    { scope: rootRef, dependencies: [cards] }
  );

  return (
    <section className="promo-banner" id="promo-banner" ref={rootRef}>
      <div className="promo-inner">
        <div className="promo-content">
          <p className="promo-spanish-top">¡Bienvenidos a El Barrilito!</p>
          <h2 className="section-heading-center">Exclusive <em>Offers</em></h2>
          <p className="promo-spanish-sub" style={{ marginBottom: '60px' }}>
            Tu Tienda de Licores Favorita en Pasadena, TX
          </p>

          <div className="promo-retro-grid">
            {cards.map((card) => (
              <PromoBannerCard key={card.id} card={card} />
            ))}
          </div>

          <a href="#shop" className="btn-dark" id="promo-cta" style={{ marginTop: '20px' }}>
            VER COLECCIÓN / VIEW COLLECTION
          </a>
        </div>
      </div>
    </section>
  );
}
