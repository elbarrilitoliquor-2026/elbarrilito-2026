/* ============================================================
   useWhatsAppTracking — fire-and-forget insert into whatsapp_clicks,
   mirrors trackWhatsAppClick() from js/site-data.js EXACTLY:
   it must never throw or block the caller's WhatsApp redirect.
   ============================================================ */

import { useCallback } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

/**
 * @param {{source: string, productName?: string|null, customerName?: string|null, customerPhone?: string|null, message?: string|null}} params
 */
export function trackWhatsAppClick({
  source,
  productName = null,
  customerName = null,
  customerPhone = null,
  message = null,
}) {
  try {
    supabaseClient
      .from('whatsapp_clicks')
      .insert({
        source,
        product_name: productName,
        customer_name: customerName,
        customer_phone: customerPhone,
        message,
        page_url: typeof window !== 'undefined' ? window.location.href : null,
      })
      .then(
        () => {},
        () => {}
      );
  } catch (e) {
    /* tracking must never block the user's WhatsApp redirect */
  }
}

/** Hook form for components that prefer the hook-call style. */
export function useWhatsAppTracking() {
  return useCallback(trackWhatsAppClick, []);
}
