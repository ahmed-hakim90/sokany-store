"use client";

import { create } from "zustand";

type WishlistDrawerOpenState = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (open: boolean) => void;
};

export const useWishlistDrawerOpenStore = create<WishlistDrawerOpenState>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
  setOpen: (open) => set({ open }),
}));
