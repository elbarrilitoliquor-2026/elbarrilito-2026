export const WHATSAPP_NUMBER = '18327367123';
export const WHATSAPP_DISPLAY = '+1 (832) 736-7123';
export const FALLBACK_PRODUCT_IMAGE = '/assets/images/wine_product.png';

export function buildWaUrl(text, phoneNum) {
  const number = phoneNum || WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
