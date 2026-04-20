"use client";

import { create } from "zustand";

type MobileChromeScrollState = {
  /** يطوي الهيدر الموبايل عند السكرول للأسفل. */
  headerHidden: boolean;
  /** يخفي شريط ملخص السلة فوق الـ bottom nav. */
  cartPeekHidden: boolean;
  /** إعادة كامل الواجهة (تغيير صفحة، سطح مكتب، أو أعلى الصفحة). */
  resetChrome: () => void;
  /** سكرول للأسفل: إخفاء الهيدر والشريط معًا. */
  hideChromeFromScroll: () => void;
  /**
   * تبويب السلة: إظهار شريط الملخص فقط دون إرجاع الهيدر
   * (يبقى الهيدر مخفيًا إن كان المستخدم قد سكرّل للأسفل).
   */
  showCartPeekOnly: () => void;
};

export const useMobileChromeCollapsedStore = create<MobileChromeScrollState>(
  (set) => ({
    headerHidden: false,
    cartPeekHidden: false,
    resetChrome: () => set({ headerHidden: false, cartPeekHidden: false }),
    hideChromeFromScroll: () =>
      set({ headerHidden: true, cartPeekHidden: true }),
    showCartPeekOnly: () => set({ cartPeekHidden: false }),
  }),
);
