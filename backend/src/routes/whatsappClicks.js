/* ============================================================
   /api/whatsapp-clicks

   POST /api/whatsapp-clicks   public — lead tracking insert. Mirrors
                                web-react/src/hooks/useWhatsAppTracking.js's
                                trackWhatsAppClick() payload shape exactly:
                                { source, product_name, customer_name,
                                  customer_phone, message, page_url }.

                                The "never blocks the caller" property
                                belongs to the FRONTEND's fire-and-forget
                                fetch call (it doesn't await/throw), not to
                                this endpoint — the API itself still
                                validates input and returns 400 on genuinely
                                malformed requests (e.g. missing/invalid
                                `source`) rather than silently swallowing
                                errors server-side.

   GET  /api/whatsapp-clicks   admin-only — paginated, optional source
                                filter, returns { data, total }. Mirrors
                                web-react-admin LeadsView.jsx loadLeads().
   ============================================================ */

const express = require('express');
const { z } = require('zod');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { requireAdmin } = require('../middleware/requireAdmin');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/* Known sources per schema.sql's comment + LeadsView.jsx's filter <select>.
   'contact_form' is tolerated even though it's not in every list, per the
   task's explicit instruction (admin UI references it). */
const VALID_SOURCES = [
  'product',
  'cart_checkout',
  'enquiry_form',
  'contact_form',
  'floating_button',
  'chatbot',
];

const DEFAULT_PAGE_SIZE = 25;

const clickCreateSchema = z.object({
  source: z.enum(VALID_SOURCES, {
    error: () => `source must be one of ${VALID_SOURCES.join(', ')}`,
  }),
  product_name: z
    .union([z.string().max(200, 'product_name too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  customer_name: z
    .union([z.string().max(100, 'customer_name too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  customer_phone: z
    .union([z.string().max(30, 'customer_phone too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  message: z
    .union([z.string().max(2000, 'message too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  page_url: z
    .union([z.string().max(2048, 'page_url too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
});

// POST /api/whatsapp-clicks — public
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = clickCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payload', issues: parsed.error.issues });
    }

    const { error } = await supabaseAdmin.from('whatsapp_clicks').insert(parsed.data);

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    res.status(201).json({ ok: true });
  })
);

// GET /api/whatsapp-clicks — admin, paginated
router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE));
    const source = typeof req.query.source === 'string' && req.query.source ? req.query.source : undefined;

    if (source && !VALID_SOURCES.includes(source)) {
      return res.status(400).json({ error: `source must be one of ${VALID_SOURCES.join(', ')}` });
    }

    let query = supabaseAdmin
      .from('whatsapp_clicks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (source) {
      query = query.eq('source', source);
    }

    const { data, count, error } = await query;
    if (error) throw Object.assign(new Error(error.message), { status: 502 });

    res.json({ data: data || [], total: count || 0 });
  })
);

module.exports = router;
