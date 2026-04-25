"use client";

import { create } from "zustand";

type CatalogFilterDrawerOpenState = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (open: boolean) => void;
};

export const useCatalogFilterDrawerOpenStore = create<CatalogFilterDrawerOpenState>(
  (set) => ({
    open: false,
    openDrawer: () => set({ open: true }),
    closeDrawer: () => set({ open: false }),
    setOpen: (open) => set({ open }),
  }),
);
