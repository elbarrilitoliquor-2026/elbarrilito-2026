/* ============================================================
   /api/products

   GET    /api/products       public — active products only, sort_order asc.
                               Mirrors web-react/src/hooks/useProducts.js.
   GET    /api/products/all   admin  — ALL products (any active state), sort_order asc.
                               Mirrors web-react-admin CatalogueView.jsx loadProducts().
   POST   /api/products       admin  — create. Payload shape + defaults match
                               web-react-admin ProductModal.jsx handleSubmit().
   PATCH  /api/products/:id   admin  — partial update. Used both for full edits
                               (ProductModal) and the quick is_active toggle
                               (CatalogueView handleToggleActive).
   DELETE /api/products/:id   admin  — delete (ProductModal handleDelete).
   ============================================================ */

const express = require('express');
const { z } = require('zod');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { requireAdmin } = require('../middleware/requireAdmin');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateUuid } = require('../middleware/validateUuid');

const router = express.Router();

/* ------------------------------------------------------------
   Validation — mirrors ProductModal.jsx's handleSubmit() payload
   construction exactly: trims, coerces numbers, and applies the
   same defaults ('Spirits', '1 bottle (750 ml)', rating 4.8, etc).
   ------------------------------------------------------------ */
const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(200, 'name too long'),
  category: z
    .string()
    .trim()
    .max(100, 'category too long')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : 'Spirits')),
  size: z
    .string()
    .trim()
    .max(100, 'size too long')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : '1 bottle (750 ml)')),
  price: z.coerce.number({ required_error: 'price is required' }).finite().min(0).max(99999),
  old_price: z
    .union([z.coerce.number().finite().min(0).max(99999), z.null(), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === null || v === undefined ? null : v)),
  image_url: z
    .union([z.string().max(2048, 'image_url too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  badge: z
    .union([z.string().trim().max(60, 'badge too long'), z.null()])
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  sort_order: z.coerce.number().int().min(0).max(9999).optional().default(0),
  rating: z.coerce.number().min(0).max(5).optional().default(4.8),
  rating_count: z.coerce.number().int().min(0).optional().default(0),
  description: z
    .string()
    .trim()
    .max(2000, 'description too long')
    .optional()
    .transform((v) => v || ''),
  is_active: z.boolean().optional().default(true),
});

/* PATCH allows any subset of the same fields (partial update — used
   for both full edits and the is_active quick-toggle). */
const productUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    size: z.string().trim().min(1).max(100).optional(),
    price: z.coerce.number().finite().min(0).max(99999).optional(),
    old_price: z.union([z.coerce.number().finite().min(0).max(99999), z.null()]).optional(),
    image_url: z.union([z.string().trim().max(2048), z.null()]).optional(),
    badge: z.union([z.string().trim().max(60), z.null()]).optional(),
    sort_order: z.coerce.number().int().min(0).max(9999).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    rating_count: z.coerce.number().int().min(0).optional(),
    description: z.string().trim().max(2000).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided to update.',
  });

// GET /api/products — public, active only
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    res.json({ data: data || [] });
  })
);

// GET /api/products/all — admin, all products
router.get(
  '/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    res.json({ data: data || [] });
  })
);

// POST /api/products — admin, create
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payload', issues: parsed.error.issues });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(parsed.data)
      .select('*')
      .single();

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    res.status(201).json({ data });
  })
);

// PATCH /api/products/:id — admin, partial update
router.patch(
  '/:id',
  requireAdmin,
  validateUuid,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payload', issues: parsed.error.issues });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(parsed.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    if (!data) return res.status(404).json({ error: 'Product not found.' });
    res.json({ data });
  })
);

// DELETE /api/products/:id — admin
router.delete(
  '/:id',
  requireAdmin,
  validateUuid,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) throw Object.assign(new Error(error.message), { status: 502 });
    res.status(204).send();
  })
);

module.exports = router;
