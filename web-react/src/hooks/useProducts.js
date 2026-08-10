/* ============================================================
   useProducts — active products ordered by sort_order, mirrors
   loadProducts() from js/site-data.js.
   ============================================================ */

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (err) throw err;
      setProducts(data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load products:', err);
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { products, loading, error, reload };
}
