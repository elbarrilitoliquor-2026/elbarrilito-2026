/* ============================================================
   /api/dashboard

   GET /api/dashboard   admin-only — single endpoint returning
                        everything DashboardView.jsx needs, computed
                        server-side via parallel Supabase queries.

   This is a genuine improvement over the current direct-Supabase
   frontend: DashboardView.jsx today fires 4 separate round trips
   (products count, waTotal count, waWeek count, reviews select) via
   Promise.all, THEN sequentially kicks off 3 more (waSourceChart,
   topProductsChart, recentLeads) after the first batch resolves — up
   to ~7 client-to-Supabase round trips total, each incurring its own
   network latency from the browser. Here it's collapsed into ONE
   client-to-backend round trip, with the backend fanning out to
   Supabase in parallel (which is typically much faster server-to-
   server) and doing all the aggregation (grouping, averaging,
   top-N sorting) itself instead of shipping raw rows to the browser
   to reduce.

   Response shape:
   {
     products,          // total product count
     waTotal,           // total whatsapp_clicks count
     waWeek,             // whatsapp_clicks count in the last 7 days
     reviewsPending,     // count of status='pending'
     reviewsApproved,    // count of status='approved'
     avgRating,          // average rating of approved reviews (1 decimal, or null)
     waSourceCounts,     // { [source]: count }
     topProductCounts,   // { [product_name]: count }, top 6, nulls excluded
     recentLeads,        // 8 most recent whatsapp_clicks rows
   }
   ============================================================ */

const express = require('express');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { requireAdmin } = require('../middleware/requireAdmin');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

function throwIfError(error) {
  if (error) throw Object.assign(new Error(error.message), { status: 502 });
}

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      productsCountRes,
      waTotalRes,
      waWeekRes,
      reviewsRes,
      waSourcesRes,
      waProductNamesRes,
      recentLeadsRes,
    ] = await Promise.all([
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('whatsapp_clicks').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('whatsapp_clicks')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoIso),
      supabaseAdmin.from('reviews').select('status, rating'),
      supabaseAdmin.from('whatsapp_clicks').select('source'),
      supabaseAdmin.from('whatsapp_clicks').select('product_name').not('product_name', 'is', null),
      supabaseAdmin.from('whatsapp_clicks').select('*').order('created_at', { ascending: false }).limit(8),
    ]);

    throwIfError(productsCountRes.error);
    throwIfError(waTotalRes.error);
    throwIfError(waWeekRes.error);
    throwIfError(reviewsRes.error);
    throwIfError(waSourcesRes.error);
    throwIfError(waProductNamesRes.error);
    throwIfError(recentLeadsRes.error);

    // Reviews: grouped by status + average rating of approved ones.
    const reviews = reviewsRes.data || [];
    const reviewsPending = reviews.filter((r) => r.status === 'pending').length;
    const approvedReviews = reviews.filter((r) => r.status === 'approved');
    const avgRating = approvedReviews.length
      ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1))
      : null;

    // whatsapp_clicks grouped by source.
    const waSourceCounts = {};
    (waSourcesRes.data || []).forEach((row) => {
      waSourceCounts[row.source] = (waSourceCounts[row.source] || 0) + 1;
    });

    // Top 6 product_names by click count (nulls already excluded via .not()).
    const productNameCounts = {};
    (waProductNamesRes.data || []).forEach((row) => {
      productNameCounts[row.product_name] = (productNameCounts[row.product_name] || 0) + 1;
    });
    const topProductCounts = Object.fromEntries(
      Object.entries(productNameCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    );

    res.json({
      products: productsCountRes.count ?? 0,
      waTotal: waTotalRes.count ?? 0,
      waWeek: waWeekRes.count ?? 0,
      reviewsPending,
      reviewsApproved: approvedReviews.length,
      avgRating,
      waSourceCounts,
      topProductCounts,
      recentLeads: recentLeadsRes.data || [],
    });
  })
);

module.exports = router;
