import { cn } from "@/lib/utils";

/**
 * أسطح موبايل التجارة: كبسولة التبويب السفلي + الهيدر + ملخص السلة.
 * عند تغيير المظهر، راجع ‎`mobile-commerce-chrome.tsx`‎ و‎`mobile-top-header.tsx`‎ و‎`mobile-hero-lime-atmosphere.tsx`‎.
 */

/** كبسولة التبويب السفلي — ليكويد جلاس أبيض (مع ‎`headerHidden === false`‎). يطابق مكوّنات ‎`MobileTopHeader`‎ البيضاء. */
export const mobileBottomNavGlassRestClass = cn(
  "overflow-hidden rounded-3xl border border-white/50",
  "bg-white/80",
  "shadow-[0_8px_32px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08),0_4px_16px_-4px_rgba(15,23,42,0.1)]",
  "backdrop-blur-2xl backdrop-saturate-150",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
);

/** وضع سكرول/طي الكروم — ليكويد فوق ‎`brand-500`‎ (مثل ‎`mobileTopHeaderGlassSurfaceCollapsedClass`‎). */
export const mobileBottomNavGlassCollapsedClass = cn(
  "overflow-hidden rounded-3xl border border-white/35",
  "bg-brand-500/60",
  "shadow-[0_8px_32px_-10px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(0,0,0,0.1),0_4px_18px_-4px_rgba(15,23,42,0.12)]",
  "backdrop-blur-2xl backdrop-saturate-150",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
);

/** سطح أخف — شريط peek السلة (`MobileCartBottomSheet`) وشريط الإعلان (`TopAnnouncementBar`). */
export const mobileCommercePeekSurfaceClass =
  "rounded-3xl border border-white/50 bg-white/80 shadow-[0_8px_32px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08)] backdrop-blur-xl backdrop-saturate-150";

/**
 * هيدر موبايل — نفس مزيج الليكويد جلاس مع ‎`mobileCommercePeekSurfaceClass` (‎`MobileCartBottomSheet`‎)؛
 * ‎`rounded-b` فقط (حواف أعلى مربّعة). ‎`MobileTopHeader`‎ (عرض كامل؛ غلاف ‎`SiteShell` بلا ‎`bg`‎).
 * بدون ‎`overflow-hidden`‎ على الغلاف: لوحات ‎`absolute`‎ تحت حقل البحث (اقتراحات) تُرسم خارجه دون قصّ.
 * صف الشعار يبقى داخل ‎`overflow-hidden`‎ منفصل لحركة الطي.
 */
export const mobileTopHeaderGlassSurfaceClass = cn(
  "rounded-b-3xl border border-white/50",
  "bg-white/80",
  "shadow-[0_8px_32px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08),0_4px_16px_-4px_rgba(15,23,42,0.1)]",
  "backdrop-blur-2xl backdrop-saturate-150",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
);

/** وضع طي صف الشعار (ليمون) — ليكويد فوق ‎`brand-500`‎. */
export const mobileTopHeaderGlassSurfaceCollapsedClass = cn(
  "rounded-b-3xl border border-white/35",
  "bg-brand-500/60",
  "shadow-[0_8px_32px_-10px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(0,0,0,0.1),0_4px_18px_-4px_rgba(15,23,42,0.12)]",
  "backdrop-blur-2xl backdrop-saturate-150",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
);

/**
 * حقل بحث المنتجات في الهيدر — نفس مكوّنات الليكويد جلاس كـ `MobileCartBottomSheet`، بظل أنسب للارتفاع الضعيف.
 * يُحاذى مع `headerProductSearchPanelGlassClass` في القوائم المنسدلة.
 */
export const headerProductSearchFieldGlassClass =
  "rounded-2xl border border-white/50 bg-white/90 shadow-[0_8px_32px_-10px_rgba(15,23,42,0.2),0_2px_8px_-4px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150 focus-within:border-white/70 focus-within:ring-1 focus-within:ring-slate-900/8";

/**
 * اقتراحات البحث (كلمات / منتجات) — سطح زجاجي مماثل لورقة السلة.
 */
export const headerProductSearchPanelGlassClass =
  "overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-[0_28px_64px_-18px_rgba(15,23,42,0.4)] backdrop-blur-2xl backdrop-saturate-150";

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

/** ظل تحت شريط الإعلان عند طي صف الشعار (الموبايل) — الإعلان يصير الحافة السفلية لـ sticky. */
export const stickyAnnouncementBottomShadowWhenTopRowHiddenClass =
  "max-lg:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.1),0_2px_6px_-3px_rgba(15,23,42,0.07)]";

/** ‎`chromeCollapsed`‎ = ‎`headerHidden`‎ من ‎`useMobileChromeCollapsedStore`‎ (مزامنة مع الهيدر المطوي). */
export function mobileCommerceBottomNavCapsuleClassName(chromeCollapsed: boolean) {
  return cn(
    "mx-2 mt-0 mb-2",
    chromeCollapsed ? mobileBottomNavGlassCollapsedClass : mobileBottomNavGlassRestClass,
    mobileCommerceCapsulePaddingXClass,
  );
}
