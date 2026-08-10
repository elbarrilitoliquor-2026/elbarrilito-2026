import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export const DEFAULT_STORE_SETTINGS = {
  address: '3370 Shaver St, Pasadena, TX 77504',
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=3370+Shaver+St+Pasadena+TX+77504',
  phone: '+1 (713) 360-6526',
  whatsapp_number: '18327367123',
  whatsapp_display: '+1 (832) 736-7123',
  email: 'info@elbarrilito.com',
  hours: 'Mon–Sat: 10 AM – 9 PM · Sunday: Closed',
};

export function useStoreSettings() {
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const { data, error } = await supabaseClient
          .from('store_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (cancelled) return;

        if (error && error.code !== 'PGRST116') {
          console.warn('[useStoreSettings] Supabase fetch error:', error.message);
        }

        if (data) {
          setSettings({
            address: data.address || DEFAULT_STORE_SETTINGS.address,
            google_maps_url: data.google_maps_url || DEFAULT_STORE_SETTINGS.google_maps_url,
            phone: data.phone || DEFAULT_STORE_SETTINGS.phone,
            whatsapp_number: data.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number,
            whatsapp_display: data.whatsapp_display || DEFAULT_STORE_SETTINGS.whatsapp_display,
            email: data.email || DEFAULT_STORE_SETTINGS.email,
            hours: data.hours || DEFAULT_STORE_SETTINGS.hours,
          });
        }
      } catch (err) {
        console.error('[useStoreSettings] Error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
