/* ============================================================
   /api/reviews

   Auth rule for GET (documented here since it's a judgment call the
   task asked us to make explicit):
     - `status=approved` is always PUBLIC. This is the one query the
       customer site needs (web-react/src/hooks/useReviews.js: approved,
       created_at desc, default limit 12) and it matches the existing
       Supabase RLS policy "public read approved reviews".
     - Any OTHER status (pending/rejected), or a request that omits
       `status` entirely (i.e. wants the full unfiltered list), requires
       admin auth — this matches web-react-admin ReviewsView.jsx, which
       always queries a specific status but is only ever reachable from
       the authenticated admin panel.
     - `limit` is respected as given (default 12, capped at 100) for the
       public approved path; admin queries are unlimited by default,
       mirroring ReviewsView.jsx's unbounded `.eq('status', status)`.

   GET   /api/reviews?status=approved&limit=12   public (see rule above)
   GET   /api/reviews?status=pending|rejected    admin
   POST  /api/reviews                            public — status is ALWAYS
                                                  forced to 'pending' server-side,
                                                  regardless of request body.
                                                  Mirrors ReviewForm.jsx.
   PATCH /api/reviews/:id                        admin — status transitions
                                                  (approve/reject/unapprove) and
                                                  full field edits. Mirrors
                                                  ReviewsView.jsx handleAction()
                                                  and ReviewModal.jsx handleSubmit().
   ============================================================ */

const express = require('express');
const { z } = require('zod');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { requireAdmin } = require('../middleware/requireAdmin');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const VALID_STATUSES = ['pending', 'approved', 'rejected'];
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const reviewCreateSchema = z.object({
  customer_name: z.string().trim().min(1, 'customer_name is required'),
  location: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  rating: z.coerce
    .number()
    .int('rating must be an integer')
    .min(1, 'rating must be between 1 and 5')
    .max(5, 'rating must be between 1 and 5'),
  review_text: z.string().trim().min(1, 'review_text is required'),
  // status is intentionally NOT accepted from the client — see below.
});

const reviewUpdateSchema = z
  .object({
    customer_name: z.string().trim().min(1).optional(),
    location: z.union([z.string().trim(), z.null()]).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    review_text: z.string().trim().min(1).optional(),
    status: z.enum(VALID_STATUSES).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided to update.',
  });

// GET /api/reviews?status=approved&limit=12
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const isPublicApproved = status === 'approved';

    if (!isPublicApproved) {
      // Any other status, or no status at all, requires admin auth.
      return requireAdmin(req, res, () => runQuery(req, res, next));
    }

    return runQuery(req, res, next);
  })
);

async function runQuery(req, res) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
  }

  let query = supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  // limit: default 12 for the public approved path; if the caller (admin)
  // didn't ask for approved specifically, leave results unbounded unless
  // they explicitly pass a limit.
  let limit;
  if (req.query.limit !== undefined) {
    const parsedLimit = Number(req.query.limit);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ error: 'limit must be a positive number' });
    }
    limit = Math.min(parsedLimit, MAX_LIMIT);
  } else if (status === 'approved') {
    limit = DEFAULT_LIMIT;
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw Object.assign(new Error(error.message), { status: 502 });
  res.json({ data: data || [] });
}

// POST /api/reviews — public, status forced to 'pending'
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = reviewCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payload', issues: parsed.error.issues });
    }

    const insertPayload = {
      ...parsed.data,
      status: 'pending', // never trust a client-supplied status
    };

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    res.status(201).json({ data });
  })
);

// PATCH /api/reviews/:id — admin, status transitions + field edits
router.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const parsed = reviewUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payload', issues: parsed.error.issues });
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(parsed.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    if (!data) return res.status(404).json({ error: 'Review not found.' });
    res.json({ data });
  })
);

module.exports = router;
