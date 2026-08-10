# El Barrilito — Admin Panel (React)

This is a React (Vite, plain JavaScript) rewrite of the vanilla `admin/index.html`
/ `admin/admin.js` / `admin/admin.css` admin panel one level up in this repo.
The original static admin panel is untouched — this app lives entirely in
`web-react-admin/` and is a separate, independent build. It is also fully
independent of the `web-react/` customer site (no shared code, no workspace
link) — the two projects just happen to talk to the same Supabase project.

It talks to the **same Supabase project** as `/admin` (the vanilla-JS admin
panel) and `/web-react` (the React customer site) — products, reviews, and
WhatsApp click tracking are shared across all three.

## Setup

```bash
npm install
cp .env.example .env
```

Then open `.env` and fill in your Supabase project's URL and anon key
(Supabase Dashboard → Project Settings → API). Use the **same project** as
`../js/supabase-config.js` and `../web-react/.env` so the catalogue/reviews/leads
match what you see in `/admin` and on the live site.

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

You'll also need a Supabase Auth user (Authentication → Add user, email +
password) to sign in — the admin panel is gated entirely behind a logged-in
Supabase Auth session (RLS requires `authenticated`, matching `supabase/schema.sql`).

## Run

```bash
npm run dev
```

Opens the dev server at **http://localhost:4176** (set explicitly in
`vite.config.js` so it never collides with `web-react/`'s dev server, which
runs on port 4173).

## Build

```bash
npm run build
```

Outputs a production build to `dist/`. Preview it locally with `npm run preview`.

## Project layout

- `src/lib/supabaseClient.js` — singleton Supabase client (reads `VITE_*` env vars), same pattern as `web-react/src/lib/supabaseClient.js`.
- `src/lib/format.js` — `formatDate`, `truncate`, `sourceLabel`/`SOURCE_LABELS` helpers ported from `admin/admin.js`.
- `src/context/AuthContext.jsx` — wraps `supabaseClient.auth` (`getSession`, `signInWithPassword`, `signOut`, `onAuthStateChange`), exposing `session`, `loading`, `signIn`, `signOut`. Gates the whole app.
- `src/components/LoginScreen.jsx` — email/password form (generic "Invalid email or password." error, disabled/"SIGNING IN…" button state while submitting).
- `src/components/AdminApp.jsx` — sidebar + main content shell. Uses simple `useState` view switching (`dashboard` / `catalogue` / `leads` / `reviews`) rather than URL routing, matching the original's JS-toggled-visibility approach (no `react-router-dom` dependency — the original never had URL routing either).
- `src/components/Sidebar.jsx` — nav links + sign-out button.
- `src/components/DashboardView.jsx` + `BarChart.jsx` — 6 stat cards, two plain div/width-percentage bar charts (no chart library, ported from `renderBarChart()`), recent-leads table (8 rows).
- `src/components/CatalogueView.jsx` + `ProductModal.jsx` — products table with active-toggle switches (update `is_active` immediately on change) and an add/edit/delete modal.
- `src/components/LeadsView.jsx` — paginated (25/page) `whatsapp_clicks` table with a source filter and prev/next pager.
- `src/components/ReviewsView.jsx` + `ReviewModal.jsx` — pending/approved/rejected tabs, review cards with star display, approve/reject/unapprove/edit actions, and an edit modal.
- `src/index.css` — ported from `admin/admin.css` verbatim (same class names and CSS custom properties, red/cream palette).
- `public/assets/images/` — `eb-logo.png` and `eb-barrel-logo.svg`, copied as-is for the login screen and sidebar brand.

## What's ported 1:1 vs. simplified

**Ported faithfully:**
- Auth flow: `checkSession()` → login/logout, `onAuthStateChange('SIGNED_OUT', …)` returning to the login screen immediately.
- Every Supabase query/mutation — same table names, filters, field names, ordering, and status transitions as `admin/admin.js` (dashboard parallel count queries, 7-day lookback, avg-rating computation, catalogue CRUD + payload coercions, leads pagination math (`range()`, page count from `count`), review status transitions).
- The plain div/width-percentage bar charts — intentionally no charting library added.
- The WhatsApp Leads source filter's label map, including `contact_form`, which appears in `admin.js`'s label maps even though `supabase/schema.sql`'s check constraint on `whatsapp_clicks.source` only lists 4 values. Ported as-is, not invented.

**Simplified:**
- `escapeHtml()` from `admin/admin.js` is **not** ported. The original manually escaped HTML because it built raw `innerHTML` strings from template literals. In React, JSX escapes all text content by default, so this is unnecessary — values are rendered as plain JSX children instead of via `dangerouslySetInnerHTML`.

## Next steps

1. `cd web-react-admin && npm install`
2. `cp .env.example .env` and fill in the same Supabase URL/anon key as `../js/supabase-config.js` and `../web-react/.env`.
3. `npm run dev` and sign in with a Supabase Auth user created in your project (Authentication → Add user).
4. `npm run build` when ready to deploy; the `dist/` folder is a static build you can host anywhere (e.g. alongside `/admin` on the same domain, or on its own subdomain — just make sure it's not publicly indexed since it's an admin panel).
