"use client";

import type { ReactNode } from "react";
import { ProductGrid, type ProductGridProps } from "@/features/products/components/ProductGrid";
import {
  ProductHorizontalRail,
  type ProductHorizontalRailProps,
} from "@/features/home/components/product-horizontal-rail";
import {
  HomeSectionHeader,
  type HomeSectionHeaderProps,
} from "@/features/home/components/home-section-header";
import { cn } from "@/lib/utils";

export type HomeResponsiveProductSectionProps = {
  header: HomeSectionHeaderProps;
  grid: ProductGridProps;
  rail: ProductHorizontalRailProps;
  className?: string;
  staleNotice?: ReactNode;
};

/**
 * قسم منتجات الهوم: سكة أفقية على الموبايل، شبكة من ‎`lg`‎ — نفس البيانات، بدون اختلاف hydration.
 */
export function HomeResponsiveProductSection({
  header,
  grid,
  rail,
  className,
  staleNotice,
}: HomeResponsiveProductSectionProps) {
  const railStatus =
    rail.status === "error"
      ? "error"
      : grid.status === "loading"
        ? "loading"
        : grid.status === "empty"
          ? "empty"
          : "ready";

  return (
    <section
      className={cn("space-y-3 sm:space-y-4", className)}
      aria-labelledby={header.id}
    >
      <HomeSectionHeader {...header} />
      {staleNotice}
      <div className="lg:hidden">
        <ProductHorizontalRail
          {...rail}
          status={railStatus}
          products={grid.products}
          getCartLineQuantity={grid.getCartLineQuantity}
          onCartLineQuantityChange={grid.onCartLineQuantityChange}
          empty={grid.empty}
          errorMessage={rail.errorMessage}
          onRetry={rail.onRetry}
          skeletonCount={rail.skeletonCount ?? grid.skeletonCount}
          priorityImageSlots={grid.priorityImageSlots}
          simpleImageMode={grid.simpleImageMode}
          imageMotion={grid.imageMotion}
          imageInteractions={grid.imageInteractions}
        />
      </div>
      <div className="hidden min-w-0 lg:block">
        <ProductGrid {...grid} />
      </div>
    </section>
  );
}
