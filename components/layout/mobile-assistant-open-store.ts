"use client";

/**
 * حالة فتح مساعد المتجر على الموبايل
 * بالعامية: جسر صغير بين زر الشات والكروم السفلي علشان الـ bottom nav يختفي من غير prop drilling عبر `SiteShell`.
 */
import { create } from "zustand";

type MobileAssistantOpenState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useMobileAssistantOpenStore = create<MobileAssistantOpenState>(
  (set) => ({
    open: false,
    setOpen: (open) => set({ open }),
  }),
);
