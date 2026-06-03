/**
 * كلاسات Tailwind المشتركة لكروم الموبايل
 * بالعامية: جلاس موحّد للشريط السفلي والهيدر والـ peek؛ لو غيّرت حاجة هنا راجع المكوّنات اللي فوق في الملاحظات.
 *
 * ملاحظات:
 * - ليه ملف منفصل: نفس السطح يتكرر في أكتر من مكوّن ومش عايزين يبقى في drift.
 * - شوف كمان: `mobile-commerce-chrome.tsx`، `mobile-top-header.tsx`، `mobile-hero-lime-atmosphere.tsx`
 */
import { cn } from "@/lib/utils";

/** شريط التبويب السفلي — عرض كامل؛ حواف مستقيمة على مستطيل الشريط (بدون كبسولة عائمة). */
export const mobileBottomNavGlassRestClass = cn(
  "overflow-hidden rounded-none",
  "bg-white/88",
  "shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.12),0_-1px_0_rgba(15,23,42,0.06)]",
  "backdrop-blur-2xl backdrop-saturate-125",
  "transition-[background-color,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none",
);

/** وضع سكرول/طي الكروم — نفس الشريط بعرض كامل فوق خلفية الـ safe-area. */
export const mobileBottomNavGlassCollapsedClass = cn(
  "overflow-hidden rounded-none",
  "bg-[color-mix(in_srgb,var(--sokany-accent)_18%,white_82%)]",
  "shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.14),0_-1px_0_rgba(15,23,42,0.07)]",
  "backdrop-blur-2xl backdrop-saturate-125",
  "transition-[background-color,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none",
);

export const mobileBottomNavSafeAreaRestClass =
  "bg-white/85 backdrop-blur-2xl backdrop-saturate-125";

export const mobileBottomNavSafeAreaCollapsedClass =
  "bg-[color-mix(in_srgb,var(--sokany-accent)_18%,white_82%)] backdrop-blur-2xl backdrop-saturate-125";

/** سطح أخف — شريط إعلان (`TopAnnouncementBar`)؛ كبسولة السلة تستخدم `mobileCartCompactPeekClass`. */
export const mobileCommercePeekSurfaceClass =
  "rounded-3xl border border-white/50 bg-white/80 shadow-[0_8px_32px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08)] backdrop-blur-xl backdrop-saturate-150";

/** كبسولة سلة مدمجة فوق الـ bottom nav — `MobileCartCompactPeek`. */
export const mobileCartCompactPeekClass = cn(
  "rounded-full bg-destructive shadow-[0_10px_28px_-8px_rgba(190,18,60,0.55),0_4px_12px_-4px_rgba(15,23,42,0.2)]",
);

/**
 * هيدر موبايل — نفس مزيج الليكويد جلاس مع ‎`mobileCommercePeekSurfaceClass` (‎`MobileCartBottomSheet`‎)؛
 * ‎`rounded-b` فقط (حواف أعلى مربّعة). ‎`MobileTopHeader`‎ (عرض كامل؛ غلاف ‎`SiteShell` بلا ‎`bg`‎).
 * بدون ‎`overflow-hidden`‎ على الغلاف: لوحات ‎`absolute`‎ تحت حقل البحث (اقتراحات) تُرسم خارجه دون قصّ.
 * صف الشعار يبقى داخل ‎`overflow-hidden`‎ منفصل لحركة الطي.
 */
export const mobileTopHeaderGlassSurfaceClass = cn(
  "rounded-b-[1.35rem] border border-white/50",
  "bg-[color-mix(in_srgb,var(--sokany-accent)_12%,white_88%)]",
  "shadow-[0_10px_36px_-12px_rgba(15,23,42,0.16),0_2px_10px_-4px_rgba(15,23,42,0.08)]",
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
    "w-full",
    chromeCollapsed ? mobileBottomNavGlassCollapsedClass : mobileBottomNavGlassRestClass,
  );
}

export function mobileCommerceBottomNavShellClassName(chromeCollapsed: boolean) {
  return cn(
    "w-full",
    chromeCollapsed ? mobileBottomNavSafeAreaCollapsedClass : mobileBottomNavSafeAreaRestClass,
  );
}
