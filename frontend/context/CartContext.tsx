// context/CartContext.tsx
"use client";
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  size: string;
  color: string;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  changeQty: (id: string, size: string, color: string, qty: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "aviar_cart";

function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    setCart(readCartFromStorage());
    setIsMounted(true);
  }, []);

  // Persist to localStorage whenever cart changes, but only after mount
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + newItem.qty };
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
  }, []);

  const changeQty = useCallback((id: string, size: string, color: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, qty: Math.max(1, qty) }
          : item
      )
    );
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, isCartOpen, addToCart, removeItem, changeQty, openCart, closeCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
};
