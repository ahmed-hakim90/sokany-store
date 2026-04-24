"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { cn } from "@/lib/utils";
import type { CmsHeaderCategoryStrip } from "@/schemas/cms";

export type HeaderCategoryIconStripProps = {
  config: CmsHeaderCategoryStrip;
  className?: string;
  /** `toolbar`: هوامش أخف للصف الثاني في هيدر الموبايل. */
  variant?: "toolbar" | "default";
};

export function HeaderCategoryIconStrip({
  config,
  className,
  variant = "default",
}: HeaderCategoryIconStripProps) {
  const pathname = usePathname();
  if (!config.enabled || config.items.length === 0) return null;

  return (
    <div
      role="navigation"
      aria-label="اختصارات التصنيفات"
      className={cn(
        "w-full min-w-0",
        variant === "toolbar" ? "px-0 pt-1" : "border-b border-border/50 px-3 py-2 sm:px-4",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-full min-w-0 flex-nowrap items-center justify-start gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {config.items.map((item, i) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const a11y = item.label?.trim() || `انتقال إلى ${item.iconKey}`;

          return (
            <li key={`${item.href}-${item.iconKey}-${i}`} className="shrink-0">
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors",
                  isActive
                    ? "border-brand-600 bg-brand-100 text-brand-900 shadow-sm"
                    : "border-border/80 bg-white text-brand-800 shadow-sm hover:bg-surface-muted/60",
                )}
                aria-label={a11y}
                aria-current={isActive ? "page" : undefined}
              >
                <CategoryIcon
                  slug={item.iconKey}
                  className="h-6 w-6 drop-shadow-[0_1px_1.5px_rgba(15,23,42,0.18)]"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
