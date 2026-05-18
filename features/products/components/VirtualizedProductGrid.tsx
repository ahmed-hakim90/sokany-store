"use client";

/**
 * جريد منتجات افتراضية (نافذة)
 * بالعامية: `@tanstack/react-virtual` يرسم صفوف قليلة في الـ DOM — مناسب لقوائم طويلة من غير ما نبطّئ السكرول.
 *
 * التفاصيل التقنية تحت.
 */
import { measureElement, useWindowVirtualizer } from "@tanstack/react-virtual";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { ProductWishlistHeart } from "@/features/wishlist/components/ProductWishlistHeart";
import {
  type GridColumnCounts,
  useGridColumns,
} from "@/hooks/useGridColumns";
import { useMinMd } from "@/hooks/useMinMd";
import type { Product } from "@/features/products/types";
import { productGridCellClassName } from "@/features/products/lib/product-card-layout";
import { cn } from "@/lib/utils";
import {
  ProductCard,
  type ProductCardVariant,
} from "@/features/products/components/ProductCard";

export type VirtualizedProductGridProps = {
  className?: string;
  /** يطابق ‎`grid-cols-*`‎ المخصّصة عند الحاجة (مثلاً ‎`lg:grid-cols-4`‎). */
  virtualColumnCounts?: GridColumnCounts;
  /** أول ‎N‎ بطاقة تحمل صوراً عالية الأولوية — يقتصر على الصف الأول المرئي تقريباً. */
  priorityImageSlots?: number;
  simpleImageMode?: boolean;
  imageMotion?: boolean;
  imageInteractions?: boolean;
  products: Product[];
  getCartLineQuantity?: (productId: number) => number;
  onCartLineQuantityChange?: (product: Product, next: number) => void;
  renderItem?: (product: Product) => ReactNode;
  cardVariant?: ProductCardVariant;
  cardVariantMd?: ProductCardVariant;
};

/*
 * شبكة منتجات افتراضية تعتمد ‎`window`‎ للتمرير — يحافظ على ‎`scroll restoration`‎ وسلوك ‎`scrollTo`‎ الحالي.
 * الصفوف فقط في DOM؛ يقلل الذاكرة عند قوائم طويلة (تحميل أكبر من ‎`VIRTUAL_PRODUCT_THRESHOLD`‎).
 */
export function VirtualizedProductGrid({
  className,
  virtualColumnCounts,
  priorityImageSlots = 5,
  simpleImageMode = false,
  imageMotion = true,
  imageInteractions = true,
  products,
  getCartLineQuantity,
  onCartLineQuantityChange,
  renderItem,
  cardVariant = "desktopCatalog",
  cardVariantMd,
}: VirtualizedProductGridProps) {
  const mdUp = useMinMd();
  const resolvedVariant =
    cardVariantMd !== undefined ? (mdUp ? cardVariantMd : cardVariant) : cardVariant;
  const { columns, gapPx } = useGridColumns(virtualColumnCounts);

  const rowCount = Math.ceil(products.length / columns);
  const estimatedRowHeight = columns <= 2 ? 318 : 352;

  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const updateScrollMargin = () => {
      const rect = el.getBoundingClientRect();
      setScrollMargin(rect.top + window.scrollY);
    };

    updateScrollMargin();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollMargin) : null;
    ro?.observe(el);
    window.addEventListener("resize", updateScrollMargin, { passive: true });

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateScrollMargin);
    };
  }, [products.length, columns, rowCount]);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimatedRowHeight,
    overscan: 4,
    gap: gapPx,
    scrollMargin,
    measureElement,
    isRtl:
      typeof document !== "undefined" && document.documentElement.dir === "rtl",
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className={cn("relative min-w-0", className)}
      style={{ height: totalSize }}
    >
      {virtualRows.map((virtualRow) => {
        const rowIndex = virtualRow.index;
        const startIdx = rowIndex * columns;
        const slice = products.slice(startIdx, startIdx + columns);

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute left-0 top-0 w-full min-w-0"
            style={{
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            <div
              className="grid min-w-0"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: gapPx,
              }}
            >
              {slice.map((product, colIdx) => {
                const flatIndex = startIdx + colIdx;
                const imagePriority = flatIndex < priorityImageSlots;

                return (
                  <div key={product.id} className={productGridCellClassName}>
                    {renderItem ? (
                      renderItem(product)
                    ) : (
                      <ProductCard
                        product={product}
                        imagePriority={imagePriority}
                        simpleImageMode={simpleImageMode}
                        imageMotion={imageMotion}
                        imageInteractions={imageInteractions}
                        getCartLineQuantity={getCartLineQuantity}
                        onCartLineQuantityChange={onCartLineQuantityChange}
                        variant={resolvedVariant}
                        wishlistSlot={<ProductWishlistHeart product={product} />}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
