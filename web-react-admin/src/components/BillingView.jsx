import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { formatDate } from '../lib/format';

export default function BillingView() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [saleType, setSaleType] = useState('offline');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('name');
    if (!error && data) {
      setProducts(data);
    }
  }

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, qty } : item
      )
    );
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  async function handleCheckout() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setStatus({ type: '', text: 'Recording sale...' });

    try {
      // 1. Insert into sales
      const { data: saleData, error: saleError } = await supabaseClient
        .from('sales')
        .insert({
          sale_type: saleType,
          total_amount: totalAmount,
          customer_name: customerName || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Insert into sale_items and update stock
      for (const item of cart) {
        // Insert sale item
        const { error: itemError } = await supabaseClient
          .from('sale_items')
          .insert({
            sale_id: saleData.id,
            product_id: item.product.id,
            quantity: item.qty,
            price_at_time: item.product.price,
          });

        if (itemError) throw itemError;

        // Decrement stock
        const newStock = Math.max(0, item.product.stock_quantity - item.qty);
        const { error: stockError } = await supabaseClient
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      setStatus({ type: 'success', text: 'Sale recorded successfully!' });
      setCart([]);
      setCustomerName('');
      fetchProducts(); // refresh stock
    } catch (err) {
      setStatus({ type: 'error', text: 'Checkout failed: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="view-billing" className="admin-view">
      <header className="view-header">
        <h1>Billing & Sales</h1>
        <p>Record a new sale and deduct from inventory</p>
      </header>

      <div className="billing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div className="billing-products">
          <h2>Products</h2>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {products.map((p) => (
              <div
                key={p.id}
                className="product-card clickable"
                style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => addToCart(p)}
              >
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>${p.price.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: p.stock_quantity <= p.low_stock_threshold ? '#a00000' : 'inherit' }}>
                  Stock: {p.stock_quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="billing-cart" style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h2>Current Sale</h2>
          {cart.length === 0 ? (
            <p style={{ margin: '1rem 0', color: '#666' }}>Cart is empty. Select products to begin.</p>
          ) : (
            <div style={{ margin: '1rem 0' }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>${item.product.price.toFixed(2)} x {item.qty}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="button" onClick={() => updateQty(item.product.id, item.qty - 1)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>-</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.product.id, item.qty + 1)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                  </div>
                </div>
              ))}
              <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <label className="field-label">Sale Type</label>
            <select
              className="modal-input"
              value={saleType}
              onChange={(e) => setSaleType(e.target.value)}
              style={{ marginBottom: '1rem' }}
            >
              <option value="offline">Offline / In-Store</option>
              <option value="online">Online / Delivery</option>
            </select>

            <label className="field-label">Customer Name (optional)</label>
            <input
              type="text"
              className="modal-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in"
              style={{ marginBottom: '1rem' }}
            />

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCheckout}
            >
              {isSubmitting ? 'Recording...' : 'Record Sale'}
            </button>
            {status.text && (
              <p className={`form-status ${status.type}`} style={{ marginTop: '1rem' }}>{status.text}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
