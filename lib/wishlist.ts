"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  importIds: (ids: string[]) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
      importIds: (ids) =>
        set((s) => ({ ids: Array.from(new Set([...s.ids, ...ids])).slice(0, 60) })),
    }),
    {
      name: "mdz-wishlist",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export function encodeWishlist(ids: string[]): string {
  return btoa(encodeURIComponent(ids.join(",")));
}

export function decodeWishlist(code: string): string[] {
  try {
    const raw = decodeURIComponent(atob(code));
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 60);
  } catch {
    return [];
  }
}
