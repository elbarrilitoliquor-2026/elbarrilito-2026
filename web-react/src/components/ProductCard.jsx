import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl, FALLBACK_PRODUCT_IMAGE } from '../lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

export function formatRatingCount(count) {
  if (count == null) return '';
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}

export function computeOffPct(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

/** Style ref used by ProductSlider for width/translate — kept as inline
    styles on the card, mirroring the original script.js `update()` which
    sets flexShrink/width/marginRight directly on each `.product-card`. */
export default function ProductCard({ product, style, onOpenDetail }) {
  const { addItem, incByName, decByName, getQtyByName } = useCart();
  const { settings } = useStoreSettings();
  const price = Number(product.price);
  const oldPrice = product.old_price != null ? Number(product.old_price) : null;
  const offPct = computeOffPct(price, oldPrice);
  const qty = getQtyByName(product.name);
  const inCart = qty > 0;
  const image = product.image_url || FALLBACK_PRODUCT_IMAGE;
  
  let waText = settings.msg_tpl_enquiry || 'Hello, I am interested in {ProductName}. Can you provide more details?';
  waText = waText.replace(/{ProductName}/g, product.name);
  
  const waHref = buildWaUrl(waText, settings.whatsapp_number);

  function handleAddClick(e) {
    e.stopPropagation();
    addItem(product.name, price);
  }
  function handleInc(e) {
    e.stopPropagation();
    e.preventDefault();
    incByName(product.name);
  }
  function handleDec(e) {
    e.stopPropagation();
    e.preventDefault();
    decByName(product.name);
  }
  function handleWaClick() {
    trackWhatsAppClick({ source: 'product', productName: product.name, message: waText });
  }
  function handleCardClick(e) {
    if (e.target.closest('.prod-wa-btn') || e.target.closest('.prod-cart-btn')) return;
    onOpenDetail(product);
  }

  return (
    <div className="product-card" id={`prod-${product.id}`} data-desc={product.description || ''} style={style} onClick={handleCardClick}>
      <div className="prod-img-wrap">
        {product.badge && <span className="prod-badge">{product.badge}</span>}
        <div className="prod-img-box">
          <img src={image} alt={product.name} loading="lazy" decoding="async" />
        </div>
        {inCart ? (
          <button className="prod-cart-btn in-cart" id={`pc-${product.id}`} data-product={product.name} data-price={price}>
            <span className="btn-qty-action" data-btn-action="dec" onClick={handleDec}>−</span>
            <span className="btn-qty-count">{qty}</span>
            <span className="btn-qty-action" data-btn-action="inc" onClick={handleInc}>+</span>
          </button>
        ) : (
          <button className="prod-cart-btn" id={`pc-${product.id}`} data-product={product.name} data-price={price} onClick={handleAddClick}>
            ADD
          </button>
        )}
      </div>
      <div className="prod-info">
        <div className="prod-price-row">
          <span className="prod-price-now">${price.toFixed(2)}</span>
          {oldPrice != null && <span className="prod-price-old">${oldPrice.toFixed(2)}</span>}
        </div>
        {offPct != null && <span className="prod-off">{offPct}% OFF</span>}
        <div className="prod-divider"></div>
        <h3 className="prod-name">{product.name}</h3>
        <p className="prod-size">{product.size || ''}</p>
        <div className="prod-bottom">
          <div className="prod-rating"><span className="rating-star">★</span> {Number(product.rating || 0).toFixed(1)} ({formatRatingCount(product.rating_count)})</div>
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className="prod-wa-btn"
            aria-label={`Ask about ${product.name} on WhatsApp`}
            title="Ask on WhatsApp"
            onClick={handleWaClick}
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
