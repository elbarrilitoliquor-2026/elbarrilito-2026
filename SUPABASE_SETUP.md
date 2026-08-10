# El Barrilito — Supabase Setup

This connects the client site and the new `/admin` panel to a real backend/database (Supabase: Postgres + Auth).

## 1. Create the Supabase project
1. Go to https://supabase.com → New project.
2. Wait for it to finish provisioning.

## 2. Run the database schema
1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. This creates:
   - `products` — the catalogue shown on the client site
   - `reviews` — client-submitted reviews (`pending` / `approved` / `rejected`)
   - `whatsapp_clicks` — every redirect to WhatsApp (product asks, cart checkout, enquiry form, floating button, chatbot)
   - Row Level Security policies (public visitors can only read active products / approved reviews, and can insert reviews + WhatsApp click logs; only logged-in admins can read/write everything else)
   - Seed data for the 5 products and 3 reviews already on the site today

## 3. Get your API keys
1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open [`js/supabase-config.js`](js/supabase-config.js) and paste them in:

```js
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

That's the only file you need to edit — both the client site (`index.html`) and the admin panel (`admin/index.html`) load this same config file.

## 4. Create your admin login
1. In Supabase: **Authentication → Users → Add user**.
2. Enter the email/password you want to use to log into `/admin`.
3. (Optional) Turn off "Enable email confirmations" under **Authentication → Providers → Email** if you don't want a confirmation email step for admin accounts you create manually.

> Anyone with an account in Supabase Auth can log into the admin panel and has full read/write access to products, reviews, and WhatsApp leads — only create accounts for people who should have that access.

## 5. Open the site
- Client site: open `index.html` directly, or serve the folder with any static server.
- Admin panel: open `admin/index.html`, log in with the account from step 4.

## What's wired up

**Client site (`index.html`)**
- Product cards in the "Our Spirit Selection" slider are now loaded from the `products` table (falls back to the original static cards if Supabase isn't configured yet).
- Every WhatsApp redirect (product "Ask on WhatsApp" button, cart checkout, enquiry form, floating WhatsApp button, chatbot fallback) logs a row into `whatsapp_clicks`.
- The testimonials section loads `approved` reviews from the `reviews` table.
- A "Share Your Experience" form under testimonials lets customers submit a new review, saved as `pending`.

**Admin panel (`admin/index.html`)**
- **Login** — Supabase Auth email/password.
- **Dashboard** — total products, WhatsApp click counts (all-time / last 7 days), pending/approved review counts, average rating, a breakdown of clicks by source, top asked-about products, and a recent activity table.
- **Catalogue** — add/edit/delete products, toggle active/inactive (inactive products stop showing on the client site immediately), set sort order, price, sale price, image URL, badge, description.
- **WhatsApp Leads** — paginated, filterable log of every WhatsApp redirect with customer name/phone (when provided) and the message that was sent.
- **Reviews** — tabs for Pending / Approved / Rejected, with Approve / Reject / Edit / Move-to-Pending actions. Only `approved` reviews are visible on the client site.

## Notes on product images
`image_url` can be a path relative to the site root (e.g. `assets/images/wine_product.png`, which already exist in the repo) or a full URL to an image hosted elsewhere (e.g. Supabase Storage, once you set up a bucket there).
