/* ============================================================
   supabaseAdmin — server-side Supabase client using the SERVICE ROLE
   key. This key bypasses Row Level Security entirely, so it must
   NEVER be sent to a browser/frontend. It only ever lives here, in
   this backend's process environment.

   This client is used for:
   - All admin-only routes (products/all, writes, dashboard, leads).
   - Verifying admin JWTs via supabaseAdmin.auth.getUser(token).
   - Public routes too, since this backend does its own authorization
     in the route handlers rather than relying on RLS.
   ============================================================ */

const { createClient } = require('@supabase/supabase-js');

const rawUrl = process.env.SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// The .env.example placeholder values (e.g. "YOUR_SUPABASE_PROJECT_URL") are
// not valid HTTP(S) URLs, and supabase-js validates the URL eagerly at
// createClient() time — an invalid value would crash the whole process on
// boot. Fall back to a syntactically-valid placeholder so the server still
// starts cleanly; any actual Supabase call will then fail gracefully at
// request time and be reported as a normal JSON error, not a boot crash.
const isPlaceholderOrMissing =
  !rawUrl || !/^https?:\/\//i.test(rawUrl) || !rawKey;

if (isPlaceholderOrMissing) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabaseAdmin] SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are missing or ' +
      'still placeholders. Requests that touch Supabase will fail until backend/.env is filled in.'
  );
}

const SUPABASE_URL = isPlaceholderOrMissing ? 'https://placeholder.supabase.co' : rawUrl;
const SUPABASE_SERVICE_ROLE_KEY = isPlaceholderOrMissing ? 'placeholder-service-role-key' : rawKey;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin };
