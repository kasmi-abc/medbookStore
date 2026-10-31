"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  bookId: string;
  slug: string;
  title: string;
  titleAr: string;
  price: number;
  image: string;
  format: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  setFormat: (id: string, format: string, price: number) => void;
  total: () => number;
  count: () => number;
};

export const cartId = (bookId: string, format: string) => `${bookId}::${format}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      inc: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i
          ),
        })),
      dec: (id) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
            .filter(Boolean) as CartItem[],
        })),
      setFormat: (id, format, price) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, format, price } : i)),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "mdz-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
