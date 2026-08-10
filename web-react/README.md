# El Barrilito — React Site

This is a React (Vite, plain JavaScript) rewrite of the static `index.html` /
`script.js` / `gsap-animations.js` / `style.css` site one level up in this
repo. The original static site is untouched — this app lives entirely in
`web-react/` and is a separate, independent build.

It talks to the **same Supabase project** as `/admin` (the existing vanilla-JS
admin panel) — products, reviews, and WhatsApp click tracking are shared
across both.

## Setup

```bash
npm install
cp .env.example .env
```

Then open `.env` and fill in your Supabase project's URL and anon key
(Supabase Dashboard → Project Settings → API). Use the **same project** as
`../js/supabase-config.js` so the catalogue/reviews/leads match what you see
in `/admin`.

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Run

```bash
npm run dev
```

Opens the dev server (default http://localhost:5173).

## Build

```bash
npm run build
```

Outputs a production build to `dist/`. Preview it locally with `npm run preview`.

## Project layout

- `src/lib/supabaseClient.js` — singleton Supabase client (reads `VITE_*` env vars).
- `src/lib/gsap.js` — registers the GSAP `ScrollTrigger` plugin once; exports the `wrapWords()` word-mask helper used by the heading/hero reveal animations.
- `src/hooks/useProducts.js`, `src/hooks/useReviews.js` — data-fetching hooks (active products by `sort_order`; approved reviews, newest 12).
- `src/hooks/useWhatsAppTracking.js` — fire-and-forget `trackWhatsAppClick()`, matches the original's "never block the WhatsApp redirect" contract.
- `src/context/CartContext.jsx` — cart state (add/inc/dec/remove + derived subtotal/tax/total), persisted to `localStorage` under the same `eb-cart` key the static site used.
- `src/components/*` — one component per section of the original page, in the same top-to-bottom order as `index.html` (see `src/App.jsx`).
- `src/index.css` — the original `style.css`, copied verbatim so every class name (`.hero`, `.product-card`, `.cart-drawer`, etc.) keeps working unchanged.
- `public/assets/images/` — the original `assets/images/*` files, copied as-is so `image_url` values like `assets/images/wine_product.png` from the `products` table keep resolving (the app also falls back to `/assets/images/wine_product.png` when a product has no `image_url`, consistently in `ProductCard` and `ProductModal`).

## What's ported 1:1 vs. simplified

**Ported faithfully:**
- Age gate (`sessionStorage` "age-ok" flag, 21+ confirmation, "under 21" redirect).
- Navbar scroll state, dropdowns (CSS `:hover`, unchanged), active-section highlighting.
- Mobile menu drawer open/close, `Escape` to close, body scroll lock.
- Product slider math (visible-count breakpoints, card width calc, touch-swipe threshold, prev/next) — copied from `script.js`'s `initProductSlider()`.
- Cart drawer: add/inc/dec/remove, 8.25% TX tax, WhatsApp checkout message template (same emoji/line format), required-field validation.
- Product Detail Page (PDP) modal.
- Chatbot's full regex-based knowledge base (`answerQuestion()`), suggestion chips, WhatsApp fallback for unanswered questions.
- Every WhatsApp deep link + its `trackWhatsAppClick` `source` value: `product`, `cart_checkout`, `enquiry_form`, `floating_button`, `chatbot`.
- GSAP scroll layer: progress bar, hero word-mask intro, heading word-wipe reveals, `.reveal-up`/`.reveal-fade` batch reveals, image parallax (about/varietals/vintage), full-bleed text drift, kinetic marquee skew, product-card stagger, "why choose us" reveal — all respecting `prefers-reduced-motion`.
- The hero "pouring liquid" art itself is CSS-only in the original (the SVG `<path>` elements are static empty stubs; there is no JS path-morphing code to port) — the markup and CSS are carried over unchanged, so it renders identically.

**Deliberately simplified:**
- No server-rendered fallback / static seed data for products or reviews — if Supabase isn't configured yet, the shop shows a "no products yet" message and testimonials fall back to the original 3 static quotes, instead of the vanilla site's approach of leaving static HTML in place until a fetch succeeds. This is simpler but equivalent in spirit (graceful, non-broken empty state).
- The "added to cart" toast infers the just-added item by watching cart length increase, rather than being triggered from the exact click handler (functionally identical for the single-user-action case the UI supports).
- Newsletter form has no backend table in `supabase/schema.sql` (same as the original — it was always cosmetic-only client-side).

## Known TODOs

- Fill in real Supabase credentials in `.env` before products/reviews will appear (see Setup above).
- No automated tests were added (none existed in the original static site either).
