import { useState } from 'react';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import ProductSlider from './ProductSlider';
import ProductModal from './ProductModal';
import StatsBar from './StatsBar';
import { gsap, prefersReducedMotion } from '../lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/* Ports gsap-animations.js `productCards()` — clean minimal stagger
   reveal for `.product-card` elements as they scroll into view. */
export default function Shop({ products, loading }) {
  const [detailProduct, setDetailProduct] = useState(null);
  const shopRef = useRef(null);

  useGSAP(
    () => {
      const cards = shopRef.current?.querySelectorAll('.product-card');
      if (!cards || !cards.length) return;
      const reduce = prefersReducedMotion();
      if (reduce) {
        gsap.set(cards, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
        return;
      }
      const isMobile = window.innerWidth <= 768;
      gsap.set(cards, { opacity: 0, y: isMobile ? 20 : 32 });
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: isMobile ? 0.6 : 0.85, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
    },
    { scope: shopRef, dependencies: [products.length] }
  );

  return (
    <section className="shop" id="shop" ref={shopRef}>
      <div className="shop-inner">
        <div className="section-header reveal-up">
          <h2 className="section-heading">Our Spirit <em>Selection</em></h2>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>Loading products…</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            No products to show yet. Configure Supabase and add products from the admin panel.
          </p>
        ) : (
          <ProductSlider products={products} onOpenDetail={setDetailProduct} />
        )}

        <StatsBar />
      </div>

      <ProductModal product={detailProduct} onClose={() => setDetailProduct(null)} />
    </section>
  );
}
