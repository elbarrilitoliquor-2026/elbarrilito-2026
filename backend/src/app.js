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

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser tools (curl, server-to-server, no Origin header).
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
    })
  );
  app.use(express.json());

  // Rate limit unauthenticated public mutation endpoints to curb abuse.
  const publicMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // 60 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'el-barrilito-backend', time: new Date().toISOString() });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/reviews', (req, res, next) => {
    if (req.method === 'POST') return publicMutationLimiter(req, res, next);
    return next();
  });
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/whatsapp-clicks', (req, res, next) => {
    if (req.method === 'POST') return publicMutationLimiter(req, res, next);
    return next();
  });
  app.use('/api/whatsapp-clicks', whatsappClicksRouter);
  app.use('/api/dashboard', dashboardRouter);

  // 404 for unknown /api routes.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp, DEFAULT_ALLOWED_ORIGINS };
