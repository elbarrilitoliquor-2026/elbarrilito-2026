import { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

/* Ports script.js `initReviewForm()` (called via js/site-data.js) —
   5-star input widget defaulting to 5, inserts a `pending` review row. */
export default function ReviewForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState({ text: '', kind: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const customer_name = name.trim();
    const review_text = text.trim();

    if (!customer_name || !review_text) {
      setStatus({ text: 'Please enter your name and a review before submitting.', kind: 'error' });
      return;
    }

    setSubmitting(true);
    const { error } = await supabaseClient.from('reviews').insert({
      customer_name,
      location: location.trim() || null,
      rating,
      review_text,
      status: 'pending',
    });
    setSubmitting(false);

    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setStatus({ text: 'Something went wrong submitting your review. Please try again.', kind: 'error' });
      return;
    }

    setName('');
    setLocation('');
    setText('');
    setRating(5);
    setStatus({ text: 'Thank you! Your review has been submitted and will appear here once approved by our team.', kind: 'success' });
  }

  return (
    <div className="review-form-wrap reveal-up" id="review-form-wrap">
      <h3 className="review-form-heading">Share Your <em>Experience</em></h3>
      <p className="review-form-sub">Tell other customers what you think — approved reviews appear here on the site.</p>
      <form id="review-form" className="review-form" noValidate onSubmit={handleSubmit}>
        <div className="review-form-row">
          <input type="text" id="review-name" className="review-input" placeholder="Your Name *" required value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" id="review-location" className="review-input" placeholder="City / Neighborhood (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="review-stars-input" id="review-stars-input" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`review-star-input${i <= rating ? ' active' : ''}`}
              role="radio"
              aria-checked={i <= rating}
              aria-pressed={i <= rating}
              tabIndex={0}
              onClick={() => setRating(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRating(i); } }}
            >★</span>
          ))}
        </div>
        <textarea id="review-text" className="review-textarea" rows={4} placeholder="Write your review *" required value={text} onChange={(e) => setText(e.target.value)}></textarea>
        <button type="submit" id="review-submit-btn" className="btn-dark review-submit-btn" disabled={submitting}>
          {submitting ? 'SUBMITTING…' : 'SUBMIT REVIEW'}
        </button>
        <p id="review-form-status" className={`review-form-status${status.kind ? ` ${status.kind}` : ''}`} aria-live="polite">{status.text}</p>
      </form>
    </div>
  );
}
