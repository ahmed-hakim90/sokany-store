"use client";

/**
 * فتح/قفل درج الموبايل + ref لإرجاع الفوكس
 * بالعامية: Zustand بسيط؛ الـ ref بيتعبّى من الزرار اللي فتح عشان `FocusTrap` يرجّع المؤشر صح.
 */
import { createRef } from "react";
import { create } from "zustand";

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
