import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

export default function PromoBanner() {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray('.promo-retro-card');
      
      gsap.fromTo(
        cards,
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
    { scope: rootRef }
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
            {/* Card 1 */}
            <div className="promo-retro-card">
              <div className="pr-card-bg pr-bg-tequila"></div>
              <div className="pr-card-content">
                <h3 className="pr-card-title">TEQUILA</h3>
                <p className="pr-card-desc">Premium Agave Spirits</p>
                <div className="pr-price-tag">Up to 20% Off</div>
              </div>
              <img 
                src="/assets/images/promo_tequila.png" 
                alt="Premium Tequila" 
                className="pr-bottle-img"
                loading="lazy" 
              />
            </div>

            {/* Card 2 */}
            <div className="promo-retro-card">
              <div className="pr-card-bg pr-bg-mezcal"></div>
              <div className="pr-card-content">
                <h3 className="pr-card-title">MEZCAL</h3>
                <p className="pr-card-desc">Artisanal &amp; Smoky</p>
                <div className="pr-price-tag">Special Deals</div>
              </div>
              <img 
                src="/assets/images/promo_mezcal.png" 
                alt="Artisanal Mezcal" 
                className="pr-bottle-img pr-bottle-mezcal"
                loading="lazy" 
              />
            </div>

            {/* Card 3 */}
            <div className="promo-retro-card">
              <div className="pr-card-bg pr-bg-whiskey"></div>
              <div className="pr-card-content">
                <h3 className="pr-card-title">WHISKEY</h3>
                <p className="pr-card-desc">Rare Bourbons &amp; Scotch</p>
                <div className="pr-price-tag">Members Only</div>
              </div>
              <img 
                src="/assets/images/promo_whiskey.png" 
                alt="Premium Whiskey" 
                className="pr-bottle-img pr-bottle-whiskey"
                loading="lazy" 
              />
            </div>
          </div>
          
          <a href="#shop" className="btn-dark" id="promo-cta" style={{ marginTop: '20px' }}>
            VER COLECCIÓN / VIEW COLLECTION
          </a>
        </div>
      </div>
    </section>
  );
}
