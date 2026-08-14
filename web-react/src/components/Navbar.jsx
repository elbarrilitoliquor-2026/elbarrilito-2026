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
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="nav-inner">
          {/* ── Tequila Bottle Outline SVG (visible only when scrolled) ── */}
          {scrolled && (
            <svg
              className="bottle-outline-svg"
              viewBox="0 0 1200 70"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="bottleBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#560712" />
                  <stop offset="12%" stopColor="#A80000" />
                  <stop offset="60%" stopColor="#8E0000" />
                  <stop offset="82%" stopColor="#6B0010" />
                  <stop offset="100%" stopColor="#3A030A" />
                </linearGradient>
                <linearGradient id="bottleNeckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4A0009" />
                  <stop offset="50%" stopColor="#6B0010" />
                  <stop offset="100%" stopColor="#3A030A" />
                </linearGradient>
                <linearGradient id="bottleCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F0D88A" />
                  <stop offset="30%" stopColor="#D4A84A" />
                  <stop offset="50%" stopColor="#C69940" />
                  <stop offset="70%" stopColor="#D4A84A" />
                  <stop offset="100%" stopColor="#F0D88A" />
                </linearGradient>
                <linearGradient id="neckRingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,250,205,0.6)" />
                  <stop offset="50%" stopColor="rgba(230,199,110,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,250,205,0.6)" />
                </linearGradient>
              </defs>

              {/* Bottle body — wide cylinder with rounded left, shoulder taper on right */}
              <path
                d="
                  M 28,2
                  L 1020,2
                  C 1040,2 1050,8 1055,14
                  L 1065,22
                  L 1130,22
                  L 1130,22
                  L 1130,48
                  L 1065,48
                  L 1055,56
                  C 1050,62 1040,68 1020,68
                  L 28,68
                  C 12,68 2,58 2,35
                  C 2,12 12,2 28,2
                  Z
                "
                fill="url(#bottleBodyGrad)"
                stroke="rgba(255,250,205,0.5)"
                strokeWidth="1.5"
              />

              {/* Bottle Cap — golden ridged rectangle at the end */}
              <rect
                x="1130" y="17" width="18" height="36" rx="4" ry="4"
                fill="url(#bottleCapGrad)"
                stroke="rgba(255,250,205,0.7)"
                strokeWidth="1.2"
              />

              {/* Cap ridges */}
              <line x1="1131" y1="23" x2="1147" y2="23" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
              <line x1="1131" y1="27" x2="1147" y2="27" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
              <line x1="1131" y1="31" x2="1147" y2="31" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
              <line x1="1131" y1="35" x2="1147" y2="35" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
              <line x1="1131" y1="39" x2="1147" y2="39" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
              <line x1="1131" y1="43" x2="1147" y2="43" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
              <line x1="1131" y1="47" x2="1147" y2="47" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />

              {/* Neck ring / foil band */}
              <rect
                x="1060" y="20" width="5" height="30" rx="2" ry="2"
                fill="url(#neckRingGrad)"
              />

              {/* Bottle label band (subtle center accent) */}
              <rect
                x="350" y="2" width="400" height="66" rx="0" ry="0"
                fill="none"
                stroke="rgba(255,250,205,0.1)"
                strokeWidth="0.8"
              />
            </svg>
          )}

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
    </>
  );
}

