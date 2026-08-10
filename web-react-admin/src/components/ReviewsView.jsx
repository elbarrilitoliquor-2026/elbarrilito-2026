import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { formatDate } from '../lib/format';
import ReviewModal from './ReviewModal';

/* Ports initReviewTabs()/loadReviews()/handleReviewAction()/
   initReviewModal() from admin/admin.js. */

const TABS = [
  { status: 'pending', label: 'Pending' },
  { status: 'approved', label: 'Approved' },
  { status: 'rejected', label: 'Rejected' },
];

export default function ReviewsView({ onDataChanged, initialStatus = 'pending' }) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const loadReviews = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setReviews(null);
      return;
    }
    setError(null);
    setReviews(data || []);
  }, [status]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function handleAction(action, id) {
    if (action === 'approve') {
      await supabaseClient.from('reviews').update({ status: 'approved' }).eq('id', id);
      loadReviews();
      onDataChanged?.();
    } else if (action === 'reject') {
      await supabaseClient.from('reviews').update({ status: 'rejected' }).eq('id', id);
      loadReviews();
      onDataChanged?.();
    } else if (action === 'unapprove') {
      await supabaseClient.from('reviews').update({ status: 'pending' }).eq('id', id);
      loadReviews();
      onDataChanged?.();
    } else if (action === 'edit') {
      const review = reviews.find((r) => r.id === id);
      setEditingReview(review);
    }
  }

  function handleSaved() {
    setEditingReview(null);
    loadReviews();
  }

  return (
    <section id="view-reviews" className="admin-view">
      <header className="view-header">
        <h1>Reviews</h1>
        <p>Approve, edit, or reject customer-submitted reviews</p>
        <div className="tab-group" id="review-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              className={`tab-btn${status === tab.status ? ' active' : ''}`}
              onClick={() => setStatus(tab.status)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="review-cards" id="review-cards">
        {error ? (
          <p className="empty-note">Error: {error}</p>
        ) : reviews === null ? null : reviews.length === 0 ? (
          <p className="empty-note">No {status} reviews.</p>
        ) : (
          reviews.map((r) => (
            <div className="review-card" key={r.id} data-id={r.id}>
              <div className="review-card-top">
                <div>
                  <div className="review-card-name">{r.customer_name}</div>
                  <div className="review-card-meta">{r.location || ''} · {formatDate(r.created_at)}</div>
                </div>
                <div className="review-card-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
              <p className="review-card-text">{r.review_text}</p>
              <div className="review-card-actions">
                {status !== 'approved' && (
                  <button className="btn-sm approve" onClick={() => handleAction('approve', r.id)}>Approve</button>
                )}
                {status !== 'rejected' && (
                  <button className="btn-sm reject" onClick={() => handleAction('reject', r.id)}>Reject</button>
                )}
                {status === 'approved' && (
                  <button className="btn-sm" onClick={() => handleAction('unapprove', r.id)}>Move to Pending</button>
                )}
                <button className="btn-sm" onClick={() => handleAction('edit', r.id)}>Edit</button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingReview && (
        <ReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
