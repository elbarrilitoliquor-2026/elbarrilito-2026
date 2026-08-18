import { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

export default function AllProductsModal({ isOpen, onClose, products, onOpenDetail }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', onKeydown);
    }
    return () => document.removeEventListener('keydown', onKeydown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="all-products-modal open" ref={overlayRef}>
      <div className="all-products-header">
        <h2 className="section-heading" style={{ margin: 0, fontSize: '2rem' }}>All <em>Spirits</em></h2>
        <button className="all-products-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="all-products-body">
        <div className="all-products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>
    </div>
  );
}
