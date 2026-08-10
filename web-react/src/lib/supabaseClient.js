/* ============================================================
   SUPABASE CLIENT (React)
   Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from import.meta.env
   (populated from .env — see .env.example).

   IMPORTANT: This must point to the SAME Supabase project as the
   vanilla-JS admin panel's config at ../js/supabase-config.js, since
   both read/write the same `products`, `reviews`, and `whatsapp_clicks`
   tables. Keep the two in sync whenever you rotate keys or projects.
   ============================================================ */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('YOUR_SUPABASE') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');

if (!isConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env and fill in your Supabase project keys ' +
      '(same project as /admin/js/supabase-config.js).'
  );
}

// Singleton client instance shared across the app. When not configured we
// still create a client against placeholder values so imports don't throw;
// calls will simply fail/reject and the data hooks degrade to an empty state.
export const supabaseClient = createClient(
  isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isConfigured ? SUPABASE_ANON_KEY : 'placeholder-anon-key'
);

export const isSupabaseConfigured = isConfigured;
