import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { useStoreSettings } from '../hooks/useStoreSettings';
import WhatsAppIcon from './WhatsAppIcon';

/* Ports script.js `initCartDrawer()`'s WhatsApp checkout message builder
   and billing form validation exactly (name/phone required, tax 8.25%,
   same message template/emoji/line separators). */
export default function CartDrawer() {
  const { cart, isOpen, closeDrawer, incByIndex, decByIndex, removeByIndex, subtotal, tax, total } = useCart();
  const { settings } = useStoreSettings();
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [orderType, setOrderType] = useState('Store Pickup (Free)');
  const [custAddr, setCustAddr] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape' && isOpen) closeDrawer();
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [isOpen, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty! Please add items before checking out.');
      return;
    }
    const name = custName.trim();
    const phone = custPhone.trim();
    const addr = custAddr.trim() || 'None';

    if (!name || !phone) {
      alert('Please enter your Full Name and Phone / WhatsApp number to complete your order.');
      nameInputRef.current?.focus();
      return;
    }

    const orderLines = cart.map((i) => `• ${i.qty}x ${i.name} — $${(i.price * i.qty).toFixed(2)}`).join('\n');
    let waMsg = settings.msg_tpl_order || '';
    waMsg = waMsg.replace(/{CustomerName}/g, name)
                 .replace(/{CustomerPhone}/g, phone)
                 .replace(/{OrderType}/g, orderType)
                 .replace(/{Address}/g, addr)
                 .replace(/{OrderLines}/g, orderLines)
                 .replace(/{Subtotal}/g, subtotal.toFixed(2))
                 .replace(/{Tax}/g, tax.toFixed(2))
                 .replace(/{TotalBilling}/g, total.toFixed(2));

    const phoneNum = settings.whatsapp_number || '18327367123';
    const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank', 'noopener');

    trackWhatsAppClick({
      source: 'cart_checkout',
      productName: cart.map((i) => `${i.qty}x ${i.name}`).join(', '),
      customerName: name,
      customerPhone: phone,
      message: waMsg,
    });
  }

  const hasItems = cart.length > 0;

  return (
    <>
      <div className={`cart-overlay${isOpen ? ' open' : ''}`} id="cart-overlay" onClick={closeDrawer} />
      <aside className={`cart-drawer${isOpen ? ' open' : ''}`} id="cart-drawer" aria-label="Shopping Cart">
        <div className="cart-drawer-header">
          <h3>Your Cart</h3>
          <button className="cart-drawer-close" id="cart-drawer-close" aria-label="Close cart" onClick={closeDrawer}>✕</button>
        </div>
        <div className="cart-drawer-items" id="cart-drawer-items">
          {!hasItems && (
            <div className="cart-empty" id="cart-empty">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#A80000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M1 2h4l2.68 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H6" /></svg>
              <p>Your cart is empty</p>
              <span>Browse our collection and add spirits you love!</span>
            </div>
          )}
          {cart.map((item, index) => (
            <div className="cart-item" key={item.name}>
              <div className="cart-item-info">
                <div className="cart-item-title">{item.name}</div>
                <div className="cart-item-price">${item.price.toFixed(2)}</div>
              </div>
              <div className="cart-item-controls">
                <button className="cart-qty-btn" data-action="dec" onClick={() => decByIndex(index)}>-</button>
                <span className="cart-item-qty">{item.qty}</span>
                <button className="cart-qty-btn" data-action="inc" onClick={() => incByIndex(index)}>+</button>
                <button className="cart-item-remove" data-action="rem" aria-label="Remove item" onClick={() => removeByIndex(index)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-drawer-footer" id="cart-drawer-footer">
          <div className="cart-billing-box">
            <h4 className="billing-title">Billing &amp; Delivery Details</h4>
            <div className="billing-row">
              <input ref={nameInputRef} type="text" id="cart-cust-name" className="billing-input" placeholder="Full Name *" required value={custName} onChange={(e) => setCustName(e.target.value)} />
              <input type="tel" id="cart-cust-phone" className="billing-input" placeholder="Phone / WhatsApp *" required value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
            </div>
            <div className="billing-row">
              <select id="cart-order-type" className="billing-select" value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                <option value="Store Pickup (Free)">Store Pickup (Free)</option>
                <option value="Local Delivery (Pasadena Area)">Local Delivery (Pasadena Area)</option>
              </select>
            </div>
            <input type="text" id="cart-cust-addr" className="billing-input" placeholder="Delivery Address or Pickup Note (Optional)" value={custAddr} onChange={(e) => setCustAddr(e.target.value)} />
          </div>

          <div className="cart-summary-box">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <span className="cart-total-price" id="cart-total-price">${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-total-row cart-tax-row">
              <span>Estimated TX Tax (8.25%)</span>
              <span id="cart-tax-price">${tax.toFixed(2)}</span>
            </div>
            <div className="cart-total-row cart-grand-total">
              <span>Total Billing</span>
              <span id="cart-total-billing">${total.toFixed(2)}</span>
            </div>
          </div>

          <a
            href="#"
            className="cart-wa-order-btn"
            id="cart-wa-order-btn"
            target="_blank"
            rel="noopener"
            style={{ opacity: hasItems ? 1 : 0.5, pointerEvents: hasItems ? 'auto' : 'none' }}
            onClick={handleCheckout}
          >
            <WhatsAppIcon width={20} height={20} fill="#fff" />
            PLACE ORDER ON WHATSAPP
          </a>
          <p className="cart-wa-note">Your billing &amp; order items will be sent to WhatsApp ({settings.whatsapp_display || ''}) for instant checkout.</p>
        </div>
      </aside>
    </>
  );
}
