import { useEffect } from 'react';

export default function MobileMenu({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [onClose]);

  return (
    <>
      <div className={`mobile-menu-overlay${open ? ' open' : ''}`} id="mobile-menu-overlay" onClick={onClose} />
      <div className={`mobile-menu${open ? ' open' : ''}`} id="mobile-menu">

        <ul className="mobile-nav-list">
          <li><a href="#home" className="mob-link" id="m-home" onClick={onClose}>Home</a></li>
          <li><a href="#about" className="mob-link" id="m-about" onClick={onClose}>About Us</a></li>
          <li><a href="#tasting" className="mob-link" id="m-tasting" onClick={onClose}>Our Collection</a></li>
          <li><a href="#shop" className="mob-link" id="m-shop" onClick={onClose}>Shop Spirits</a></li>
          <li><a href="#promo-banner" className="mob-link" id="m-varietals" onClick={onClose}>Especiales / Specials</a></li>
          <li><a href="#varietals" className="mob-link" id="m-limited" onClick={onClose}>What Makes Us Different</a></li>
          <li><a href="#store-info" className="mob-link" id="m-store-info" onClick={onClose}>Location &amp; Hours</a></li>
          <li><a href="#contact" className="mob-link" id="m-contact" onClick={onClose}>Contact</a></li>
        </ul>
        <div className="mobile-menu-footer">
          <a href="#shop" className="btn-primary mob-cta" onClick={onClose}>Explore Collection</a>
          <p className="mob-addr">3370 Shaver St — Pasadena, TX 77504</p>
        </div>
      </div>
    </>
  );
}
