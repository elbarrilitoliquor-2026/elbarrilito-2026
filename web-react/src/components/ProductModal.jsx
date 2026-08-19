import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl, FALLBACK_PRODUCT_IMAGE } from '../lib/constants';
import { computeOffPct, formatRatingCount } from './ProductCard';
import WhatsAppIcon from './WhatsAppIcon';

/* Ports the PDP (#pdp-overlay/#pdp-page) open/close + content-copy logic
   from script.js `openProductDetail()` / `closeProductDetail()`. */
export default function ProductModal({ product, onClose }) {
  const { addItem, incByName, decByName, getQtyByName } = useCart();
  const { settings } = useStoreSettings();

  useEffect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeydown);
    document.body.classList.toggle('pdp-open', !!product);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.body.classList.remove('pdp-open');
    };
  }, [product, onClose]);

  if (!product) {
    return (
      <>
        <div className="pdp-overlay" id="pdp-overlay" />
        <div className="pdp-page" id="pdp-page" role="dialog" aria-modal="true" aria-label="Product details" />
      </>
    );
  }

  const price = Number(product.price);
  const oldPrice = product.old_price != null ? Number(product.old_price) : null;
  const offPct = computeOffPct(price, oldPrice);
  const image = product.image_url || FALLBACK_PRODUCT_IMAGE;
  const qty = getQtyByName(product.name);
  const inCart = qty > 0;
  
  let waText = settings.msg_tpl_enquiry || 'Hello, I am interested in {ProductName}. Can you provide more details?';
  waText = waText.replace(/{ProductName}/g, product.name);
  
  const waHref = buildWaUrl(waText, settings.whatsapp_number);

  function handleWaClick() {
    trackWhatsAppClick({ source: 'product', productName: product.name, message: waText });
  }

  return (
    <>
      <div className="pdp-overlay open" id="pdp-overlay" onClick={onClose} />
      <div className="pdp-page open" id="pdp-page" role="dialog" aria-modal="true" aria-label="Product details">
        <button className="pdp-close" id="pdp-close" aria-label="Close product details" onClick={onClose}>✕</button>
        <div className="pdp-body">
          <div className="pdp-media">
            {product.badge && <span className="pdp-badge show" id="pdp-badge">{product.badge}</span>}
            <img id="pdp-img" src={image} alt={product.name} />
          </div>
          <div className="pdp-info">
            <div className="pdp-price-row">
              <span className="pdp-price-now" id="pdp-price-now">${price.toFixed(2)}</span>
              {oldPrice != null && <span className="pdp-price-old" id="pdp-price-old">${oldPrice.toFixed(2)}</span>}
            </div>
            {offPct != null && <span className="pdp-off" id="pdp-off">{offPct}% OFF</span>}
            <div className="prod-divider"></div>
            <h2 className="pdp-name" id="pdp-name">{product.name}</h2>
            <p className="pdp-size" id="pdp-size">{product.size || ''}</p>
            <div className="pdp-rating" id="pdp-rating">
              <span className="rating-star">★</span> {Number(product.rating || 0).toFixed(1)} ({formatRatingCount(product.rating_count)})
            </div>
            <p className="pdp-desc" id="pdp-desc">{product.description || ''}</p>
            <div className="pdp-actions">
              {inCart ? (
                <button className="prod-cart-btn pdp-cart-btn in-cart" id="pdp-cart-btn">
                  <span className="btn-qty-action" data-btn-action="dec" onClick={() => decByName(product.name)}>−</span>
                  <span className="btn-qty-count">{qty}</span>
                  <span className="btn-qty-action" data-btn-action="inc" onClick={() => incByName(product.name)}>+</span>
                </button>
              ) : (
                <button className="prod-cart-btn pdp-cart-btn" id="pdp-cart-btn" onClick={() => addItem(product.name, price)}>
                  ADD TO CART
                </button>
              )}
              <a href={waHref} id="pdp-wa-link" className="pdp-wa-link" target="_blank" rel="noopener" onClick={handleWaClick}>
                <WhatsAppIcon />
                Ask on WhatsApp
              </a>
            </div>
            <p className="pdp-cart-note">Added items go straight into your cart — review qty and checkout any time from the cart icon above.</p>
          </div>
        </div>
      </div>
    </>
  );
}
