"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  slug: string; // products.ts의 slug
  qty: number;
  size?: string; // 나중에 옵션 붙일 때
};

type CartContextType = {
  items: CartItem[];
  count: number; // 배지용 (qty 합)
  addItem: (slug: string, qty?: number, size?: string) => void;
  removeItem: (slug: string, size?: string) => void;
  setQty: (slug: string, qty: number, size?: string) => void;
  clear: () => void;
};

const KEY = "hlin-cart-items";

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ✅ localStorage → state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        // 최소 방어
        const safe = parsed
          .filter((x) => x && typeof x.slug === "string")
          .map((x) => ({
            slug: x.slug,
            qty: Number.isFinite(x.qty) && x.qty > 0 ? x.qty : 1,
            size: typeof x.size === "string" ? x.size : undefined,
          }));
        setItems(safe);
      }
    } catch {
      // ignore
    }
  }, []);

  // ✅ state → localStorage
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const count = useMemo(
    () => items.reduce((sum, it) => sum + (it.qty ?? 0), 0),
    [items],
  );

  const addItem = (slug: string, qty: number = 1, size?: string) => {
    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;

    setItems((prev: CartItem[]) => {
      const idx = prev.findIndex((p) => p.slug === slug && p.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + safeQty };
        return next;
      }
      return [...prev, { slug, qty: safeQty, size }];
    });
  };

  const setQty = (slug: string, qty: number, size?: string) => {
    const safeQty = Number.isFinite(qty) ? qty : 0;

    setItems((prev: CartItem[]) =>
      prev
        .map((p) => {
          if (p.slug === slug && p.size === size) return { ...p, qty: safeQty };
          return p;
        })
        .filter((p) => p.qty > 0),
    );
  };

  const removeItem = (slug: string, size?: string) => {
    setItems((prev) =>
      prev.filter((p) => !(p.slug === slug && p.size === size)),
    );
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, count, addItem, removeItem, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
