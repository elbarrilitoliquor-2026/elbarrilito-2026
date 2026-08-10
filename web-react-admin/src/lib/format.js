/* ============================================================
   Shared formatting helpers (ported from admin/admin.js).
   Note: the original escapeHtml() existed because admin.js built
   raw innerHTML strings. React/JSX escapes text content by default,
   so there is no equivalent needed here — values are rendered as
   plain JSX text.
   ============================================================ */

export function truncate(str, len) {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const SOURCE_LABELS = {
  product: 'Product Ask',
  cart_checkout: 'Cart Checkout',
  enquiry_form: 'Enquiry Form',
  contact_form: 'Contact Form',
  floating_button: 'Floating Button',
  chatbot: 'Chatbot',
};

export function sourceLabel(s) {
  return SOURCE_LABELS[s] || s;
}
