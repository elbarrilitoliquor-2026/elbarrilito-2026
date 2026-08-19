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
  msg_tpl_order: '*NEW ORDER — El Barrilito Liquor Store* 🥃\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Customer:* {CustomerName}\n📞 *Phone:* {CustomerPhone}\n📍 *Order Type:* {OrderType}\n📌 *Address/Note:* {Address}\n━━━━━━━━━━━━━━━━━━━━━━\n*ORDER ITEMS:*\n{OrderLines}\n━━━━━━━━━━━━━━━━━━━━━━\n*Subtotal:* ${Subtotal}\n*TX Tax (8.25%):* ${Tax}\n*TOTAL BILLING:* ${TotalBilling}\n━━━━━━━━━━━━━━━━━━━━━━\nHello! Please confirm my order availability and pickup/delivery time. Thank you!',
  msg_tpl_enquiry: 'Hello, I am interested in {ProductName}. Can you provide more details?',
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
            msg_tpl_order: data.msg_tpl_order || DEFAULT_STORE_SETTINGS.msg_tpl_order,
            msg_tpl_enquiry: data.msg_tpl_enquiry || DEFAULT_STORE_SETTINGS.msg_tpl_enquiry,
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
