import { useEffect, useState } from 'react';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl } from '../lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

/* Ports script.js `initHeroWhatsAppOnly()` — visible only in the first
   650px of scroll, fades/scales out beyond that. */
export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function update() {
      setVisible(window.scrollY < 650);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const waText = "Hi! I'm interested in your liquor selection at El Barrilito.";

  return (
    <a
      href={buildWaUrl(waText)}
      className="whatsapp-float"
      id="whatsapp-float"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'scale(1)' : 'scale(0.6)',
      }}
      onClick={() => trackWhatsAppClick({ source: 'floating_button' })}
    >
      <WhatsAppIcon width={28} height={28} fill="#fff" />
      <span className="wa-float-tooltip">Chat with us!</span>
    </a>
  );
}
