import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl } from '../lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

/* Ports script.js `initHeroWhatsAppOnly()` — visible only in the first
   650px of scroll, fades/scales out beyond that. */
export default function WhatsAppFloat() {
  const waText = "Hi! I'm interested in your liquor selection at El Barrilito.";

  return (
    <a
      href={buildWaUrl(waText)}
      className="whatsapp-float"
      id="whatsapp-float"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      onClick={() => trackWhatsAppClick({ source: 'floating_button' })}
    >
      <WhatsAppIcon width={28} height={28} fill="#fff" />
      <span className="wa-float-tooltip">Chat with us!</span>
    </a>
  );
}
