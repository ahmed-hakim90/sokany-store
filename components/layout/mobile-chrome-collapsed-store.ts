"use client";

import { create } from "zustand";

type MobileChromeScrollState = {
  /** يطوي صف الشعار فقط (الموبايل)؛ مربع البحث + التصنيفات يبقون ظاهرين. */
  headerHidden: boolean;
  /** يخفي شريط ملخص السلة فوق الـ bottom nav. */
  cartPeekHidden: boolean;
  /** إعادة كامل الواجهة (تغيير صفحة، سطح مكتب، أو أعلى الصفحة). */
  resetChrome: () => void;
  /** سكرول للأسفل: إخفاء صف الشعار + ملخص السلة. */
  hideChromeFromScroll: () => void;
  /**
   * تبويب السلة: إظهار شريط الملخص فقط دون إرجاع صف الشعار
   * (يبقى صف الشعار مطويًا إن وُجد سكرول).
   */
  showCartPeekOnly: () => void;
};

export const useMobileChromeCollapsedStore = create<MobileChromeScrollState>(
  (set) => ({
    headerHidden: false,
    cartPeekHidden: false,
    resetChrome: () => set({ headerHidden: false, cartPeekHidden: false }),
    hideChromeFromScroll: () => set({ headerHidden: true, cartPeekHidden: true }),
    showCartPeekOnly: () => set({ cartPeekHidden: false }),
  }),
);
