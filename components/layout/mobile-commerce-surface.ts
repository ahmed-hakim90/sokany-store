import { cn } from "@/lib/utils";

/**
 * طبقة الزجاج المشتركة مع الشريط السفلي (`MobileCommerceChrome`) وملخص السلة.
 * عند تغيير المظهر، حدّث الاستخدامات في `mobile-commerce-chrome.tsx` و`mobile-top-header.tsx` معاً.
 */
export const mobileCommerceGlassSurfaceClass =
  "overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-[0_28px_64px_-18px_rgba(15,23,42,0.45)] backdrop-blur-2xl backdrop-saturate-150";

/** سطح أخف — شريط peek السلة (`MobileCartBottomSheet`) وشريط الإعلان (`TopAnnouncementBar`). */
export const mobileCommercePeekSurfaceClass =
  "rounded-3xl border border-white/50 bg-white/80 shadow-[0_8px_32px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08)] backdrop-blur-xl backdrop-saturate-150";

export const mobileCommerceCapsulePaddingXClass = "px-2 sm:px-4 md:px-5";

/** يحاذي أطراف الكبسولات مع عمود الكروم السفلي الثابت. */
export const mobileCommerceChromeColumnClass =
  "mx-auto w-full max-w-3xl md:max-w-5xl";

/** ظل خفيف أسفل الهيدر الثابت — يفصل المنطقة العلوية عن المحتوى. */
export const stickyChromeBottomShadowClass =
  "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.1),0_2px_6px_-3px_rgba(15,23,42,0.07)]";

/** نفس الظل على `<header>` الديسكتوب (شريط الشعار + التصنيفات). */
export const stickyChromeBottomShadowLgClass =
  "lg:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.1),0_2px_6px_-3px_rgba(15,23,42,0.07)]";

/**
 * نفس الظل على شريط الإعلان على الموبايل عندما يُطوى `MobileTopHeader`
 * (`headerHidden`) فيصبح الإعلان الحافة السفلية للـ sticky.
 */
export const stickyAnnouncementBottomShadowWhenHeaderHiddenClass =
  "max-lg:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.1),0_2px_6px_-3px_rgba(15,23,42,0.07)]";

export function mobileCommerceBottomNavCapsuleClassName() {
  return cn(
    "mx-4 mb-3",
    mobileCommerceGlassSurfaceClass,
    mobileCommerceCapsulePaddingXClass,
  );
}
