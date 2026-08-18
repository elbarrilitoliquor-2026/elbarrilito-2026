import React, { useState, useRef, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

/* â”€â”€â”€ Fallback data (used when DB is empty or unavailable) â”€â”€â”€ */
const FALLBACK_CARDS = [
  {
    id: 'f-tequila',
    card_style: 'burgundy',
    badge: 'NEW LAUNCH',
    badge_style: 'gold',
    title: '2026 Reserve Tequila & Mezcal',
    subtitle: 'Handcrafted small-batch agave spirits. 20% OFF introductory release!',
    cta_label: 'CLAIM OFFER â†’',
    image_url: '/assets/images/limited_edition.png',
  },
  {
    id: 'f-bourbon',
    card_style: 'amber',
    badge: 'LIMITED TIME',
    badge_style: 'orange',
    title: 'Single Barrel 10-Yr Bourbon',
    subtitle: 'Rich oak & caramel aroma. FREE DELIVERY on 2+ bottles in Pasadena.',
    cta_label: 'ORDER NOW â†’',
    image_url: '/assets/images/bourbon_product.png',
  },
  {
    id: 'f-wine',
    card_style: 'emerald',
    badge: 'STAFF PICK',
    badge_style: 'green',
    title: 'Chateau Bordeaux Grand Cru',
    subtitle: '98-point sommelier selection. BUY 3 GET 15% OFF + free gift box.',
    cta_label: 'EXPLORE WINES â†’',
    image_url: '/assets/images/wine_product.png',
  },
  {
    id: 'f-scotch',
    card_style: 'slate',
    badge: 'VIP EXCLUSIVE',
    badge_style: 'blue',
    title: 'Private Cask Single Malt',
    subtitle: 'Aged in sherry casks with honeyed peat notes. SPECIAL $15 DISCOUNT.',
    cta_label: 'VIEW WHISKEY â†’',
    image_url: '/assets/images/whiskey_product.png',
  },
  {
    id: 'f-beer',
    card_style: 'sunset',
    badge: 'NEW IN STOCK',
    badge_style: 'red',
    title: 'Local Texas & Craft Beers',
    subtitle: 'Freshly hopped IPAs, stouts & Belgian ales. MIX & MATCH 6-PACKS.',
    cta_label: 'SHOP BREWS â†’',
    image_url: '/assets/images/craft_beer.png',
  },
];

/* â”€â”€â”€ Map card_style â†’ CSS class â”€â”€â”€ */
const CARD_CLASS_MAP = {
  burgundy: 'ad-card-burgundy',
  amber:    'ad-card-amber',
  emerald:  'ad-card-emerald',
  slate:    'ad-card-slate',
  sunset:   'ad-card-sunset',
};

/* â”€â”€â”€ Map badge_style â†’ CSS class â”€â”€â”€ */
const BADGE_CLASS_MAP = {
  gold:   'ad-badge-gold',
  orange: 'ad-badge-orange',
  green:  'ad-badge-green',
  blue:   'ad-badge-blue',
  red:    'ad-badge-red',
};

function AdCard({ card }) {
  const cardCls  = CARD_CLASS_MAP[card.card_style]  || 'ad-card-burgundy';
  const badgeCls = BADGE_CLASS_MAP[card.badge_style] || 'ad-badge-gold';

  return (
    <a href="#shop" className={`ad-card ${cardCls}`} aria-label={card.title}>
      <div className="ad-card-content">
        {card.badge && (
          <span className={`ad-badge ${badgeCls}`}>{card.badge}</span>
        )}
        <h3 className="ad-card-title">{card.title}</h3>
        <p className="ad-card-desc">{card.subtitle}</p>
        {card.cta_label && (
          <span className="ad-cta">{card.cta_label}</span>
        )}
      </div>
      {card.image_url && (
        <div className="ad-card-img-wrap">
          <img src={card.image_url} alt={card.title} loading="lazy" decoding="async" />
        </div>
      )}
    </a>
  );
}

export default function AdBanner() {
  const [cards, setCards] = useState(FALLBACK_CARDS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);

  /* â”€â”€â”€ Fetch from Supabase â”€â”€â”€ */
  useEffect(() => {
    async function loadBanners() {
      try {
        const { data, error } = await supabaseClient
          .from('banners')
          .select('id, title, subtitle, badge, badge_style, cta_label, image_url, card_style, sort_order')
          .eq('section', 'ad')
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

  // Max reachable index calculation
  const getMaxIndex = () => {
    if (!trackRef.current || !trackRef.current.children[0]) return 0;
    const visibleWidth = trackRef.current.offsetWidth;
    const cardsPerView = Math.round(visibleWidth / trackRef.current.children[0].offsetWidth);
    return Math.max(0, cards.length - cardsPerView);
  };

  const handleScroll = () => {
    if (!trackRef.current) return;
    const scrollLeft = trackRef.current.scrollLeft;
    const childWidth = trackRef.current.children[0].offsetWidth + 16; 
    
    const newIndex = Math.round(scrollLeft / childWidth);
    const maxIndex = getMaxIndex();
    
    setActiveIndex(Math.min(newIndex, maxIndex));
  };

  const scrollTo = (index) => {
    if (!trackRef.current) return;
    const childWidth = trackRef.current.children[0].offsetWidth + 16;
    trackRef.current.scrollTo({
      left: index * childWidth,
      behavior: 'smooth'
    });
  };

  // Auto-scroll logic
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      const maxIndex = getMaxIndex();
      let nextIndex = activeIndex + 1;
      
      if (nextIndex > maxIndex) {
        nextIndex = 0; // Loop back to start
      }
      
      scrollTo(nextIndex);
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, cards.length]);

  return (
    <section 
      className="ad-banner-section" 
      id="ad-banner-section" 
      aria-label="Special Offers and New Releases"
    >
      <div className="ad-banner-header">
        <span className="ad-banner-tag">EXCLUSIVE SPECIALS &amp; NEW ARRIVALS</span>
        <h2 className="ad-banner-title">Today&apos;s Featured Offers</h2>
      </div>
      <div className="ad-banner-marquee-wrap">
        <div className="ad-banner-track" ref={trackRef} onScroll={handleScroll}>
          {cards.map((c) => <AdCard key={c.id} card={c} />)}
        </div>
      </div>
      
      {/* Flipkart-style animated indicators */}
      <div className="ad-carousel-indicators" aria-hidden="true">
        {cards.map((_, i) => {
          // Hide dots that represent unreachable scroll positions on desktop
          if (i > getMaxIndex()) return null;
          
          return (
            <button 
               key={i} 
               className={`ad-indicator-dot ${i === activeIndex ? 'active' : ''}`}
               onClick={() => scrollTo(i)}
               aria-label={`Go to offer ${i + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
}
