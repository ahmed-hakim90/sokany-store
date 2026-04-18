"use client";

import { createRef } from "react";
import { create } from "zustand";

/** Set by the control that opened the drawer (header menu or bottom nav) for focus restore. */
export const mobileNavDrawerReturnFocusRef =
  createRef<HTMLButtonElement | null>();

type MobileNavDrawerOpenState = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

export const useMobileNavDrawerOpenStore = create<MobileNavDrawerOpenState>(
  (set) => ({
    open: false,
    openDrawer: () => set({ open: true }),
    closeDrawer: () => set({ open: false }),
    toggleDrawer: () => set((s) => ({ open: !s.open })),
  }),
);
