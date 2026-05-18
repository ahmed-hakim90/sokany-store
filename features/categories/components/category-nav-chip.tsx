"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { cn } from "@/lib/utils";

export type CategoryNavChipProps = {
  href: string;
  label: string;
  active?: boolean;
  count?: number | null;
  imageSrc?: string | null;
  iconSlug?: string;
  onPrefetch?: () => void;
  scroll?: boolean;
  className?: string;
};

/*
 * شريحة تصنيف مضغوطة — للأبناء أو شريط الفلاتر النشطة.
 */
export function CategoryNavChip({
  href,
  label,
  active = false,
  count,
  imageSrc,
  iconSlug = "all",
  onPrefetch,
  scroll = false,
  className,
}: CategoryNavChipProps) {
  return (
    <Link
      href={href}
      scroll={scroll}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className={cn(
        "inline-flex max-w-[12rem] shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-brand-950 bg-brand-950 text-accent shadow-sm"
          : "border-border/80 bg-white text-brand-950 hover:bg-surface-muted/60",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border",
          active ? "border-white/25 bg-white/10" : "border-border/70 bg-surface-muted/40",
        )}
        aria-hidden
      >
        {imageSrc ? (
          <AppImage src={imageSrc} alt="" fill sizes="24px" className="object-contain p-0.5" />
        ) : (
          <CategoryIcon slug={iconSlug} className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="min-w-0 truncate">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 text-[10px] font-bold tabular-nums",
            active ? "bg-white/15 text-accent" : "bg-surface-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

