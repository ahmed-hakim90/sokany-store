"use client";

/**
 * حالة طي كروم الموبايل عند السكرول
 * بالعامية: سكرول لتحت يخبي صف الشعار فقط؛ كبسولة السلة تفضل ظاهرة طالما فيها أصناف.
 */
import { create } from "zustand";

type MobileChromeScrollState = {
  /** يطوي صف الشعار فقط (الموبايل)؛ مربع البحث + التصنيفات يبقون ظاهرين. */
  headerHidden: boolean;
  /** إعادة كامل الواجهة (تغيير صفحة، سطح مكتب، أو أعلى الصفحة). */
  resetChrome: () => void;
  /** سكرول للأسفل: إخفاء صف الشعار فقط. */
  hideHeaderFromScroll: () => void;
};

export const useMobileChromeCollapsedStore = create<MobileChromeScrollState>(
  (set) => ({
    headerHidden: false,
    resetChrome: () => set({ headerHidden: false }),
    hideHeaderFromScroll: () => set({ headerHidden: true }),
  }),
);
