export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-leaves"></div>

      <div className="footer-top">
        <div className="footer-col addr-col" id="fc-addr">
          <h4>Address :</h4>
          <p>3370 Shaver St</p>
          <p>City : Pasadena ( Texas )</p>
          <p>Country : United States</p>
          <div className="payment-icons" id="payment-icons">
            <span className="pay-icon">VISA</span>
            <span className="pay-icon">MC</span>
            <span className="pay-icon">AMEX</span>
            <span className="pay-icon">Cash</span>
          </div>
        </div>

        <div className="footer-col brand-col" id="fc-brand">
          <div className="footer-logo">
            <img src="/assets/images/eb-logo.png" alt="EB Liquor Store Logo" className="footer-logo-img" />
            <div className="logo-text">
              <span className="footer-script">El Barrilito</span>
              <span className="footer-sub">LIQUOR STORE</span>
            </div>
          </div>
          <p className="footer-desc">Your trusted neighborhood liquor store in Pasadena, TX. We proudly serve the community with an unmatched selection of tequila, mezcal, whiskey, beer, wine &amp; premium spirits. ¡Bienvenidos siempre!</p>
          <div className="footer-social" id="footer-social">
            <a href="https://www.instagram.com/el_barrilito_liquor_store/" target="_blank" rel="noopener" id="fs-ig" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" id="fs-fb" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="tel:+17133606526" id="fs-phone" aria-label="Call Us">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </a>
          </div>
        </div>

        <div className="footer-col info-col" id="fc-info">
          <h4>Info :</h4>
          <p>Phone : +1 (713) 360-6526</p>
          <p>Email : info@elbarrilito.com</p>
          <p>Hours : Mon–Sat 10AM–9PM</p>
          <p>Sunday : Closed</p>
        </div>
      </div>

      <div className="footer-bottom" id="footer-bottom">
        <span>© 2024 El Barrilito Liquor Store. All rights reserved.</span>
        <span className="fb-dot">•</span>
        <a href="#" id="fb-privacy">Privacy Policy</a>
      </div>
    </footer>
  );
}
