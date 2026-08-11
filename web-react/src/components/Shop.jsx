import { useState } from 'react';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import ProductSlider from './ProductSlider';
import ProductModal from './ProductModal';
import StatsBar from './StatsBar';
import { gsap, prefersReducedMotion } from '../lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STATIC_FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Tequila Añejo',
    price: 45.99,
    old_price: 52.99,
    badge: 'Bestseller',
    size: '1 bottle (750 ml)',
    rating: 4.8,
    rating_count: 41900,
    image_url: '/assets/images/wine_product.png',
    description: 'Aged over a year in oak barrels for a smooth, rounded character with warm notes of vanilla, caramel and toasted oak. A refined sipping tequila best enjoyed neat or on the rocks.',
  },
  {
    id: 2,
    name: 'Mezcal Artesanal',
    price: 44.99,
    old_price: 52.99,
    badge: null,
    size: '1 bottle (750 ml)',
    rating: 4.7,
    rating_count: 15800,
    image_url: '/assets/images/bourbon_product.png',
    description: 'Handcrafted in small batches using traditional methods, this mezcal delivers a bold, smoky character with earthy agave depth. A favorite among those who love authentic, artisanal spirits.',
  },
  {
    id: 3,
    name: 'Kentucky Bourbon',
    price: 38.99,
    old_price: 45.00,
    badge: null,
    size: '1 bottle (750 ml)',
    rating: 4.9,
    rating_count: 32400,
    image_url: '/assets/images/whiskey_product.png',
    description: 'A single barrel Kentucky straight bourbon with rich caramel, oak and a gentle hint of spice on the finish. Smooth enough to sip neat, bold enough to anchor your favorite cocktail.',
  },
  {
    id: 4,
    name: 'Tequila Reposado',
    price: 32.99,
    old_price: 39.99,
    badge: null,
    size: '1 bottle (750 ml)',
    rating: 4.8,
    rating_count: 20500,
    image_url: '/assets/images/limited_edition.png',
    description: 'Rested in oak for a mellow, golden character that balances sweet agave with subtle wood notes. A versatile bottle equally at home in a margarita or sipped slowly.',
  },
  {
    id: 5,
    name: 'Craft Beer Pack',
    price: 18.99,
    old_price: 22.00,
    badge: null,
    size: '1 pack (6 x 355 ml)',
    rating: 4.6,
    rating_count: 12100,
    image_url: '/assets/images/craft_beer.png',
    description: 'A hand-picked six-pack of Mexican and craft beer favorites, served ice-cold and ready for any occasion — game day, a backyard cookout, or just unwinding after a long week.',
  },
];

/* Ports gsap-animations.js `productCards()` — clean minimal stagger
   reveal for `.product-card` elements as they scroll into view. */
export default function Shop({ products, loading }) {
  const [detailProduct, setDetailProduct] = useState(null);
  const shopRef = useRef(null);
  const displayProducts = products && products.length > 0 ? products : STATIC_FALLBACK_PRODUCTS;

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
    { scope: shopRef, dependencies: [displayProducts.length] }
  );

  return (
    <section className="shop" id="shop" ref={shopRef}>
      <div className="shop-inner">
        <div className="section-header reveal-up">
          <h2 className="section-heading">Our Spirit <em>Selection</em></h2>
        </div>

        <ProductSlider products={displayProducts} onOpenDetail={setDetailProduct} />

        <StatsBar />
      </div>

      <ProductModal product={detailProduct} onClose={() => setDetailProduct(null)} />
    </section>
  );
}
