import { useState } from 'react';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl, WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from '../lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

/* Fixes the dead #contact nav link: adds a real section with that id.
   Message form mirrors EnquirySection's WA-submit pattern exactly. */
export default function ContactSection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const n = name.trim();
    const p = phone.trim();
    const em = email.trim();
    const m = msg.trim();

    if (!n || !p || !m) {
      alert('Please fill in your Name, Phone Number, and Message.');
      return;
    }

    const waText = `*NEW CONTACT MESSAGE — El Barrilito Liquor Store* ✉️\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Name:* ${n}\n📞 *Phone:* ${p}${em ? `\n📧 *Email:* ${em}` : ''}\n📝 *Message:* ${m}\n━━━━━━━━━━━━━━━━━━━━━━\nHello! I sent this message from your Contact section. Please get back to me. Thank you!`;
    const waUrl = buildWaUrl(waText);
    window.open(waUrl, '_blank', 'noopener');

    trackWhatsAppClick({ source: 'contact_form', customerName: n, customerPhone: p, message: waText });

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setPhone('');
      setEmail('');
      setMsg('');
    }, 3500);
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <div className="section-header reveal-up">
          <p className="eyebrow-line"><span className="eyebrow-dash"></span> Get In Touch <span className="eyebrow-dash"></span></p>
          <h2 className="section-heading">Contact <em>El Barrilito</em></h2>
          <p className="section-body">Questions about a bottle, an order, or just want to say hi? Reach us any way that&rsquo;s easiest for you — we&rsquo;re always happy to help.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-details reveal-up">
            <div className="contact-detail-row">
              <span className="detail-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
              <div>
                <strong>Visit Us</strong>
                <p>3370 Shaver St, Pasadena, TX 77504</p>
              </div>
            </div>
            <div className="contact-detail-row">
              <span className="detail-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></span>
              <div>
                <strong>Hours</strong>
                <p>Mon–Sat: 10 AM – 9 PM · Sunday: Closed</p>
              </div>
            </div>
            <div className="contact-detail-row">
              <span className="detail-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span>
              <div>
                <strong>Call Us</strong>
                <p><a href="tel:+17133606526">+1 (713) 360-6526</a></p>
              </div>
            </div>
            <div className="contact-detail-row">
              <span className="detail-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#A80000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></span>
              <div>
                <strong>Email Us</strong>
                <p><a href="mailto:info@elbarrilito.com">info@elbarrilito.com</a></p>
              </div>
            </div>
            <div className="contact-detail-row">
              <span className="detail-icon"><WhatsAppIcon width={20} height={20} /></span>
              <div>
                <strong>WhatsApp</strong>
                <p><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener">{WHATSAPP_DISPLAY}</a></p>
              </div>
            </div>

            <a href="https://www.google.com/maps/search/?api=1&query=3370+Shaver+St+Pasadena+TX+77504" target="_blank" rel="noopener" className="btn-dark contact-directions-btn">GET DIRECTIONS</a>
          </div>

        </div>
      </div>
    </section>
  );
}
