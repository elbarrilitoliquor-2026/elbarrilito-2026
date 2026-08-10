/* ============================================================
   Entry point — loads env, starts the HTTP server.
   ============================================================ */

require('dotenv').config();

const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;

const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`El Barrilito backend API listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
