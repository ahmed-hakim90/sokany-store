"use client";

import Link from "next/link";
import { useCallback } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import type { Product } from "@/features/products/types";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function ReturnToShopLink({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.PRODUCTS}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-5 text-sm font-semibold text-black transition-colors hover:bg-brand-400",
        className,
      )}
    >
      العودة للتسوق
    </Link>
  );
}

export type SearchPageContentProps = {
  /** Normalized search string (may be short; parent decides fetch). */
  query: string;
  /** When false, parent skipped Woo because query was too short. */
  searched: boolean;
  products: Product[];
};

export function SearchPageContent({
  query,
  searched,
  products,
}: SearchPageContentProps) {
  const { items, setProductLineQuantity } = useCart();
  const getCartLineQuantity = useCallback(
    (productId: number) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  if (!searched) {
    return (
      <EmptyState
        title="أدخل 3 أحرف على الأقل"
        description="اكتب كلمة بحث أطول في شريط البحث أعلاه ثم اضغط Enter أو اختر «عرض الكل» لرؤية كل النتائج."
        action={<ReturnToShopLink />}
      />
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title="لا توجد نتائج"
        description={
          query
            ? `لم نعثر على منتجات تطابق «${query}». جرّب كلمات مختلفة أو ارجع للكتالوج.`
            : "لم نعثر على منتجات لهذا البحث."
        }
        action={<ReturnToShopLink />}
      />
    );
  }

  return (
    <div className="min-w-0">
      <ProductGrid
        products={products}
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={setProductLineQuantity}
        cardVariant="desktopCatalog"
        cardVariantMd="desktopCatalog"
      />
    </div>
  );
}
