import { useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import ImageUploader from './ImageUploader';

/* Ports openProductModal()/product-form submit/delete handlers from
   admin/admin.js exactly, including field defaults and coercions. */

function fieldsFromProduct(product) {
  return {
    id: product?.id || '',
    name: product?.name || '',
    category: product?.category || '',
    size: product?.size || '1 bottle (750 ml)',
    price: product?.price ?? '',
    old_price: product?.old_price ?? '',
    image_url: product?.image_url || '',
    badge: product?.badge || '',
    sort_order: product?.sort_order ?? 0,
    rating: product?.rating ?? 4.8,
    rating_count: product?.rating_count ?? 0,
    description: product?.description || '',
    is_active: product ? product.is_active : true,
    stock_quantity: product?.stock_quantity ?? 0,
    low_stock_threshold: product?.low_stock_threshold ?? 5,
  };
}

export default function ProductModal({ product, onClose, onSaved }) {
  const [fields, setFields] = useState(() => fieldsFromProduct(product));
  const [status, setStatus] = useState({ text: '', type: '' });

  useEffect(() => {
    setFields(fieldsFromProduct(product));
    setStatus({ text: '', type: '' });
  }, [product]);

  const isEdit = !!product;

  function update(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: fields.name.trim(),
      category: fields.category.trim() || 'Spirits',
      size: fields.size.trim() || '1 bottle (750 ml)',
      price: parseFloat(fields.price),
      old_price: fields.old_price !== '' ? parseFloat(fields.old_price) : null,
      image_url: fields.image_url.trim() || null,
      badge: fields.badge.trim() || null,
      sort_order: parseInt(fields.sort_order, 10) || 0,
      rating: parseFloat(fields.rating) || 4.8,
      rating_count: parseInt(fields.rating_count, 10) || 0,
      description: fields.description.trim(),
      is_active: fields.is_active,
      stock_quantity: parseInt(fields.stock_quantity, 10) || 0,
      low_stock_threshold: parseInt(fields.low_stock_threshold, 10) || 0,
    };

    setStatus({ text: 'Saving…', type: '' });

    const { error } = fields.id
      ? await supabaseClient.from('products').update(payload).eq('id', fields.id)
      : await supabaseClient.from('products').insert(payload);

    if (error) {
      setStatus({ text: 'Error: ' + error.message, type: 'error' });
      return;
    }

    onSaved();
  }

  async function handleDelete() {
    if (!fields.id) return;
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const { error } = await supabaseClient.from('products').delete().eq('id', fields.id);
    if (error) {
      setStatus({ text: 'Error: ' + error.message, type: 'error' });
      return;
    }
    onSaved();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div id="product-modal" className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Name *</label>
          <input
            type="text"
            className="modal-input"
            required
            value={fields.name}
            onChange={(e) => update('name', e.target.value)}
          />

          <div className="modal-row">
            <div>
              <label className="field-label">Category</label>
              <input
                type="text"
                className="modal-input"
                placeholder="Tequila, Mezcal, Whiskey…"
                value={fields.category}
                onChange={(e) => update('category', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Size</label>
              <input
                type="text"
                className="modal-input"
                placeholder="1 bottle (750 ml)"
                value={fields.size}
                onChange={(e) => update('size', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label className="field-label">Price ($) *</label>
              <input
                type="number"
                className="modal-input"
                step="0.01"
                min="0"
                required
                value={fields.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Old Price ($)</label>
              <input
                type="number"
                className="modal-input"
                step="0.01"
                min="0"
                value={fields.old_price}
                onChange={(e) => update('old_price', e.target.value)}
              />
            </div>
          </div>

          <ImageUploader
            label="Product Image"
            value={fields.image_url || null}
            onChange={(url) => update('image_url', url || '')}
            bucket="product-images"
            folder="products"
          />

          <div className="modal-row">
            <div>
              <label className="field-label">Stock Quantity</label>
              <input
                type="number"
                className="modal-input"
                min="0"
                value={fields.stock_quantity}
                onChange={(e) => update('stock_quantity', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Low Stock Alert Threshold</label>
              <input
                type="number"
                className="modal-input"
                min="0"
                value={fields.low_stock_threshold}
                onChange={(e) => update('low_stock_threshold', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label className="field-label">Badge</label>
              <input
                type="text"
                className="modal-input"
                placeholder="Bestseller (optional)"
                value={fields.badge}
                onChange={(e) => update('badge', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Sort Order</label>
              <input
                type="number"
                className="modal-input"
                value={fields.sort_order}
                onChange={(e) => update('sort_order', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label className="field-label">Rating (0–5)</label>
              <input
                type="number"
                className="modal-input"
                step="0.1"
                min="0"
                max="5"
                value={fields.rating}
                onChange={(e) => update('rating', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Rating Count</label>
              <input
                type="number"
                className="modal-input"
                min="0"
                value={fields.rating_count}
                onChange={(e) => update('rating_count', e.target.value)}
              />
            </div>
          </div>

          <label className="field-label">Description</label>
          <textarea
            className="modal-textarea"
            rows={4}
            value={fields.description}
            onChange={(e) => update('description', e.target.value)}
          />

          <label className="check-label">
            <input
              type="checkbox"
              checked={fields.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
            />
            Active (visible on client site)
          </label>

          <div className="modal-actions">
            {isEdit && (
              <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
            )}
            <button type="submit" className="btn-primary">Save Product</button>
          </div>
          <p className={`form-status${status.type ? ' ' + status.type : ''}`} aria-live="polite">{status.text}</p>
        </form>
      </div>
    </div>
  );
}
