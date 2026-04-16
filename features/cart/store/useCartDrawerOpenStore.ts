"use client";

import { create } from "zustand";

type CartDrawerOpenState = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (open: boolean) => void;
};

export const useCartDrawerOpenStore = create<CartDrawerOpenState>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
  setOpen: (open) => set({ open }),
}));
