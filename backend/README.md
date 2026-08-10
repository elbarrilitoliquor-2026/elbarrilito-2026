# El Barrilito — Backend API

A plain Node.js + Express REST API that sits between the two frontends
(`../web-react`, the customer site, and `../web-react-admin`, the admin
panel) and Supabase.

## Why this exists

Today, both `web-react` and `web-react-admin` talk **directly** to
Supabase from the browser using the anon public key. That works, but it
means:

- Every table's access rules live only in Postgres Row Level Security
  (RLS) policies — there's no place to add custom server-side logic,
  cross-cutting validation, or business rules without touching SQL.
- Any privileged operation is limited to whatever RLS + the anon key
  allow; there's no server-side secret that can do more.

This backend introduces a normal REST API layer in front of the same
three tables (`products`, `reviews`, `whatsapp_clicks`), using a
Supabase **service-role** key that lives only on the server. It
centralizes request validation (via `zod`), gives admin writes a single
place to be authorized (by verifying the admin's Supabase Auth JWT),
and gives a home for any future custom logic (e.g. email notifications
on new reviews, rate limiting, analytics, etc.) that doesn't belong in
the browser or in a SQL policy.

**Current status: NOT wired up.** `web-react` and `web-react-admin`
still call Supabase directly, exactly as before. This backend is a
ready-to-adopt API layer — switching the frontends over is a deliberate
follow-up step, not done here. See "How to switch a frontend over"
below.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev             # nodemon, auto-restarts on change
# or: npm start          # plain node, for production-style runs
```

### Environment variables (`.env`)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | yes | Your Supabase project URL, e.g. `https://xxxx.supabase.co`. Same project as the frontends. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Service role** secret key — Dashboard → Project Settings → API → `service_role`. **Not** the anon/public key. Bypasses RLS entirely. Never commit it, never send it to any frontend. |
| `PORT` | no (default `5000`) | Port this API listens on. |
| `ALLOWED_ORIGINS` | no | Comma-separated list of origins allowed via CORS. Defaults to `http://localhost:4173` (web-react's Vite dev port) and `http://localhost:4176` (web-react-admin's Vite dev port). |

Until `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are filled in with real
values, the server still starts fine and `/api/health` works; any route
that touches Supabase will return a clean `502 { "error": "..." }`
JSON response instead of crashing.

## Endpoints

All routes are mounted under `/api`. "Auth" column: **public** = no
token needed; **admin** = requires `Authorization: Bearer <supabase
access token>` from a logged-in admin session (see below).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | public | Liveness check. |
| GET | `/api/products` | public | Active products (`is_active=true`), `sort_order` asc. Mirrors the customer site's product list. |
| GET | `/api/products/all` | admin | All products regardless of `is_active`, `sort_order` asc. Powers the admin catalogue table. |
| POST | `/api/products` | admin | Create a product. Body is validated/coerced with the same defaults as the admin UI (`category` default `'Spirits'`, `size` default `'1 bottle (750 ml)'`, `rating` default `4.8`, etc). |
| PATCH | `/api/products/:id` | admin | Partial update — used for both full edits and the quick `is_active` toggle. |
| DELETE | `/api/products/:id` | admin | Delete a product. |
| GET | `/api/reviews?status=approved&limit=12` | public | `status=approved` is always public (approved, newest first, default limit 12 — matches the customer site). |
| GET | `/api/reviews?status=pending` (or `rejected`, or no `status`) | admin | Any status other than `approved`, or an unfiltered list, requires an admin session. Matches the admin Reviews view. |
| POST | `/api/reviews` | public | Submit a new review. `status` is always forced to `'pending'` server-side — a client-supplied `status` is ignored. Requires `customer_name`, `review_text`, integer `rating` 1–5; `location` optional. |
| PATCH | `/api/reviews/:id` | admin | Status transitions (`approved`/`rejected`/`pending`) and/or field edits (`customer_name`, `location`, `rating`, `review_text`). |
| POST | `/api/whatsapp-clicks` | public | Log a WhatsApp redirect/lead. `source` must be one of `product`, `cart_checkout`, `enquiry_form`, `contact_form`, `floating_button`, `chatbot`. Returns `400` on malformed input (e.g. bad `source`) — the "never blocks the user" property belongs to the frontend's fire-and-forget `fetch` call, not to this endpoint lying about success. |
| GET | `/api/whatsapp-clicks?page=0&pageSize=25&source=` | admin | Paginated leads list, optional `source` filter, returns `{ data, total }` for pager math. |
| GET | `/api/dashboard` | admin | Single call that returns everything the admin Dashboard needs: `{ products, waTotal, waWeek, reviewsPending, reviewsApproved, avgRating, waSourceCounts, topProductCounts, recentLeads }`. See note below. |

### A genuine improvement: `/api/dashboard`

The current admin Dashboard (`web-react-admin/src/components/DashboardView.jsx`)
makes up to ~7 separate round trips straight from the browser to Supabase
(4 in parallel, then 3 more sequentially once those resolve) and ships raw
rows down to the browser to group/average/sort client-side. `GET
/api/dashboard` collapses all of that into **one** request from the
browser; the backend fans out to Supabase in parallel server-to-server
(faster, no per-request browser↔Supabase latency) and does the
aggregation (status grouping, average rating, source counts, top-6
products) itself before responding.

## Admin authentication

The admin panel's login flow is **not changing**. `web-react-admin` still
calls Supabase Auth directly in the browser
(`supabaseClient.auth.signInWithPassword`, `getSession`,
`onAuthStateChange`) — none of that moves into this backend.

What this backend adds is verification: every admin-only route runs
`src/middleware/requireAdmin.js`, which reads the
`Authorization: Bearer <token>` header (the `access_token` from the
admin's existing Supabase session) and calls
`supabaseAdmin.auth.getUser(token)` using the service-role client to
confirm the token is valid and belongs to a real logged-in user. If it's
missing or invalid, the route responds `401` before touching any data.

## How to switch a frontend over (not done — for later)

This backend is ready to adopt but intentionally not wired up yet.
When that's decided, the shape of the change per call site is:

1. Replace a direct Supabase call, e.g.:
   ```js
   const { data, error } = await supabaseClient
     .from('products')
     .select('*')
     .eq('is_active', true)
     .order('sort_order', { ascending: true });
   ```
   with a `fetch` to this API:
   ```js
   const res = await fetch('http://localhost:5000/api/products');
   const { data } = await res.json();
   ```
2. For admin-only routes, add the admin's current Supabase session token
   as a bearer header:
   ```js
   const { data: { session } } = await supabaseClient.auth.getSession();
   const res = await fetch('http://localhost:5000/api/products/all', {
     headers: { Authorization: `Bearer ${session.access_token}` },
   });
   ```
3. For writes (`POST`/`PATCH`/`DELETE`), send a JSON body and set
   `Content-Type: application/json`, and check `res.ok`/`res.status`
   instead of Supabase's `{ error }` shape.

Base URL should come from an env var (e.g. `VITE_API_BASE_URL`) rather
than being hardcoded, so dev/staging/prod can point at different
backends.

## Project structure

```
backend/
  src/
    app.js                    Express app: helmet, CORS, JSON body parsing,
                               rate limiting, route mounting, error handler.
    server.js                 Loads dotenv, starts the HTTP server.
    lib/
      supabaseAdmin.js        Service-role Supabase client (server-side only).
    middleware/
      requireAdmin.js         Verifies the admin's Supabase Auth JWT.
      errorHandler.js         Centralized error -> clean JSON response.
    routes/
      products.js
      reviews.js
      whatsappClicks.js
      dashboard.js
  .env.example
  package.json
```
