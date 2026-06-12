"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { cn } from "@/lib/utils";

export type CategoryCircleNavLinkProps = {
  href: string;
  isActive: boolean;
  ariaLabel: string;
  /** صورة من Woo عند توفرها */
  imageSrc: string | null;
  /** للـ fallback عند عدم وجود صورة — يُمرَّر إلى CategoryIcon */
  iconSlug: string;
  /**
   * `header`: دائرة 48px فقط (شريط الهيدر).
   * `rail`: دائرة أكبر + تسمية تحتها (صفحات التصنيفات / المنتجات).
   */
  layout?: "header" | "rail";
  /** يُعرض تحت الدائرة في وضع rail */
  caption?: string;
  className?: string;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  scroll?: boolean;
};

const shellActiveHeader =
  "border-brand-600 bg-brand-100 text-brand-900 shadow-sm";
const shellIdleHeader =
  "border-border/80 bg-white text-brand-800 shadow-sm hover:bg-surface-muted/60";

export function CategoryCircleNavLink({
  href,
  isActive,
  ariaLabel,
  imageSrc,
  iconSlug,
  layout = "header",
  caption,
  className,
  onMouseEnter,
  onFocus,
  scroll = false,
}: CategoryCircleNavLinkProps) {
  const isRail = layout === "rail";

  /* ===== header layout: دائرة عادية كما هي ===== */
  if (!isRail) {
    const circleClass = cn(
      "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors duration-200",
      isActive ? shellActiveHeader : shellIdleHeader,
    );
    return (
      <Link
        href={href}
        className={cn(
          "flex shrink-0 flex-col items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          className,
        )}
        aria-label={ariaLabel}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        scroll={scroll}
      >
        {imageSrc ? (
          <span className={cn(circleClass, "relative")}>
            <AppImage src={imageSrc} alt="" fill sizes="48px" className="object-contain object-center p-1" />
          </span>
        ) : (
          <span className={circleClass}>
            <CategoryIcon slug={iconSlug} className="h-6 w-6 drop-shadow-[0_1px_1.5px_rgba(15,23,42,0.18)]" />
          </span>
        )}
        {caption ? (
          <span className={cn(
            "line-clamp-2 w-full text-center text-[11px] leading-tight",
            isActive ? "font-bold text-brand-950" : "font-medium text-muted-foreground",
          )}>
            {caption}
          </span>
        ) : null}
      </Link>
    );
  }

  /* ===== rail layout: بطاقة كاملة — الصورة تملأ الكارت + نص overlay ===== */
  return (
    <Link
      href={href}
      className={cn(
        /* w-[4.5rem] h-[5.5rem] → نسبة أطول من الدائرة القديمة بكثير */
        "relative flex w-[4.5rem] h-[5.5rem] shrink-0 snap-start overflow-hidden rounded-xl border transition-all duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        isActive
          ? "border-brand-500 ring-2 ring-brand-500/30 shadow-md"   /* ليمي خفيف — مش أسود */
          : "border-border/70 shadow-sm hover:border-brand-400 hover:shadow",
        className,
      )}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      scroll={scroll}
    >
      {/* خلفية محايدة */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200/70" />

      {/* الصورة أو الأيقونة تملأ الكارت */}
      {imageSrc ? (
        <AppImage
          src={imageSrc}
          alt=""
          fill
          sizes="72px"
          className="object-contain object-fill"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pb-6">
          <CategoryIcon
            slug={iconSlug}
            className="h-9 w-9 text-brand-800 drop-shadow-[0_1px_2px_rgba(15,23,42,0.15)]"
          />
        </div>
      )}

      {/* طبقة الـ active */}
      {isActive ? (
        <div className="absolute inset-0 bg-brand-500/10 pointer-events-none" />
      ) : null}

      {/* gradient + نص في الأسفل */}
      {caption ? (
        <>
          <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          <span className="absolute inset-x-1 bottom-1 line-clamp-2 text-center text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {caption}
          </span>
        </>
      ) : null}
    </Link>
  );
}

/** يستخرج slug التصنيف من مسار المتجر مثل `/categories/foo`. */
export function storeCategorySlugFromHref(href: string): string | null {
  const m = href.match(/^\/categories\/([^/?#]+)/);
  return m?.[1] ?? null;
}
