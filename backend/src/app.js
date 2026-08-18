/* ============================================================
   Express app — El Barrilito backend API.

   Sits between web-react / web-react-admin and Supabase. Centralizes
   validation and keeps the Supabase SERVICE ROLE key server-side only
   (never shipped to a browser). NOT currently wired up to either
   frontend — see README.md.
   ============================================================ */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const productsRouter = require('./routes/products');
const reviewsRouter = require('./routes/reviews');
const whatsappClicksRouter = require('./routes/whatsappClicks');
const dashboardRouter = require('./routes/dashboard');
const { errorHandler } = require('./middleware/errorHandler');

/* Default dev origins: the two Vite dev servers in this repo.
   web-react/vite.config.js        -> server.port 4173
   web-react-admin/vite.config.js  -> server.port 4176
   Override/extend via ALLOWED_ORIGINS in .env (comma-separated). */
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:4173', 'http://localhost:4176'];

function resolveAllowedOrigins() {
  const fromEnv = process.env.ALLOWED_ORIGINS;
  if (!fromEnv || !fromEnv.trim()) return DEFAULT_ALLOWED_ORIGINS;
  return fromEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function createApp() {
  const app = express();
  const allowedOrigins = resolveAllowedOrigins();

  // ── Security headers ──────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────
  // Only browser-originated requests with a matching Origin are allowed.
  // Server-to-server tools (curl, Postman without an Origin header) are
  // still permitted for local dev/testing; in production add a stricter
  // check if needed.
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
    })
  );

  // ── Body parsing with a tight size cap ───────────────────────
  // 64 KB is well above any legitimate JSON payload in this app.
  // Without a limit an attacker could send multi-MB bodies to exhaust memory.
  app.use(express.json({ limit: '64kb' }));

  // ── Global rate limiter ───────────────────────────────────────
  // Applied to every /api route before individual route handlers.
  // Limits: 200 requests per IP per 15-minute window.
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
    skip: (req) => req.path === '/api/health', // health check exempt
  });
  app.use(globalLimiter);

  // ── Stricter limiter for public mutation endpoints ────────────
  // Reviews and WhatsApp clicks are public POST — cap at 30/15 min per IP.
  const publicMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });

  // ── Stricter limiter for admin write endpoints ────────────────
  // Authenticated admin mutations: 60/15 min per IP.
  const adminMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });

  // ── Health check ──────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'el-barrilito-backend', time: new Date().toISOString() });
  });

  // ── Routes ────────────────────────────────────────────────────
  // Apply the admin mutation limiter to non-GET product/review/dashboard requests.
  app.use('/api/products', (req, res, next) => {
    if (req.method !== 'GET') return adminMutationLimiter(req, res, next);
    return next();
  });
  app.use('/api/products', productsRouter);

  app.use('/api/reviews', (req, res, next) => {
    if (req.method === 'POST') return publicMutationLimiter(req, res, next);
    if (req.method === 'PATCH' || req.method === 'DELETE') return adminMutationLimiter(req, res, next);
    return next();
  });
  app.use('/api/reviews', reviewsRouter);

  app.use('/api/whatsapp-clicks', (req, res, next) => {
    if (req.method === 'POST') return publicMutationLimiter(req, res, next);
    return next();
  });
  app.use('/api/whatsapp-clicks', whatsappClicksRouter);

  app.use('/api/dashboard', adminMutationLimiter);
  app.use('/api/dashboard', dashboardRouter);

  // 404 for unknown /api routes.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp, DEFAULT_ALLOWED_ORIGINS };
