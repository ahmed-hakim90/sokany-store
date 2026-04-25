"use client";

import { usePathname } from "next/navigation";
import { HeaderCategoryIconStrip } from "@/features/categories/components/HeaderCategoryIconStrip";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CmsHeaderCategoryStrip } from "@/schemas/cms";

export type StorefrontHeaderCategoryStripProps = {
  config: CmsHeaderCategoryStrip;
  className?: string;
};

/**
 * شريط اختصارات التصنيفات (دوائر أيقونات) — تحت كتلة الهيدر اللاصقة، خارج `TopHeader` /
 * `Navbar`، على كل الصفحات ما عدا الدفع.
 */
export function StorefrontHeaderCategoryStrip({
  config,
  className,
}: StorefrontHeaderCategoryStripProps) {
  const pathname = usePathname();
  if (pathname === ROUTES.CHECKOUT) return null;
  if (!config.enabled || config.items.length === 0) return null;

  return (
    <div className={cn("z-30 bg-page max-lg:bg-white", className)}>
      <HeaderCategoryIconStrip config={config} variant="default" />
    </div>
  );
}
