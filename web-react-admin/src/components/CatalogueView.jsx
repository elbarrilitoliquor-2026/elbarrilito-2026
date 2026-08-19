import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import ProductModal from './ProductModal';

/* Ports loadProducts()/initProductModal() from admin/admin.js. */

export default function CatalogueView({ onDataChanged }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = add, object = edit

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setError(error.message);
      setProducts(null);
      return;
    }
    setError(null);
    setProducts(data || []);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleToggleActive(id, checked) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: checked } : p)));
    await supabaseClient.from('products').update({ is_active: checked }).eq('id', id);
  }

  function closeModal() {
    setModalProduct(undefined);
  }

  function handleSaved() {
    closeModal();
    loadProducts();
    onDataChanged?.();
  }

  return (
    <section id="view-catalogue" className="admin-view">
      <header className="view-header">
        <h1>Catalogue</h1>
        <p>Products shown in the client-facing shop</p>
        <button className="btn-primary" onClick={() => setModalProduct(null)}>+ Add Product</button>
      </header>

      <div className="table-wrap">
        <table className="admin-table" id="products-table">
          <thead>
            <tr>
              <th></th><th>Name</th><th>Category</th><th>Price</th><th>Old Price</th>
              <th>Rating</th><th>Stock</th><th>Active</th><th>Order</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr><td colSpan={10} className="empty-note">Error loading products: {error}</td></tr>
            ) : products === null ? null : products.length === 0 ? (
              <tr><td colSpan={10} className="empty-note">No products yet. Click "Add Product" to create one.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} data-id={p.id}>
                  <td><img className="prod-thumb" src={p.image_url || '/assets/images/wine_product.png'} alt="" /></td>
                  <td>{p.name}</td>
                  <td>{p.category || ''}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.old_price ? '$' + Number(p.old_price).toFixed(2) : '—'}</td>
                  <td>{Number(p.rating).toFixed(1)} ({p.rating_count})</td>
                  <td>
                    <span style={{ color: p.stock_quantity <= p.low_stock_threshold ? '#a00000' : 'inherit', fontWeight: p.stock_quantity <= p.low_stock_threshold ? 'bold' : 'normal' }}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        className="active-toggle"
                        checked={!!p.is_active}
                        onChange={(e) => handleToggleActive(p.id, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>{p.sort_order}</td>
                  <td><button className="btn-sm" onClick={() => setModalProduct(p)}>Edit</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalProduct !== undefined && (
        <ProductModal product={modalProduct} onClose={closeModal} onSaved={handleSaved} />
      )}
    </section>
  );
}
