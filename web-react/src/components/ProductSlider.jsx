import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';

/* Ports script.js `initProductSlider()` math exactly:
   - getVisibleCount() breakpoints (<=480: 1.15, <=768: 1.6, <=1024: 3.2, else 4)
   - getStep() = floor(visibleCount), min 1
   - card width = (containerWidth - gap*(vis-1)) / vis
   - translateX(-current*(cardW+gap)) with the same cubic-bezier transition
   - touch swipe threshold of 35px */
export default function ProductSlider({ products, onOpenDetail }) {
  const wrapRef = useRef(null);
  const clipRef = useRef(null);
  const sliderRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [cardStyle, setCardStyle] = useState({});
  const [transform, setTransform] = useState('translateX(0px)');
  const touchState = useRef({ startX: 0, moveX: 0, isSwiping: false });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w <= 768) return 2; // Not really used for slider logic anymore, but kept for safety
    if (w <= 1024) return 3.2;
    return 4;
  }
  function getStep() {
    return Math.max(1, Math.floor(getVisibleCount()));
  }

  function update(targetCurrent) {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (mobile) {
      setCardStyle({});
      setTransform('none');
      return;
    }

    const vis = getVisibleCount();
    const step = getStep();
    const max = Math.max(0, products.length - step);
    const clamped = Math.min(Math.max(targetCurrent, 0), max);

    const w = window.innerWidth;
    const gap = 16;
    const containerW = clipRef.current ? clipRef.current.offsetWidth : window.innerWidth;
    const cardW = (containerW - gap * (vis - 1)) / vis;

    setCardStyle({
      flexShrink: 0,
      width: `${cardW}px`,
      marginRight: `${gap}px`,
      opacity: 1,
      visibility: 'visible',
    });

    const shift = clamped * (cardW + gap);
    setTransform(`translateX(-${shift}px)`);
    setCurrent(clamped);
    return clamped;
  }

  useEffect(() => {
    update(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  useEffect(() => {
    function onResize() {
      update(current);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, products.length]);

  function handlePrev() {
    if (!isMobile) update(current - getStep());
  }
  function handleNext() {
    if (!isMobile) update(current + getStep());
  }

  function handleTouchStart(e) {
    if (isMobile) return;
    touchState.current.startX = e.touches[0].clientX;
    touchState.current.isSwiping = true;
  }
  function handleTouchMove(e) {
    if (isMobile || !touchState.current.isSwiping) return;
    touchState.current.moveX = e.touches[0].clientX - touchState.current.startX;
  }
  function handleTouchEnd() {
    if (isMobile || !touchState.current.isSwiping) return;
    const { moveX } = touchState.current;
    if (moveX < -35) update(current + getStep());
    else if (moveX > 35) update(current - getStep());
    touchState.current.isSwiping = false;
    touchState.current.moveX = 0;
  }

  const displayProducts = isMobile ? products.slice(0, 4) : products;

  return (
    <div className={`products-slider-wrap ${isMobile ? 'mobile-grid' : ''}`} ref={wrapRef}>
      {!isMobile && (
        <button className="slider-btn prev-btn" id="prev-btn" aria-label="Previous" onClick={handlePrev}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      
      <div className="products-slider-clip" ref={clipRef}>
        <div
          className="products-slider"
          id="products-slider"
          ref={sliderRef}
          style={isMobile ? {} : { display: 'flex', overflow: 'visible', width: '100%', transform, transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} style={isMobile ? {} : cardStyle} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>

      {!isMobile && (
        <button className="slider-btn next-btn" id="next-btn" aria-label="Next" onClick={handleNext}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}
    </div>
  );
}
