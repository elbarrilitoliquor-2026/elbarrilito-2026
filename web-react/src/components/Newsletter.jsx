import { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

/* Ports script.js `initNewsletterForm()` — purely cosmetic client-side
   confirmation (no backend table for newsletter signups in the schema),
   same 3.5s "SUBSCRIBED" state swap. */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    try {
      await supabaseClient
        .from('newsletter_subscribers')
        .insert({ email });
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      // Fail silently for user experience, but it's logged
    }

    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3500);
  }

  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter-inner reveal-up">
        <p className="eyebrow-line"><span className="eyebrow-dash"></span> Stay in Touch <span className="eyebrow-dash"></span></p>
        <h2 className="section-heading">Join the <em>El Barrilito Family</em></h2>
        <p className="section-body">Be first to know about new arrivals, weekly specials, and exclusive deals. ¡No te lo pierdas!</p>
        <form className="newsletter-form" id="newsletter-form" onSubmit={handleSubmit}>
          <input type="email" id="email-input" placeholder="Your email address" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" id="nl-submit" style={subscribed ? { background: 'var(--green-mid)' } : undefined}>
            {subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
          </button>
        </form>
        <p className="nl-note">By subscribing, you confirm you are 21+ years of age.</p>
      </div>
    </section>
  );
}
