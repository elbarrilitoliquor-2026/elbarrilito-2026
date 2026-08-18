import React, { useState, useRef, useEffect } from 'react';

const CARDS = [
  {
    key: 'tequila',
    cls: 'ad-card-burgundy',
    label: 'Limited Edition Reserve Tequila Offer',
    badgeCls: 'ad-badge-gold',
    badge: 'NEW LAUNCH',
    title: '2026 Reserve Tequila & Mezcal',
    desc: <>Handcrafted small-batch agave spirits. <strong>20% OFF</strong> introductory release!</>,
    cta: 'CLAIM OFFER →',
    img: '/assets/images/limited_edition.png',
    alt: '2026 Limited Edition Tequila',
  },
  {
    key: 'bourbon',
    cls: 'ad-card-amber',
    label: 'Single Barrel Bourbon Offer',
    badgeCls: 'ad-badge-orange',
    badge: 'LIMITED TIME',
    title: 'Single Barrel 10-Yr Bourbon',
    desc: <>Rich oak &amp; caramel aroma. <strong>FREE DELIVERY</strong> on 2+ bottles in Pasadena.</>,
    cta: 'ORDER NOW →',
    img: '/assets/images/bourbon_product.png',
    alt: 'Single Barrel Bourbon Whiskey',
  },
  {
    key: 'wine',
    cls: 'ad-card-emerald',
    label: 'Bordeaux Grand Cru Wine Offer',
    badgeCls: 'ad-badge-green',
    badge: 'STAFF PICK',
    title: 'Chateau Bordeaux Grand Cru',
    desc: <>98-point sommelier selection. <strong>BUY 3 GET 15% OFF</strong> + free gift box.</>,
    cta: 'EXPLORE WINES →',
    img: '/assets/images/wine_product.png',
    alt: 'Chateau Bordeaux Wine',
  },
  {
    key: 'scotch',
    cls: 'ad-card-slate',
    label: 'Single Malt Scotch Offer',
    badgeCls: 'ad-badge-blue',
    badge: 'VIP EXCLUSIVE',
    title: 'Private Cask Single Malt',
    desc: <>Aged in sherry casks with honeyed peat notes. <strong>SPECIAL $15 DISCOUNT</strong>.</>,
    cta: 'VIEW WHISKEY →',
    img: '/assets/images/whiskey_product.png',
    alt: 'Single Malt Scotch Whiskey',
  },
  {
    key: 'beer',
    cls: 'ad-card-sunset',
    label: 'Craft Beer Collection Offer',
    badgeCls: 'ad-badge-red',
    badge: 'NEW IN STOCK',
    title: 'Local Texas & Craft Beers',
    desc: <>Freshly hopped IPAs, stouts &amp; Belgian ales. <strong>MIX &amp; MATCH 6-PACKS</strong>.</>,
    cta: 'SHOP BREWS →',
    img: '/assets/images/craft_beer.png',
    alt: 'Craft Beer Selection',
  },
];

function AdCard({ card }) {
  return (
    <a href="#shop" className={`ad-card ${card.cls}`} aria-label={card.label}>
      <div className="ad-card-content">
        <span className={`ad-badge ${card.badgeCls}`}>{card.badge}</span>
        <h3 className="ad-card-title">{card.title}</h3>
        <p className="ad-card-desc">{card.desc}</p>
        <span className="ad-cta">{card.cta}</span>
      </div>
      <div className="ad-card-img-wrap">
        <img src={card.img} alt={card.alt} loading="lazy" decoding="async" />
      </div>
    </a>
  );
}

export default function AdBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  
  // Max reachable index calculation
  const getMaxIndex = () => {
    if (!trackRef.current || !trackRef.current.children[0]) return 0;
    const visibleWidth = trackRef.current.offsetWidth;
    const cardsPerView = Math.round(visibleWidth / trackRef.current.children[0].offsetWidth);
    return Math.max(0, CARDS.length - cardsPerView);
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
  }, [activeIndex, isPaused]);

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
          {CARDS.map((c) => <AdCard key={c.key} card={c} />)}
        </div>
      </div>
      
      {/* Flipkart-style animated indicators */}
      <div className="ad-carousel-indicators" aria-hidden="true">
        {CARDS.map((_, i) => {
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


