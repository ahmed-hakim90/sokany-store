"use client";

import type { ReactNode } from "react";
import { StickyBelowHeaderRail } from "@/features/categories/components/sticky-below-header-rail";
import { cn } from "@/lib/utils";

type CategoriesMobileHeaderRailProps = {
  children: ReactNode;
  className?: string;
};

/*
 * سكة بلاطات التصنيفات على الموبايل — تلتصق أسفل كتلة الهيدر اللاصقة (شعار + اختصارات).
 * ‎`-mt-2`‎ يلغي ‎`pt-2`‎ على ‎`main`‎ في ‎`SiteShell`‎ ليظهر الشريط مباشرة تحت الهيدر.
 */
export function CategoriesMobileHeaderRail({
  children,
  className,
}: CategoriesMobileHeaderRailProps) {
  return (
    <div
      className={cn(
        "-mt-2 w-full min-w-0 max-w-[100vw] shrink-0 lg:hidden",
        className,
      )}
    >
      <StickyBelowHeaderRail className="z-40 bg-transparent">
        {children}
      </StickyBelowHeaderRail>
    </div>
  );
}
