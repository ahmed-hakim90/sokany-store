"use client";

import { create } from "zustand";

type MobileChromeCollapsedState = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** يعيد إظهار الهيدر وشريط ملخص السلة (مثلاً عند الضغط على تبويب السلة). */
  expand: () => void;
};

export const useMobileChromeCollapsedStore = create<MobileChromeCollapsedState>(
  (set) => ({
    collapsed: false,
    setCollapsed: (collapsed) => set({ collapsed }),
    expand: () => set({ collapsed: false }),
  }),
);
