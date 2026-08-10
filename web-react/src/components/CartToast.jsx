import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';

/* Mirrors the "<name>" added to cart toast script.js shows for 2.8s
   whenever a product's ADD button is clicked. We infer the "just added"
   event by watching cart length increase (simplest, faithful analog
   without threading a new context event). */
export default function CartToast() {
  const { cart } = useCart();
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const prevLen = useRef(cart.length);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cart.length > prevLen.current) {
      const newest = cart[cart.length - 1];
      if (newest) {
        setMsg(`"${newest.name}" added to cart`);
        setVisible(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 2800);
      }
    }
    prevLen.current = cart.length;
    return () => clearTimeout(timerRef.current);
  }, [cart]);

  return (
    <div className={`cart-toast${visible ? ' visible' : ''}`} id="cart-toast">
      <span>✓</span>
      <span id="toast-msg">{msg || 'Added to cart'}</span>
    </div>
  );
}
