-- ============================================================
-- El Barrilito Liquor Store — Supabase Schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. PRODUCTS  (catalogue shown on the client page)
-- ------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null default 'Spirits',     -- Tequila, Mezcal, Whiskey, Wine, Beer, etc.
  size          text not null default '1 bottle (750 ml)',
  description   text not null default '',
  price         numeric(10,2) not null,
  old_price     numeric(10,2),                        -- optional strike-through price
  image_url     text,                                 -- public URL (Supabase Storage or external)
  badge         text,                                 -- e.g. "Bestseller" (nullable)
  rating        numeric(2,1) not null default 4.8,
  rating_count  integer not null default 0,
  is_active     boolean not null default true,        -- controls visibility on client site
  sort_order    integer not null default 0,           -- manual ordering in the slider
  stock_quantity integer not null default 0,          -- current inventory
  low_stock_threshold integer not null default 5,     -- alert when stock drops below this
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_active_sort_idx
  on public.products (is_active, sort_order);

-- ------------------------------------------------------------
-- 2. REVIEWS  (client-submitted, admin-moderated)
-- ------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  location      text,                                 -- e.g. "Pasadena, TX" (optional)
  rating        integer not null check (rating between 1 and 5),
  review_text   text not null,
  status        text not null default 'pending'       -- pending | approved | rejected
                  check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists reviews_status_idx on public.reviews (status, created_at desc);

-- ------------------------------------------------------------
-- 3. WHATSAPP CLICKS  (lead tracking — every redirect to WhatsApp)
-- ------------------------------------------------------------
create table if not exists public.whatsapp_clicks (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,                        -- 'product' | 'cart_checkout' | 'enquiry_form' | 'contact_form' | 'floating_button' | 'chatbot'
  product_name  text,                                  -- populated when source = 'product' or 'cart_checkout'
  customer_name text,                                   -- populated when source = 'cart_checkout', 'enquiry_form', or 'contact_form'
  customer_phone text,
  message       text,                                  -- the actual WhatsApp message text sent
  page_url      text,
  created_at    timestamptz not null default now()
);

create index if not exists whatsapp_clicks_created_idx on public.whatsapp_clicks (created_at desc);
create index if not exists whatsapp_clicks_source_idx on public.whatsapp_clicks (source);

-- ------------------------------------------------------------
-- 3.5. SALES & BILLING  (admin-managed)
-- ------------------------------------------------------------
create table if not exists public.sales (
  id            uuid primary key default gen_random_uuid(),
  sale_type     text not null check (sale_type in ('online', 'offline')),
  total_amount  numeric(10,2) not null,
  customer_name text,
  notes         text,
  created_at    timestamptz not null default now()
);

create table if not exists public.sale_items (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null references public.sales(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete restrict,
  quantity      integer not null,
  price_at_time numeric(10,2) not null
);

create index if not exists sales_created_idx on public.sales (created_at desc);


-- ------------------------------------------------------------
-- 4. updated_at auto-touch trigger (products & reviews)
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
--    Public (anon) visitors: read active products, read approved reviews,
--    insert new reviews (pending only), insert whatsapp_clicks.
--    Admins (authenticated users): full read/write on everything.
-- ------------------------------------------------------------
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.whatsapp_clicks enable row level security;

-- PRODUCTS
drop policy if exists "public read active products" on public.products;
create policy "public read active products"
  on public.products for select
  to anon
  using (is_active = true);

drop policy if exists "admin full access products" on public.products;
create policy "admin full access products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- REVIEWS
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews"
  on public.reviews for select
  to anon
  using (status = 'approved');

drop policy if exists "public submit review" on public.reviews;
create policy "public submit review"
  on public.reviews for insert
  to anon
  with check (status = 'pending');

drop policy if exists "admin full access reviews" on public.reviews;
create policy "admin full access reviews"
  on public.reviews for all
  to authenticated
  using (true)
  with check (true);

-- WHATSAPP CLICKS
drop policy if exists "public insert whatsapp click" on public.whatsapp_clicks;
create policy "public insert whatsapp click"
  on public.whatsapp_clicks for insert
  to anon
  with check (true);

drop policy if exists "admin read whatsapp clicks" on public.whatsapp_clicks;
create policy "admin read whatsapp clicks"
  on public.whatsapp_clicks for select
  to authenticated
  using (true);

drop policy if exists "admin manage whatsapp clicks" on public.whatsapp_clicks;
create policy "admin manage whatsapp clicks"
  on public.whatsapp_clicks for all
  to authenticated
  using (true)
  with check (true);

-- SALES & SALE_ITEMS
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "admin full access sales" on public.sales;
create policy "admin full access sales"
  on public.sales for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admin full access sale items" on public.sale_items;
create policy "admin full access sale items"
  on public.sale_items for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------
-- 6. SEED DATA — the 5 products currently hardcoded on the site
-- ------------------------------------------------------------
insert into public.products (name, category, size, description, price, old_price, image_url, badge, rating, rating_count, sort_order)
values
  ('Tequila Añejo', 'Tequila', '1 bottle (750 ml)',
   'Aged over a year in oak barrels for a smooth, rounded character with warm notes of vanilla, caramel and toasted oak. A refined sipping tequila best enjoyed neat or on the rocks.',
   45.99, 52.99, 'assets/images/wine_product.png', 'Bestseller', 4.8, 41900, 1),

  ('Mezcal Artesanal', 'Mezcal', '1 bottle (750 ml)',
   'Handcrafted in small batches using traditional methods, this mezcal delivers a bold, smoky character with earthy agave depth. A favorite among those who love authentic, artisanal spirits.',
   44.99, 52.99, 'assets/images/bourbon_product.png', null, 4.7, 15800, 2),

  ('Kentucky Bourbon', 'Whiskey', '1 bottle (750 ml)',
   'A single barrel Kentucky straight bourbon with rich caramel, oak and a gentle hint of spice on the finish. Smooth enough to sip neat, bold enough to anchor your favorite cocktail.',
   38.99, 45.00, 'assets/images/whiskey_product.png', null, 4.9, 32400, 3),

  ('Tequila Reposado', 'Tequila', '1 bottle (750 ml)',
   'Rested in oak for a mellow, golden character that balances sweet agave with subtle wood notes. A versatile bottle equally at home in a margarita or sipped slowly.',
   32.99, 39.99, 'assets/images/limited_edition.png', null, 4.8, 20500, 4),

  ('Craft Beer Pack', 'Beer', '1 pack (6 x 355 ml)',
   'A hand-picked six-pack of Mexican and craft beer favorites, served ice-cold and ready for any occasion — game day, a backyard cookout, or just unwinding after a long week.',
   18.99, 22.00, 'assets/images/craft_beer.png', null, 4.6, 12100, 5)
on conflict do nothing;

-- ------------------------------------------------------------
-- 7. SEED DATA — the 3 testimonials currently hardcoded on the site
--    (inserted as already-approved so they keep showing immediately)
-- ------------------------------------------------------------
insert into public.reviews (customer_name, location, rating, review_text, status)
values
  ('Maria Garcia', 'Local Customer · Pasadena, TX', 5,
   'Best liquor store in Pasadena, hands down! The tequila selection is incredible — they carry brands I can''t find anywhere else in Houston. The staff is super friendly and always helps me pick the perfect bottle. ¡Los recomiendo!',
   'approved'),

  ('Carlos Rodriguez', 'Regular Customer · South Houston', 5,
   'I''ve been coming to El Barrilito for years. Their prices are always fair and they have an amazing selection of mezcals and craft beers. The bilingual service makes everyone feel welcome. This is my go-to spot!',
   'approved'),

  ('James Thompson', 'Spirits Enthusiast · Deer Park', 5,
   'Stopped by looking for a specific añejo tequila and the staff knew exactly what I needed. Great atmosphere, clean store, and the selection rivals shops twice its size. A real gem on Shaver Street!',
   'approved')
on conflict do nothing;

-- ------------------------------------------------------------
-- 8. STORE SETTINGS TABLE (Editable contact info, address, hours, maps)
-- ------------------------------------------------------------
create table if not exists public.store_settings (
  id text primary key default 'default',
  address text not null default '3370 Shaver St, Pasadena, TX 77504',
  google_maps_url text not null default 'https://www.google.com/maps/search/?api=1&query=3370+Shaver+St+Pasadena+TX+77504',
  phone text not null default '+1 (713) 360-6526',
  whatsapp_number text not null default '18327367123',
  whatsapp_display text not null default '+1 (832) 736-7123',
  email text not null default 'info@elbarrilito.com',
  hours text not null default 'Mon–Sat: 10 AM – 9 PM · Sunday: Closed',
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

drop policy if exists "public read store settings" on public.store_settings;
create policy "public read store settings"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admin full access store settings" on public.store_settings;
create policy "admin full access store settings"
  on public.store_settings for all
  to authenticated
  using (true)
  with check (true);

insert into public.store_settings (id, address, google_maps_url, phone, whatsapp_number, whatsapp_display, email, hours)
values (
  'default',
  '3370 Shaver St, Pasadena, TX 77504',
  'https://www.google.com/maps/search/?api=1&query=3370+Shaver+St+Pasadena+TX+77504',
  '+1 (713) 360-6526',
  '18327367123',
  '+1 (832) 736-7123',
  'info@elbarrilito.com',
  'Mon–Sat: 10 AM – 9 PM · Sunday: Closed'
)
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- 9. BANNERS TABLE (Admin-managed promo & ad banner cards)
--    section = 'promo' → 3-card Exclusive Offers grid (PromoBanner.jsx)
--    section = 'ad'    → scrolling marquee cards (AdBanner.jsx)
-- ------------------------------------------------------------
create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  section     text not null check (section in ('promo', 'ad')),
  title       text not null,
  subtitle    text,           -- e.g. "Premium Agave Spirits"
  badge       text,           -- e.g. "NEW LAUNCH", "LIMITED TIME"
  badge_style text,           -- CSS suffix: 'gold' | 'orange' | 'green' | 'blue' | 'red'
  discount    text,           -- Promo cards: "Up to 20% Off" (shown as price tag)
  cta_label   text,           -- Ad cards: "CLAIM OFFER →"
  image_url   text,           -- public image URL or /assets/images/... path
  card_style  text,           -- CSS suffix for card color theme
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists banners_section_sort_idx
  on public.banners (section, is_active, sort_order);

drop trigger if exists trg_banners_updated_at on public.banners;
create trigger trg_banners_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

drop policy if exists "public read active banners" on public.banners;
create policy "public read active banners"
  on public.banners for select
  to anon
  using (is_active = true);

drop policy if exists "admin full access banners" on public.banners;
create policy "admin full access banners"
  on public.banners for all
  to authenticated
  using (true)
  with check (true);

-- Seed: Promo banner cards (PromoBanner section)
insert into public.banners (section, title, subtitle, discount, image_url, card_style, sort_order)
values
  ('promo', 'TEQUILA', 'Premium Agave Spirits', 'Up to 20% Off', '/assets/images/promo_tequila.png', 'tequila', 1),
  ('promo', 'MEZCAL', 'Artisanal & Smoky', 'Special Deals', '/assets/images/promo_mezcal.png', 'mezcal', 2),
  ('promo', 'WHISKEY', 'Rare Bourbons & Scotch', 'Members Only', '/assets/images/promo_whiskey.png', 'whiskey', 3)
on conflict do nothing;

-- Seed: Ad banner cards (AdBanner marquee section)
insert into public.banners (section, title, subtitle, badge, badge_style, cta_label, image_url, card_style, sort_order)
values
  ('ad', '2026 Reserve Tequila & Mezcal', 'Handcrafted small-batch agave spirits. 20% OFF introductory release!', 'NEW LAUNCH', 'gold', 'CLAIM OFFER →', '/assets/images/limited_edition.png', 'burgundy', 1),
  ('ad', 'Single Barrel 10-Yr Bourbon', 'Rich oak & caramel aroma. FREE DELIVERY on 2+ bottles in Pasadena.', 'LIMITED TIME', 'orange', 'ORDER NOW →', '/assets/images/bourbon_product.png', 'amber', 2),
  ('ad', 'Chateau Bordeaux Grand Cru', '98-point sommelier selection. BUY 3 GET 15% OFF + free gift box.', 'STAFF PICK', 'green', 'EXPLORE WINES →', '/assets/images/wine_product.png', 'emerald', 3),
  ('ad', 'Private Cask Single Malt', 'Aged in sherry casks with honeyed peat notes. SPECIAL $15 DISCOUNT.', 'VIP EXCLUSIVE', 'blue', 'VIEW WHISKEY →', '/assets/images/whiskey_product.png', 'slate', 4),
  ('ad', 'Local Texas & Craft Beers', 'Freshly hopped IPAs, stouts & Belgian ales. MIX & MATCH 6-PACKS.', 'NEW IN STOCK', 'red', 'SHOP BREWS →', '/assets/images/craft_beer.png', 'sunset', 5)
on conflict do nothing;

-- ============================================================
-- DONE. Next steps:
-- 1. Project Settings → API → copy "Project URL" and "anon public" key
-- 2. Paste them into ELBarrilito/js/supabase-config.js
-- 3. Authentication → Add user (email + password) to create your admin login
-- ============================================================

-- ------------------------------------------------------------
-- 10. SUPABASE STORAGE — product-images bucket
--     Stores uploaded product and banner images.
--     Run this AFTER the tables above are created.
-- ------------------------------------------------------------

-- Create the storage bucket (public = files are accessible via public URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB per file
  array['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do nothing;

-- Allow authenticated admins to upload, update, and delete files
drop policy if exists "admin upload images" on storage.objects;
create policy "admin upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "admin update images" on storage.objects;
create policy "admin update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- Allow anyone (anon) to read/view the uploaded images (public bucket)
drop policy if exists "public read images" on storage.objects;
create policy "public read images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

