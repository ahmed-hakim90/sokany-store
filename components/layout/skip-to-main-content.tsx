import { STOREFRONT_MAIN_CONTENT_ID } from "@/lib/storefront-a11y";
import { cn } from "@/lib/utils";

/**
 * أول رابط قابل للتركيز في واجهة المتجر: يقلل التبويب عبر الهيدر/الإعلان.
 * ‎`<a href="#…">`‎ يضمن سلوك التمرير/التركيز الافتراضي للمتصفح (أوضح من ‎`next/link`‎ لهذا الغرض).
 */
export function SkipToMainContent() {
  return (
    <a
      href={`#${STOREFRONT_MAIN_CONTENT_ID}`}
      className={cn(
        "fixed start-[max(1rem,env(safe-area-inset-left,0px))] top-[max(1rem,env(safe-area-inset-top,0px))] z-[100] rounded-xl bg-page px-4 py-3 text-sm font-semibold text-foreground shadow-lg outline-none ring-2 ring-brand-700 ring-offset-2 ring-offset-page",
        "-translate-y-[220%] transition-transform duration-200",
        "focus-visible:translate-y-0",
      )}
    >
      تخطي إلى المحتوى الرئيسي
    </a>
  );
}
