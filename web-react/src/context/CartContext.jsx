/* ============================================================
   CartContext — replaces script.js's initCartDrawer() cart state.
   Persists to localStorage under the same key ('eb-cart') the
   original static site used, add/inc/dec/remove semantics identical.
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'eb-cart';
const TAX_RATE = 0.0825;

function loadInitialCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    /* ignore corrupt storage */
  }
  return [];
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { name, price } = action.payload;
      const idx = state.findIndex((i) => i.name === name);
      if (idx > -1) {
        const next = [...state];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...state, { name, price, qty: 1 }];
    }
    case 'INC': {
      const { name } = action.payload;
      return state.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i));
    }
    case 'DEC': {
      const { name } = action.payload;
      const idx = state.findIndex((i) => i.name === name);
      if (idx === -1) return state;
      const nextQty = state[idx].qty - 1;
      if (nextQty <= 0) return state.filter((_, i) => i !== idx);
      const next = [...state];
      next[idx] = { ...next[idx], qty: nextQty };
      return next;
    }
    case 'INC_INDEX': {
      const { index } = action.payload;
      return state.map((i, idx) => (idx === index ? { ...i, qty: i.qty + 1 } : i));
    }
    case 'DEC_INDEX': {
      const { index } = action.payload;
      if (!state[index]) return state;
      const nextQty = state[index].qty - 1;
      if (nextQty <= 0) return state.filter((_, i) => i !== index);
      return state.map((i, idx) => (idx === index ? { ...i, qty: nextQty } : i));
    }
    case 'REMOVE_INDEX': {
      const { index } = action.payload;
      return state.filter((_, i) => i !== index);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* ignore quota errors */
    }
  }, [cart]);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((name, price) => {
    dispatch({ type: 'ADD', payload: { name, price } });
  }, []);
  const incByName = useCallback((name) => dispatch({ type: 'INC', payload: { name } }), []);
  const decByName = useCallback((name) => dispatch({ type: 'DEC', payload: { name } }), []);
  const incByIndex = useCallback((index) => dispatch({ type: 'INC_INDEX', payload: { index } }), []);
  const decByIndex = useCallback((index) => dispatch({ type: 'DEC_INDEX', payload: { index } }), []);
  const removeByIndex = useCallback((index) => dispatch({ type: 'REMOVE_INDEX', payload: { index } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const totalQty = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.qty, 0), [cart]);
  const tax = 0;
  const total = subtotal;

  const getQtyByName = useCallback((name) => cart.find((i) => i.name === name)?.qty || 0, [cart]);

  const value = useMemo(
    () => ({
      cart,
      isOpen,
      openDrawer,
      closeDrawer,
      addItem,
      incByName,
      decByName,
      incByIndex,
      decByIndex,
      removeByIndex,
      clearCart,
      totalQty,
      subtotal,
      tax,
      total,
      getQtyByName,
      TAX_RATE,
    }),
    [cart, isOpen, openDrawer, closeDrawer, addItem, incByName, decByName, incByIndex, decByIndex, removeByIndex, clearCart, totalQty, subtotal, tax, total, getQtyByName]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
