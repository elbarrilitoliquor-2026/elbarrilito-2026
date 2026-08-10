/* ============================================================
   requireAdmin — protects admin-only routes.

   The admin frontend (web-react-admin) authenticates directly against
   Supabase Auth (supabaseClient.auth.signInWithPassword) — that does
   NOT change or move into this backend. What this middleware does is
   verify that a request claiming to be from a logged-in admin really
   is: it reads the `Authorization: Bearer <token>` header the admin
   frontend already has (its Supabase session access_token) and asks
   Supabase to validate it with the service-role client.

   On success, req.user is set to the Supabase auth user and the
   request proceeds. On failure, responds 401 and stops.
   ============================================================ */

const { supabaseAdmin } = require('../lib/supabaseAdmin');

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header. Expected: Bearer <token>' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    req.user = data.user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unable to verify session token.' });
  }
}

module.exports = { requireAdmin };
