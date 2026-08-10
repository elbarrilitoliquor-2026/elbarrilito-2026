import { useState } from 'react';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl } from '../lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

/* Ports script.js `initEnquiryForm()` exactly: same WA message template,
   required-field alert, and 3.5s "sent" confirmation on the button. */
export default function EnquirySection() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('Check Bottle Stock & Price');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const n = name.trim();
    const p = phone.trim();
    const m = msg.trim();

    if (!n || !p || !m) {
      alert('Please fill in your Name, Phone Number, and Enquiry Message.');
      return;
    }

    const waText = `*NEW ENQUIRY — El Barrilito Liquor Store* 💬\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Name:* ${n}\n📞 *Phone:* ${p}\n📌 *Enquiry Type:* ${type}\n📝 *Message:* ${m}\n━━━━━━━━━━━━━━━━━━━━━━\nHello! I submitted this enquiry on your website. Please reply at your earliest convenience!`;
    const waUrl = buildWaUrl(waText);
    window.open(waUrl, '_blank', 'noopener');

    trackWhatsAppClick({ source: 'enquiry_form', customerName: n, customerPhone: p, message: waText });

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setPhone('');
      setType('Check Bottle Stock & Price');
      setMsg('');
    }, 3500);
  }

  return (
    <section className="enquiry-section" id="enquiry-section">
      <div className="enquiry-card reveal-up">
        <div className="enquiry-header">
          <p className="eyebrow-line"><span className="eyebrow-dash"></span> Instant WhatsApp Service <span className="eyebrow-dash"></span></p>
          <h2 className="section-heading">Have a Special Enquiry or <em>Bulk Order?</em></h2>
          <p className="section-body">Need bottle recommendations, event catering, keg reservations, or checking real-time stock? Send our Pasadena team a direct enquiry on WhatsApp for immediate assistance.</p>
        </div>
        <form className="enquiry-form" id="enquiry-form" onSubmit={handleSubmit}>
          <div className="enquiry-form-grid">
            <input type="text" id="enq-name" className="enq-input" placeholder="Your Name *" required value={name} onChange={(e) => setName(e.target.value)} />
            <input type="tel" id="enq-phone" className="enq-input" placeholder="Phone / WhatsApp Number *" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="enquiry-form-row">
            <select id="enq-type" className="enq-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Check Bottle Stock & Price">Check Bottle Stock &amp; Price</option>
              <option value="Event & Bulk Liquor Order">Event &amp; Bulk Liquor Order</option>
              <option value="Special & Rare Spirits Import">Special &amp; Rare Spirits Import</option>
              <option value="General Question">General Question</option>
            </select>
          </div>
          <div className="enquiry-form-row">
            <textarea id="enq-msg" className="enq-textarea" placeholder="Tell us what bottle, brand, or service you need help with..." rows={3} required value={msg} onChange={(e) => setMsg(e.target.value)}></textarea>
          </div>
          <button type="submit" className="enq-submit-btn" id="enq-submit-btn" style={sent ? { background: '#1EBE5D' } : undefined}>
            {sent ? (
              '✓ SENT TO WHATSAPP'
            ) : (
              <>
                <WhatsAppIcon width={20} height={20} fill="#fff" />
                SEND ENQUIRY ON WHATSAPP
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
