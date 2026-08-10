import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenMobileMenu, mobileMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('#home');
  const { totalQty, openDrawer } = useCart();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-nav highlighting via IntersectionObserver, mirrors initActiveNav()
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveHash(`#${e.target.id}`);
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#home" className="nav-logo" id="nav-logo">
            <img src="/assets/images/eb-logo.png" alt="EB Liquor Store Logo" className="nav-logo-img" />
            <div className="logo-text">
              <span className="logo-script">El Barrilito</span>
              <span className="logo-sub">LIQUOR STORE</span>
            </div>
          </a>
        </div>

        <div className="nav-center">
          <ul className="nav-links" id="nav-links">
            <li><a href="#home" className={`nav-link${activeHash === '#home' ? ' active' : ''}`} id="nl-home">Home</a></li>
            <li><a href="#about" className={`nav-link${activeHash === '#about' ? ' active' : ''}`} id="nl-about">About</a></li>
            <li className="has-drop">
              <a href="#" className="nav-link" id="nl-pages">Explore</a>
              <ul className="dropdown" id="drop-pages">
                <li><a href="#tasting" id="dp-tasting">Our Collection</a></li>
                <li><a href="#varietals" id="dp-varietals">What Makes Us Different</a></li>
                <li><a href="#promo-banner" id="dp-limited">Especiales / Specials</a></li>
              </ul>
            </li>
            <li className="has-drop">
              <a href="#shop" className={`nav-link${activeHash === '#shop' ? ' active' : ''}`} id="nl-shop">Shop</a>
              <ul className="dropdown" id="drop-shop">
                <li><a href="#shop" id="ds-wines">All Spirits</a></li>
                <li><a href="#shop" id="ds-red">Tequila &amp; Mezcal</a></li>
                <li><a href="#shop" id="ds-white">Whiskey &amp; Bourbon</a></li>
                <li><a href="#shop" id="ds-rose">Beer &amp; Cerveza</a></li>
              </ul>
            </li>
            <li><a href="#contact" className={`nav-link${activeHash === '#contact' ? ' active' : ''}`} id="nl-contact">Contact</a></li>
          </ul>
        </div>

        <div className="nav-right">
          <a href="#store-info" className="nav-address" id="nav-address">
            <span className="addr-icon">
              <svg className="wine-compass-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFACD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="3" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="21" />
                <line x1="3" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="21" y2="12" />
                <polygon points="12,7 14.5,12 12,17 9.5,12" fill="#FFFACD" fillOpacity="0.3" />
              </svg>
            </span>
            <span>3370 Shaver St — Pasadena, TX</span>
          </a>
          <button className="cart-btn" id="cart-btn" aria-label="Cart" onClick={openDrawer}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M1 2h4l2.68 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H6" />
            </svg>
            <span className={`cart-count${totalQty > 0 ? ' visible' : ''}`} id="cart-count">{totalQty}</span>
          </button>
          <button className={`nav-hamburger${mobileMenuOpen ? ' open' : ''}`} id="nav-hamburger" aria-label="Menu" onClick={onOpenMobileMenu}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
