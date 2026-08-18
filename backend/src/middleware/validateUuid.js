/* ============================================================
   validateUuid — reusable param middleware.
   Validates that req.params.id is a well-formed UUID before it
   ever reaches Supabase. Without this, a crafted string like
   "' OR 1=1--" or a very long random string would reach the DB
   query and produce a confusing 500-level Supabase error instead
   of a clean 400 Bad Request.
   ============================================================ */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUuid(req, res, next) {
  const { id } = req.params;
  if (!id || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid resource ID format.' });
  }
  return next();
}

module.exports = { validateUuid };
