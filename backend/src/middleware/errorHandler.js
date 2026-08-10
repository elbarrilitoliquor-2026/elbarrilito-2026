/* ============================================================
   errorHandler — centralized error-to-JSON-response middleware.
   Mounted LAST in src/app.js, after all routes.

   Ensures no stack trace or internal detail ever leaks to a client:
   every unhandled error becomes a clean { error: string } JSON body.
   Route handlers should use next(err) (or let async errors bubble via
   the asyncHandler wrapper) to reach this.
   ============================================================ */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err);

  const status = err.status || err.statusCode || 500;
  const message =
    status < 500 && err.message ? err.message : 'Internal server error.';

  res.status(status).json({ error: message });
}

/* Wraps an async route handler so rejected promises are forwarded to
   errorHandler instead of crashing the process / hanging the request. */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
