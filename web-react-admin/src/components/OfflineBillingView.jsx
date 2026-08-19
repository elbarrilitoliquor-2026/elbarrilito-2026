import { useState, useEffect, useRef } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export default function OfflineBillingView() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [lastSale, setLastSale] = useState(null);

  const printableRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data } = await supabaseClient.from('store_settings').select('*').eq('id', 'default').maybeSingle();
    if (data) setSettings(data);
  }

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
      const { data: saleData, error: saleError } = await supabaseClient
        .from('sales')
        .insert({
          sale_type: 'offline',
          total_amount: totalAmount,
          customer_name: customerName || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      for (const item of cart) {
        const { error: itemError } = await supabaseClient
          .from('sale_items')
          .insert({
            sale_id: saleData.id,
            product_id: item.product.id,
            quantity: item.qty,
            price_at_time: item.product.price,
          });

        if (itemError) throw itemError;

        const newStock = Math.max(0, item.product.stock_quantity - item.qty);
        const { error: stockError } = await supabaseClient
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      setStatus({ type: 'success', text: 'Sale recorded! You can now print or send the bill.' });
      setLastSale({
        cart: [...cart],
        totalAmount,
        customerName,
        customerPhone,
      });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      fetchProducts();
    } catch (err) {
      setStatus({ type: 'error', text: 'Checkout failed: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSendWhatsApp() {
    if (!lastSale || !settings) return;
    
    let tpl = settings.msg_tpl_offline_bill || '*INVOICE*\nCustomer: {CustomerName}\nPhone: {CustomerPhone}\nItems:\n{OrderLines}\nTotal Paid: ${TotalBilling}';
    
    const orderLines = lastSale.cart.map(i => `• ${i.qty}x ${i.product.name} — $${(i.product.price * i.qty).toFixed(2)}`).join('\n');
    
    tpl = tpl.replace(/{CustomerName}/g, lastSale.customerName || 'Walk-in');
    tpl = tpl.replace(/{CustomerPhone}/g, lastSale.customerPhone || 'N/A');
    tpl = tpl.replace(/{OrderLines}/g, orderLines);
    tpl = tpl.replace(/{TotalBilling}/g, lastSale.totalAmount.toFixed(2));
    
    // Determine the phone number to send to. If customer provided one, use it. Otherwise use store fallback or prompt.
    let phoneNum = lastSale.customerPhone.replace(/\D/g, '');
    if (!phoneNum && settings.whatsapp_number) {
      phoneNum = settings.whatsapp_number;
    }
    
    const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(tpl)}`;
    window.open(waUrl, '_blank', 'noopener');
  }

  function handlePrint() {
    if (!lastSale) return;
    
    const printWindow = window.open('', '_blank');
    const orderLines = lastSale.cart.map(i => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i.product.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${i.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(i.product.price * i.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Invoice - El Barrilito</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            @page { margin: 0; }
            body { 
              font-family: 'Inter', sans-serif; 
              color: #111; 
              background: #f7f7f7; 
              margin: 0; 
              padding: 40px; 
            }
            .invoice-container {
              max-width: 600px;
              margin: 0 auto;
              background: #fff;
              padding: 40px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              border-radius: 8px;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px dashed #eee;
              padding-bottom: 25px;
            }
            .logo {
              width: 60px;
              height: 60px;
              margin-bottom: 10px;
            }
            .store-name { 
              color: #A80000; 
              font-size: 24px; 
              font-weight: 700; 
              margin: 0 0 5px 0; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header-info { 
              color: #555; 
              font-size: 0.9em; 
              line-height: 1.5;
            }
            .invoice-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-size: 0.95em;
              color: #444;
            }
            .meta-block strong { color: #222; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
            }
            th { 
              background: #fdfdfd; 
              padding: 12px 10px; 
              text-align: left; 
              border-top: 1px solid #eee;
              border-bottom: 2px solid #ddd; 
              color: #444;
              font-weight: 600;
              font-size: 0.9em;
              text-transform: uppercase;
            }
            td {
              padding: 12px 10px;
              border-bottom: 1px solid #eee;
              font-size: 0.95em;
              color: #222;
            }
            .qty-col { text-align: center; width: 60px; }
            .price-col { text-align: right; width: 100px; font-weight: 600; }
            .total-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 40px;
            }
            .total-box {
              background: #fafafa;
              padding: 20px;
              border-radius: 6px;
              border: 1px solid #eee;
              width: 250px;
            }
            .total-row { 
              display: flex;
              justify-content: space-between;
              font-weight: 700; 
              font-size: 1.3em;
              color: #A80000;
            }
            .footer {
              text-align: center; 
              color: #888; 
              font-size: 0.9em;
              border-top: 2px dashed #eee;
              padding-top: 20px;
            }
            /* Print Specific Styles */
            @media print {
              body { background: #fff; padding: 0; }
              .invoice-container { box-shadow: none; border-radius: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <img class="logo" src="${window.location.origin}/assets/images/eb-barrel-logo.svg" alt="El Barrilito Logo" />
              <h1 class="store-name">El Barrilito Liquor Store</h1>
              <div class="header-info">
                ${settings?.address || '3370 Shaver St, Pasadena, TX 77504'}<br/>
                ${settings?.phone || '+1 (713) 360-6526'}
              </div>
            </div>
            
            <div class="invoice-meta">
              <div class="meta-block">
                <div><strong>Customer:</strong> ${lastSale.customerName || 'Walk-in'}</div>
                <div><strong>Phone:</strong> ${lastSale.customerPhone || 'N/A'}</div>
              </div>
              <div class="meta-block" style="text-align: right;">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th class="qty-col">Qty</th>
                  <th class="price-col">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${orderLines}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-box">
                <div class="total-row">
                  <span>Total Paid:</span>
                  <span>$${lastSale.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              Thank you for shopping with El Barrilito!<br/>
              Please retain this receipt for your records.
            </div>
          </div>
          <script>
            // Slight delay to allow font and logo to load before printing
            window.onload = function() { 
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <section id="view-billing" className="admin-view">
      <header className="view-header">
        <h1>Offline Billing</h1>
        <p>Record in-store sales and print/send receipts</p>
      </header>

      {lastSale ? (
        <div style={{ background: '#f5fff5', border: '1px solid #c3e6c3', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#2b782b', marginBottom: '1rem' }}>Sale Recorded Successfully!</h2>
          <p style={{ marginBottom: '2rem', color: '#555' }}>Total: <strong>${lastSale.totalAmount.toFixed(2)}</strong></p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={handlePrint} style={{ padding: '0.8rem 1.5rem', background: '#333' }}>
              🖨️ Print Bill
            </button>
            <button className="btn-primary" onClick={handleSendWhatsApp} style={{ padding: '0.8rem 1.5rem', background: '#25D366', color: '#fff' }}>
              💬 Send via WhatsApp
            </button>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={() => { setLastSale(null); setStatus({ type: '', text: '' }); }}>
              ← Start New Sale
            </button>
          </div>
        </div>
      ) : (
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
              <label className="field-label">Customer Name (optional)</label>
              <input
                type="text"
                className="modal-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in"
                style={{ marginBottom: '1rem' }}
              />
              
              <label className="field-label">Customer Phone / WhatsApp</label>
              <input
                type="tel"
                className="modal-input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +1 555-0199"
                style={{ marginBottom: '1rem' }}
              />

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
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
      )}
    </section>
  );
}
