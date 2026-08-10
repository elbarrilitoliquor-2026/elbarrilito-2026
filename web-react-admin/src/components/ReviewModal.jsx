import { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

/* Ports openReviewModal()/review-edit-form submit handler from
   admin/admin.js exactly. */

export default function ReviewModal({ review, onClose, onSaved }) {
  const [name, setName] = useState(review.customer_name);
  const [location, setLocation] = useState(review.location || '');
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.review_text);
  const [status, setStatus] = useState({ text: '', type: '' });

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      customer_name: name.trim(),
      location: location.trim() || null,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      review_text: text.trim(),
    };

    setStatus({ text: 'Saving…', type: '' });

    const { error } = await supabaseClient.from('reviews').update(payload).eq('id', review.id);

    if (error) {
      setStatus({ text: 'Error: ' + error.message, type: 'error' });
      return;
    }

    onSaved();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div id="review-modal" className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Edit Review</h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Customer Name</label>
          <input
            type="text"
            className="modal-input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="field-label">Location</label>
          <input
            type="text"
            className="modal-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <label className="field-label">Rating (1–5)</label>
          <input
            type="number"
            className="modal-input"
            min="1"
            max="5"
            required
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <label className="field-label">Review Text</label>
          <textarea
            className="modal-textarea"
            rows={5}
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="modal-actions">
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
          <p className={`form-status${status.type ? ' ' + status.type : ''}`} aria-live="polite">{status.text}</p>
        </form>
      </div>
    </div>
  );
}
