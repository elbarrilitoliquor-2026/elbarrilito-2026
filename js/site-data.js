/* ============================================================
   SITE DATA LAYER — Supabase-backed products, reviews, WA tracking
   Loaded on the client (index.html) after supabase-config.js
   ============================================================ */

'use strict';

const WHATSAPP_NUMBER = '18327367123';

/* ─── WhatsApp click tracking ─────────────────────────────── */
// Fire-and-forget insert so it never blocks/breaks the WhatsApp redirect.
function trackWhatsAppClick({ source, productName = null, customerName = null, customerPhone = null, message = null }) {
  try {
    supabaseClient.from('whatsapp_clicks').insert({
      source,
      product_name: productName,
      customer_name: customerName,
      customer_phone: customerPhone,
      message,
      page_url: window.location.href
    }).then(() => {}, () => {});
  } catch (e) {
    /* tracking must never block the user's WhatsApp redirect */
  }
}

/* ─── Product card HTML builder (mirrors the original static markup) ─── */
function buildProductCardHTML(p) {
  const oldPriceHTML = p.old_price
    ? `<span class="prod-price-old">$${Number(p.old_price).toFixed(2)}</span>`
    : '';
  const offPct = p.old_price && p.old_price > p.price
    ? Math.round((1 - p.price / p.old_price) * 100)
    : null;
  const offHTML = offPct ? `<span class="prod-off">${offPct}% OFF</span>` : '';
  const badgeHTML = p.badge ? `<span class="prod-badge">${p.badge}</span>` : '';
  const ratingCount = p.rating_count >= 1000
    ? (p.rating_count / 1000).toFixed(1) + 'k'
    : p.rating_count;

  const waText = `Hi! I'm interested in ${p.name} ($${Number(p.price).toFixed(2)}). Is it available?`;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  return `
    <div class="product-card" id="prod-${p.id}" data-id="${p.id}" data-desc="${escapeHtmlAttr(p.description || '')}">
      <div class="prod-img-wrap">
        ${badgeHTML}
        <div class="prod-img-box">
          <img src="${p.image_url || 'assets/images/wine_product.png'}" alt="${escapeHtmlAttr(p.name)}" loading="lazy" decoding="async" />
        </div>
        <button class="prod-cart-btn" id="pc-${p.id}" data-product="${escapeHtmlAttr(p.name)}" data-price="${p.price}">ADD</button>
      </div>
      <div class="prod-info">
        <div class="prod-price-row">
          <span class="prod-price-now">$${Number(p.price).toFixed(2)}</span>
          ${oldPriceHTML}
        </div>
        ${offHTML}
        <div class="prod-divider"></div>
        <h3 class="prod-name">${escapeHtml(p.name)}</h3>
        <p class="prod-size">${escapeHtml(p.size || '')}</p>
        <div class="prod-bottom">
          <div class="prod-rating"><span class="rating-star">★</span> ${Number(p.rating).toFixed(1)} (${ratingCount})</div>
          <a href="${waHref}" target="_blank" rel="noopener" class="prod-wa-btn" data-wa-source="product" data-wa-product="${escapeHtmlAttr(p.name)}" data-wa-message="${escapeHtmlAttr(waText)}" aria-label="Ask about ${escapeHtmlAttr(p.name)} on WhatsApp" title="Ask on WhatsApp">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeHtmlAttr(str) {
  return escapeHtml(str);
}

/* ─── Load products from Supabase and render into the slider ─── */
async function loadProducts() {
  const slider = document.getElementById('products-slider');
  if (!slider) return;

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load products:', error);
    return; // keep whatever static fallback markup is already in the HTML
  }
  if (!data || data.length === 0) return;

  slider.innerHTML = data.map(buildProductCardHTML).join('');

  // Tell the rest of script.js (cart drawer, slider, PDP modal) that fresh
  // product cards now exist in the DOM so it can (re)bind to them.
  document.dispatchEvent(new CustomEvent('eb:products-loaded'));
}

/* ─── Reviews: load approved reviews into the testimonials grid ─── */
function buildTestimonialHTML(r) {
  const initials = r.customer_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const stars = '★★★★★'.slice(0, r.rating) + '☆☆☆☆☆'.slice(0, 5 - r.rating);

  return `
    <div class="testi-card reveal-up" id="tc-${r.id}">
      <div class="testi-quote">"</div>
      <p class="testi-text">${escapeHtml(r.review_text)}</p>
      <div class="testi-author">
        <div class="testi-avatar">${escapeHtml(initials)}</div>
        <div>
          <strong>${escapeHtml(r.customer_name)}</strong>
          <span>${escapeHtml(r.location || '')}</span>
        </div>
        <div class="testi-stars">${stars}</div>
      </div>
    </div>
  `;
}

async function loadApprovedReviews() {
  const grid = document.querySelector('.testi-grid');
  if (!grid) return;

  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Failed to load reviews:', error);
    return;
  }
  if (!data || data.length === 0) return;

  grid.innerHTML = data.map(buildTestimonialHTML).join('');
  if (window.gsap) {
    document.dispatchEvent(new CustomEvent('eb:reviews-loaded'));
  }
}

/* ─── Review submission form ─────────────────────────────── */
function initReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  const nameInput = document.getElementById('review-name');
  const locationInput = document.getElementById('review-location');
  const textInput = document.getElementById('review-text');
  const stars = [...document.querySelectorAll('.review-star-input')];
  const statusEl = document.getElementById('review-form-status');
  const submitBtn = document.getElementById('review-submit-btn');

  let selectedRating = 5;

  function paintStars() {
    stars.forEach((s, i) => {
      s.classList.toggle('active', i < selectedRating);
      s.setAttribute('aria-pressed', i < selectedRating ? 'true' : 'false');
    });
  }
  stars.forEach((s, i) => {
    s.addEventListener('click', () => {
      selectedRating = i + 1;
      paintStars();
    });
  });
  paintStars();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customer_name = nameInput?.value.trim() || '';
    const location = locationInput?.value.trim() || '';
    const review_text = textInput?.value.trim() || '';

    if (!customer_name || !review_text) {
      if (statusEl) {
        statusEl.textContent = 'Please enter your name and a review before submitting.';
        statusEl.className = 'review-form-status error';
      }
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'SUBMITTING…'; }

    const { error } = await supabaseClient.from('reviews').insert({
      customer_name,
      location: location || null,
      rating: selectedRating,
      review_text,
      status: 'pending'
    });

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'SUBMIT REVIEW'; }

    if (error) {
      console.error(error);
      if (statusEl) {
        statusEl.textContent = 'Something went wrong submitting your review. Please try again.';
        statusEl.className = 'review-form-status error';
      }
      return;
    }

    form.reset();
    selectedRating = 5;
    paintStars();
    if (statusEl) {
      statusEl.textContent = 'Thank you! Your review has been submitted and will appear here once approved by our team.';
      statusEl.className = 'review-form-status success';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadApprovedReviews();
  initReviewForm();
});
