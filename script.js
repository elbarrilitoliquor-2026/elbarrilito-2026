/* ============================================================
   PRESTIGE SPIRITS — Vintneri-Style Wine Shop
   JavaScript: All Interactions
============================================================ */

'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

document.addEventListener('DOMContentLoaded', () => {
  initAgeModal();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initProductSlider();
  initCartDrawer();
  initChatbot();
  initNewsletterForm();
  initEnquiryForm();
  initSmoothScroll();
  initActiveNav();
  initMarquee();
  initHeroParallax();
  initCountUp();
  initHeroWhatsAppOnly();
});

/* ─── 1. AGE MODAL ──────────────────────────────────────────── */
function initAgeModal() {
  const modal = $('#age-modal');
  if (sessionStorage.getItem('age-ok') === '1') { modal.classList.add('hidden'); return; }
  $('#age-yes')?.addEventListener('click', () => {
    sessionStorage.setItem('age-ok', '1');
    modal.classList.add('hidden');
  });
  $('#age-no')?.addEventListener('click', () => {
    window.location.href = 'https://www.responsibility.org/';
  });
}

/* ─── 2. NAVBAR SCROLL ──────────────────────────────────────── */
function initNavbar() {
  const nav = $('#navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ─── 3. MOBILE MENU ────────────────────────────────────────── */
function initMobileMenu() {
  const burger = $('#nav-hamburger');
  const menu = $('#mobile-menu');
  const close = $('#mobile-close');
  const overlay = $('#mobile-menu-overlay');

  function toggleMenu(open) {
    if (!menu) return;
    const isOpening = typeof open === 'boolean' ? open : !menu.classList.contains('open');
    menu.classList.toggle('open', isOpening);
    overlay?.classList.toggle('open', isOpening);
    burger?.classList.toggle('open', isOpening);
    document.body.style.overflow = isOpening ? 'hidden' : '';
  }

  burger?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  close?.addEventListener('click', () => toggleMenu(false));
  overlay?.addEventListener('click', () => toggleMenu(false));
  $$('.mob-link, .mob-cta').forEach(l => l.addEventListener('click', () => toggleMenu(false)));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
}

/* ─── 4. SCROLL REVEAL ──────────────────────────────────────── */
function initScrollReveal() {
  if (window.gsap && window.ScrollTrigger) return;
  const els = $$('.reveal-up, .reveal-fade');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => io.observe(el));
}

/* ─── 5. PRODUCT SLIDER ─────────────────────────────────────── */
function initProductSlider() {
  const slider = $('#products-slider');
  const prev = $('#prev-btn');
  const next = $('#next-btn');
  if (!slider) return;

  const cards = $$('.product-card', slider);
  let current = 0;

  function getVisibleCount() {
    if (window.innerWidth <= 480) return 2.2;
    if (window.innerWidth <= 768) return 2.5;
    if (window.innerWidth <= 1024) return 3.2;
    return 4;
  }

  function update() {
    const vis = getVisibleCount();
    const max = Math.max(0, cards.length - Math.floor(vis));
    current = Math.min(Math.max(current, 0), max);
    
    const gap = window.innerWidth <= 480 ? 10 : (window.innerWidth <= 768 ? 12 : 16);
    const containerW = slider.parentElement ? slider.parentElement.offsetWidth : window.innerWidth;
    const cardW = (containerW - (gap * (vis - 1))) / vis;

    cards.forEach(c => {
      c.style.flexShrink = '0';
      c.style.width = `${cardW}px`;
      c.style.marginRight = `${gap}px`;
      c.style.opacity = '1';
      c.style.visibility = 'visible';
    });

    const shift = current * (cardW + gap);
    slider.style.transform = `translateX(-${shift}px)`;
    slider.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
  }

  slider.style.display = 'flex';
  slider.style.overflow = 'visible';
  slider.style.width = '100%';

  let startX = 0;
  let moveX = 0;
  let isSwiping = false;

  slider.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  slider.addEventListener('touchmove', e => {
    if (!isSwiping) return;
    moveX = e.touches[0].clientX - startX;
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    if (!isSwiping) return;
    if (moveX < -35) { current++; }
    else if (moveX > 35) { current--; }
    isSwiping = false;
    moveX = 0;
    update();
  });

  prev?.addEventListener('click', () => { current--; update(); });
  next?.addEventListener('click', () => { current++; update(); });
  window.addEventListener('resize', update);

  update();
}

/* ─── 6. WHATSAPP E-COMMERCE CART DRAWER ─────────────────────── */
function initCartDrawer() {
  const cartBtn = $('#cart-btn');
  const cartCountEl = $('#cart-count');
  const cartDrawer = $('#cart-drawer');
  const cartOverlay = $('#cart-overlay');
  const cartClose = $('#cart-drawer-close');
  const cartItemsContainer = $('#cart-drawer-items');
  const cartEmpty = $('#cart-empty');
  const cartTotalEl = $('#cart-total-price');
  const cartTaxEl = $('#cart-tax-price');
  const cartGrandEl = $('#cart-total-billing');
  const cartWaBtn = $('#cart-wa-order-btn');
  const toast = $('#cart-toast');
  const toastMsg = $('#toast-msg');

  let cart = [];
  try {
    const saved = localStorage.getItem('eb-cart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    cart = [];
  }

  function saveCart() {
    try {
      localStorage.setItem('eb-cart', JSON.stringify(cart));
    } catch (e) {}
    renderCart();
  }

  function openDrawer() {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  });
  cartClose?.addEventListener('click', closeDrawer);
  cartOverlay?.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  function syncProductButtons() {
    $$('.prod-cart-btn').forEach(btn => {
      const name = btn.dataset.product;
      const item = cart.find(i => i.name === name);
      if (item && item.qty > 0) {
        btn.classList.add('in-cart');
        btn.innerHTML = `
          <span class="btn-qty-action" data-btn-action="dec" data-product="${name}">−</span>
          <span class="btn-qty-count">${item.qty}</span>
          <span class="btn-qty-action" data-btn-action="inc" data-product="${name}">+</span>
        `;
      } else {
        btn.classList.remove('in-cart');
        btn.textContent = btn.id === 'pdp-cart-btn' ? 'ADD TO CART' : 'ADD';
      }
    });
  }

  function renderCart() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) {
      cartCountEl.textContent = totalQty;
      cartCountEl.classList.toggle('visible', totalQty > 0);
    }

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'flex';
      $$('.cart-item', cartItemsContainer).forEach(el => el.remove());
      if (cartTotalEl) cartTotalEl.textContent = '$0.00';
      if (cartTaxEl) cartTaxEl.textContent = '$0.00';
      if (cartGrandEl) cartGrandEl.textContent = '$0.00';
      if (cartWaBtn) {
        cartWaBtn.style.opacity = '0.5';
        cartWaBtn.style.pointerEvents = 'none';
      }
      syncProductButtons();
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    $$('.cart-item', cartItemsContainer).forEach(el => el.remove());

    let subtotal = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-action="dec" data-index="${index}">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-qty-btn" data-action="inc" data-index="${index}">+</button>
          <button class="cart-item-remove" data-action="rem" data-index="${index}" aria-label="Remove item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });

    if (cartTotalEl) cartTotalEl.textContent = `$${subtotal.toFixed(2)}`;
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;
    if (cartTaxEl) cartTaxEl.textContent = `$${tax.toFixed(2)}`;
    if (cartGrandEl) cartGrandEl.textContent = `$${total.toFixed(2)}`;

    if (cartWaBtn) {
      cartWaBtn.style.opacity = '1';
      cartWaBtn.style.pointerEvents = 'auto';
    }
    syncProductButtons();
  }

  cartWaBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty! Please add items before checking out.');
      return;
    }
    const custName = $('#cart-cust-name')?.value.trim() || '';
    const custPhone = $('#cart-cust-phone')?.value.trim() || '';
    const orderType = $('#cart-order-type')?.value || 'Store Pickup (Free)';
    const custAddr = $('#cart-cust-addr')?.value.trim() || 'None';

    if (!custName || !custPhone) {
      alert('Please enter your Full Name and Phone / WhatsApp number to complete your order.');
      $('#cart-cust-name')?.focus();
      return;
    }

    let subtotal = 0;
    cart.forEach(item => subtotal += (item.price * item.qty));
    let tax = subtotal * 0.0825;
    let total = subtotal + tax;

    let orderLines = cart.map(i => `• ${i.qty}x ${i.name} — $${(i.price * i.qty).toFixed(2)}`).join('\n');
    let waMsg = `*NEW ORDER — El Barrilito Liquor Store* 🥃\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Customer:* ${custName}\n📞 *Phone:* ${custPhone}\n📍 *Order Type:* ${orderType}\n📌 *Address/Note:* ${custAddr}\n━━━━━━━━━━━━━━━━━━━━━━\n*ORDER ITEMS:*\n${orderLines}\n━━━━━━━━━━━━━━━━━━━━━━\n*Subtotal:* $${subtotal.toFixed(2)}\n*TX Tax (8.25%):* $${tax.toFixed(2)}\n*TOTAL BILLING:* $${total.toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\nHello! Please confirm my order availability and pickup/delivery time. Thank you!`;

    const waUrl = `https://wa.me/18327367123?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank', 'noopener');
  });

  cartItemsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const index = parseInt(btn.dataset.index, 10);
    if (isNaN(index) || !cart[index]) return;

    if (action === 'inc') {
      cart[index].qty++;
    } else if (action === 'dec') {
      cart[index].qty--;
      if (cart[index].qty <= 0) cart.splice(index, 1);
    } else if (action === 'rem') {
      cart.splice(index, 1);
    }
    saveCart();
  });

  let timer;
  document.addEventListener('click', (e) => {
    const actionSpan = e.target.closest('.btn-qty-action');
    if (actionSpan) {
      e.preventDefault();
      e.stopPropagation();
      const action = actionSpan.dataset.btnAction;
      const name = actionSpan.dataset.product;
      const itemIndex = cart.findIndex(i => i.name === name);
      if (itemIndex > -1) {
        if (action === 'inc') {
          cart[itemIndex].qty++;
          saveCart();
          openDrawer();
        } else if (action === 'dec') {
          cart[itemIndex].qty--;
          if (cart[itemIndex].qty <= 0) cart.splice(itemIndex, 1);
          saveCart();
        }
      }
      return;
    }

    const btn = e.target.closest('.prod-cart-btn');
    if (btn && !btn.classList.contains('in-cart')) {
      e.preventDefault();
      const name = btn.dataset.product || 'Item';
      const price = parseFloat(btn.dataset.price) || 0;

      const existing = cart.find(i => i.name === name);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      saveCart();
      openDrawer();

      clearTimeout(timer);
      if (toastMsg) toastMsg.textContent = `"${name}" added to cart`;
      if (toast) {
        toast.classList.add('visible');
        timer = setTimeout(() => toast.classList.remove('visible'), 2800);
      }
      return;
    }

    // Clicking a product (outside its ADD button / qty controls / WA icon)
    // opens the full product detail page instead of jumping straight to
    // WhatsApp — the shopper can read the description, adjust qty, and add
    // it to the same cart the WhatsApp checkout below already sends.
    const card = e.target.closest('.product-card');
    if (card && !e.target.closest('.prod-wa-btn') && !e.target.closest('.prod-cart-btn')) {
      openProductDetail(card);
    }
  });

  /* ── Product Detail Page ── */
  const pdpOverlay = $('#pdp-overlay');
  const pdpPage = $('#pdp-page');
  const pdpClose = $('#pdp-close');
  const pdpImg = $('#pdp-img');
  const pdpBadge = $('#pdp-badge');
  const pdpName = $('#pdp-name');
  const pdpSize = $('#pdp-size');
  const pdpRating = $('#pdp-rating');
  const pdpPriceNow = $('#pdp-price-now');
  const pdpPriceOld = $('#pdp-price-old');
  const pdpOff = $('#pdp-off');
  const pdpDesc = $('#pdp-desc');
  const pdpCartBtn = $('#pdp-cart-btn');
  const pdpWaLink = $('#pdp-wa-link');

  function openProductDetail(card) {
    const cartBtnOnCard = card.querySelector('.prod-cart-btn');
    const waLinkOnCard = card.querySelector('.prod-wa-btn');
    const img = card.querySelector('.prod-img-box img, .prod-img-wrap img');
    const badge = card.querySelector('.prod-badge');
    const priceNow = card.querySelector('.prod-price-now');
    const priceOld = card.querySelector('.prod-price-old');
    const off = card.querySelector('.prod-off');

    if (img && pdpImg) { pdpImg.src = img.src; pdpImg.alt = img.alt; }
    if (pdpBadge) pdpBadge.classList.toggle('show', !!badge);
    if (pdpName) pdpName.textContent = card.querySelector('.prod-name')?.textContent || '';
    if (pdpSize) pdpSize.textContent = card.querySelector('.prod-size')?.textContent || '';
    if (pdpRating) pdpRating.innerHTML = card.querySelector('.prod-rating')?.innerHTML || '';
    if (pdpPriceNow) pdpPriceNow.textContent = priceNow?.textContent || '';
    if (pdpPriceOld) { pdpPriceOld.textContent = priceOld?.textContent || ''; pdpPriceOld.style.display = priceOld ? '' : 'none'; }
    if (pdpOff) { pdpOff.textContent = off?.textContent || ''; pdpOff.style.display = off ? '' : 'none'; }
    if (pdpDesc) pdpDesc.textContent = card.dataset.desc || '';
    if (pdpWaLink && waLinkOnCard) pdpWaLink.href = waLinkOnCard.href;
    if (pdpCartBtn && cartBtnOnCard) {
      pdpCartBtn.dataset.product = cartBtnOnCard.dataset.product;
      pdpCartBtn.dataset.price = cartBtnOnCard.dataset.price;
    }
    syncProductButtons();

    pdpOverlay?.classList.add('open');
    pdpPage?.classList.add('open');
    document.body.classList.add('pdp-open');
  }

  function closeProductDetail() {
    pdpOverlay?.classList.remove('open');
    pdpPage?.classList.remove('open');
    document.body.classList.remove('pdp-open');
  }

  pdpClose?.addEventListener('click', closeProductDetail);
  pdpOverlay?.addEventListener('click', closeProductDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdpPage?.classList.contains('open')) {
      closeProductDetail();
    }
  });

  renderCart();
}

/* ─── 6B. AI CHATBOT WITH WHATSAPP FALLBACK ─────────────────── */
function initChatbot() {
  const fab = $('#chatbot-fab');
  const win = $('#chatbot-window');
  const closeBtn = $('#chatbot-close');
  const messagesEl = $('#chatbot-messages');
  const form = $('#chatbot-form');
  const input = $('#chatbot-input');
  const suggestionsContainer = $('#chatbot-suggestions');

  if (!fab || !win) return;

  let isFirstOpen = true;

  function openChat() {
    win.classList.add('open');
    if (isFirstOpen && messagesEl && messagesEl.children.length === 0) {
      addBotMessage("¡Hola! Welcome to El Barrilito Liquor Store in Pasadena, TX. 🥃 How can I help you today? Ask me about our hours, location, tequila & mezcal collection, or ordering!");
      isFirstOpen = false;
    }
    input?.focus();
  }

  function closeChat() {
    win.classList.remove('open');
  }

  fab.addEventListener('click', openChat);
  closeBtn?.addEventListener('click', closeChat);

  function addBotMessage(text, waFallbackQuestion = null) {
    if (!messagesEl) return;
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = text;
    if (waFallbackQuestion) {
      const waUrl = `https://wa.me/18327367123?text=${encodeURIComponent("Hi! I have a question: " + waFallbackQuestion)}`;
      const btn = document.createElement('a');
      btn.href = waUrl;
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.className = 'chat-wa-fallback-btn';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Chat on WhatsApp (+1 (832) 736-7123)
      `;
      div.appendChild(document.createElement('br'));
      div.appendChild(btn);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    if (!messagesEl) return;
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function answerQuestion(q) {
    const query = q.toLowerCase().trim();

    // Hours & Schedule
    if (query.match(/(hour|open|close|when|schedule|time|sunday|saturday|monday|tuesday)/)) {
      return addBotMessage("We are open <strong>Monday through Saturday from 10:00 AM to 9:00 PM</strong>. We are closed on Sundays. ¡Te esperamos!");
    }
    // Location & Address
    if (query.match(/(where|location|located|address|find|shaver|pasadena|houston|direction|map)/)) {
      return addBotMessage("We are conveniently located at <strong>3370 Shaver St, Pasadena, TX 77504</strong>, near Houston in Harris County. Come visit us!");
    }
    // Tequila & Mezcal
    if (query.match(/(tequila|mezcal|anejo|añejo|reposado|blanco|cristalino|jalisco|oaxaca|agave)/)) {
      return addBotMessage("We carry over 500 varieties of authentic Mexican tequila and mezcal! Featured items include <strong>Tequila Añejo ($45.99)</strong>, <strong>Mezcal Artesanal ($44.99 sale)</strong>, and <strong>Tequila Reposado ($32.99 sale)</strong>.");
    }
    // Beer & Cerveza
    if (query.match(/(beer|cerveza|craft|import|corona|modelo|pacifico|chela|ipa)/)) {
      return addBotMessage("We stock imported Mexican cerveza, local Texas craft beers, and domestic favorites! Try our 6-pack <strong>Craft Beer Pack for $18.99</strong>.");
    }
    // Whiskey & Bourbon
    if (query.match(/(whiskey|whisky|bourbon|scotch|rye|kentucky|jack|maker)/)) {
      return addBotMessage("We offer smooth bourbons and fine whiskeys, including <strong>Kentucky Bourbon ($38.99)</strong> and rare small-batch releases.");
    }
    // Wine & Vino
    if (query.match(/(wine|vino|red|white|rose|rosado|champagne|sparkling)/)) {
      return addBotMessage("We have a curated collection of select red, white, and sparkling wines from top bodegas and vineyards!");
    }
    // Spanish / Bilingual
    if (query.match(/(spanish|español|espanol|habla|idioma|bilingue|bilingual|mexico|latino)/)) {
      return addBotMessage("¡Sí! Nuestro equipo es 100% bilingüe en inglés y español. Estamos para ayudarle con la mejor actitud.");
    }
    // Phone / Contact / Email
    if (query.match(/(phone|call|contact|email|number|telephone|reach|speak)/)) {
      return addBotMessage("You can call us at <strong>+1 (713) 360-6526</strong>, email <strong>info@elbarrilito.com</strong>, or send us a WhatsApp message at <strong>+1 (832) 736-7123</strong>!");
    }
    // Order / Cart / Delivery / WhatsApp
    if (query.match(/(order|buy|purchase|price|cost|delivery|deliver|shipping|pickup|cart|checkout|whatsapp)/)) {
      return addBotMessage("You can order directly via WhatsApp! Add items to your cart on this page and click <strong>Complete Order on WhatsApp</strong>, or chat with us at <strong>+1 (832) 736-7123</strong>.");
    }
    // Store / About
    if (query.match(/(who|what|about|store|barrilito|name|why)/)) {
      return addBotMessage("El Barrilito Liquor Store is Pasadena's trusted neighborhood liquor store, offering over 1000 premium brands and 5-star bilingual service!");
    }

    // Fallback: Redirect to WhatsApp
    addBotMessage(
      "I don't have an exact answer for that question in my automated knowledge base — but our bilingual staff would love to answer you directly on WhatsApp!",
      q
    );
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input?.value.trim();
    if (!text) return;
    addUserMessage(text);
    if (input) input.value = '';
    setTimeout(() => {
      answerQuestion(text);
    }, 450);
  });

  suggestionsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.chatbot-sugg');
    if (!btn) return;
    const q = btn.dataset.q;
    if (!q) return;
    addUserMessage(q);
    setTimeout(() => {
      answerQuestion(q);
    }, 400);
  });
}

/* ─── 7. NEWSLETTER FORM ────────────────────────────────────── */
function initNewsletterForm() {
  const form = $('#newsletter-form');
  const btn = $('#nl-submit');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    btn.textContent = 'SUBSCRIBED';
    btn.style.background = 'var(--green-mid)';
    setTimeout(() => {
      btn.textContent = 'SUBSCRIBE';
      btn.style.background = '';
      $('#email-input').value = '';
    }, 3500);
  });
}

/* ─── 7b. ENQUIRY NOW WHATSAPP BOX ──────────────────────────── */
function initEnquiryForm() {
  const form = $('#enquiry-form');
  const btn = $('#enq-submit-btn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#enq-name')?.value.trim() || '';
    const phone = $('#enq-phone')?.value.trim() || '';
    const type = $('#enq-type')?.value || 'General Question';
    const msg = $('#enq-msg')?.value.trim() || '';

    if (!name || !phone || !msg) {
      alert('Please fill in your Name, Phone Number, and Enquiry Message.');
      return;
    }

    const waText = `*NEW ENQUIRY — El Barrilito Liquor Store* 💬\n━━━━━━━━━━━━━━━━━━━━━━\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📌 *Enquiry Type:* ${type}\n📝 *Message:* ${msg}\n━━━━━━━━━━━━━━━━━━━━━━\nHello! I submitted this enquiry on your website. Please reply at your earliest convenience!`;
    const waUrl = `https://wa.me/18327367123?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank', 'noopener');

    if (btn) {
      const orig = btn.innerHTML;
      btn.textContent = '✓ SENT TO WHATSAPP';
      btn.style.background = '#1EBE5D';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        form.reset();
      }, 3500);
    }
  });
}

/* ─── 8. SMOOTH SCROLL ──────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
}

/* ─── 10. ACTIVE NAV ────────────────────────────────────────── */
function initActiveNav() {
  const sections = $$('section[id]');
  const links = $$('.nav-link');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
}

/* ─── 11. MARQUEE PAUSES on hover ──────────────────────────── */
function initMarquee() {
  const track = $('#marquee-track');
  if (!track) return;
  const strip = track.closest('.marquee-strip');
  strip?.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  strip?.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

/* ─── 12. HERO SUBTLE PARALLAX ──────────────────────────────── */
function initHeroParallax() {
  if (window.gsap && window.ScrollTrigger) return;
  const heroImg = $('#hero-img');
  window.addEventListener('scroll', () => {
    if (!heroImg) return;
    const y = window.scrollY;
    heroImg.style.transform = `translateY(${y * 0.15}px)`;
  }, { passive: true });
}

/* ─── 13. COUNT-UP ANIMATION ────────────────────────────────── */
function initCountUp() {
  const nums = $$('.stats-num, .big-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const raw = el.textContent.replace(/[^0-9]/g, '');
      const target = parseInt(raw, 10);
      if (!target) return;
      const suffix = el.textContent.replace(/[0-9]/g, '').trim();
      let start = 0;
      const duration = 1400;
      const step = timestamp => {
        if (!start) start = timestamp;
        const p = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(p * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
}

/* ─── 14. HERO WHATSAPP ONLY VISIBILITY ─────────────────────── */
function initHeroWhatsAppOnly() {
  const waFloat = $('#whatsapp-float');
  if (!waFloat) return;
  const updateWaVisibility = () => {
    if (window.scrollY < 650) {
      waFloat.style.opacity = '1';
      waFloat.style.pointerEvents = 'auto';
      waFloat.style.transform = 'scale(1)';
    } else {
      waFloat.style.opacity = '0';
      waFloat.style.pointerEvents = 'none';
      waFloat.style.transform = 'scale(0.6)';
    }
  };
  window.addEventListener('scroll', updateWaVisibility, { passive: true });
  updateWaVisibility();
}
