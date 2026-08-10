/* ============================================================
   useReviews — approved reviews, newest first, limit 12. Mirrors
   loadApprovedReviews() from js/site-data.js.
   ============================================================ */

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(12);

      if (err) throw err;
      setReviews(data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load reviews:', err);
      setError(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reviews, loading, error, reload };
}
