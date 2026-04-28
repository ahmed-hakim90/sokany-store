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

const shellActive =
  "border-brand-600 bg-brand-100 text-brand-900 shadow-sm";
const shellIdle =
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
  const circleClass = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors",
    isRail ? "h-14 w-14 sm:h-16 sm:w-16" : "h-12 w-12",
    isActive ? shellActive : shellIdle,
  );

  const inner = imageSrc ? (
    <span className={cn(circleClass, "relative")}>
      <AppImage
        src={imageSrc}
        alt=""
        fill
        sizes={isRail ? "64px" : "48px"}
        className="object-contain object-center"
      />
    </span>
  ) : (
    <span className={circleClass}>
      <CategoryIcon
        slug={iconSlug}
        className={cn(
          "drop-shadow-[0_1px_1.5px_rgba(15,23,42,0.18)]",
          isRail ? "h-8 w-8 sm:h-9 sm:w-9" : "h-6 w-6",
        )}
      />
    </span>
  );

  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 flex-col items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        isRail ? "min-w-[4rem] max-w-[5rem] snap-start" : "items-center",
        className,
      )}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      scroll={scroll}
    >
      {inner}
      {isRail && caption ? (
        <span
          className={cn(
            "line-clamp-2 w-full text-center text-[11px] leading-tight sm:text-xs",
            isActive ? "font-bold text-brand-950" : "font-medium text-muted-foreground",
          )}
        >
          {caption}
        </span>
      ) : null}
    </Link>
  );
}

/** يستخرج slug التصنيف من مسار المتجر مثل `/categories/foo`. */
export function storeCategorySlugFromHref(href: string): string | null {
  const m = href.match(/^\/categories\/([^/?#]+)/);
  return m?.[1] ?? null;
}
