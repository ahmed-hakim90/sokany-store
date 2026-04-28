"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  CategoryCircleNavLink,
  storeCategorySlugFromHref,
} from "@/features/categories/components/category-circle-nav-link";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ROUTES } from "@/lib/constants";
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
  const searchParams = useSearchParams();
  const categoryQueryId = Number.parseInt(
    searchParams.get("category") ?? "",
    10,
  );
  const categories = useCategories({ per_page: 100 });
  const bySlug = categories.data?.length
    ? Object.fromEntries(categories.data.map((c) => [c.slug, c] as const))
    : null;

  if (!config.enabled || config.items.length === 0) return null;

  return (
    <div
      role="navigation"
      aria-label="اختصارات التصنيفات"
      className={cn(
        "w-full min-w-0",
        variant === "toolbar"
          ? "px-0 pt-1"
          : "border-b border-border/50 px-3 pt-1 pb-2 sm:px-4 sm:pt-1.5 sm:pb-2",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-full min-w-0 flex-nowrap items-center justify-start gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {config.items.map((item, i) => {
          const catSlug = storeCategorySlugFromHref(item.href);
          const matched = catSlug ? bySlug?.[catSlug] : undefined;
          const activeViaProductsFilter =
            pathname === ROUTES.PRODUCTS &&
            Number.isFinite(categoryQueryId) &&
            categoryQueryId > 0 &&
            matched?.id === categoryQueryId;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : activeViaProductsFilter ||
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
          const a11y = item.label?.trim() || `انتقال إلى ${item.iconKey}`;
          const imageSrc = matched?.image ?? null;

          return (
            <li key={`${item.href}-${item.iconKey}-${i}`} className="shrink-0">
              <CategoryCircleNavLink
                href={item.href}
                isActive={isActive}
                ariaLabel={a11y}
                imageSrc={imageSrc}
                iconSlug={item.iconKey}
                layout="header"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
