"use client";

import { useMemo } from "react";
import { Link } from "next-view-transitions";
import { ProductCard } from "@/features/products/components/ProductCard";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/features/products/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CartUpsellSection({ className }: { className?: string }) {
  const { items, setProductLineQuantity, getCartLineQuantity } = useCart();
  const excludeIds = useMemo(
    () => new Set(items.map((i) => i.productId)),
    [items],
  );

  const query = useProducts({
    per_page: 12,
    orderby: "popularity",
    order: "desc",
  });

  const products = useMemo(() => {
    const raw = query.data?.items ?? [];
    return raw.filter((p) => !excludeIds.has(p.id)).slice(0, 8);
  }, [query.data, excludeIds]);

  if (query.isPending) {
    return (
      <section className={cn("space-y-3", className)} aria-busy="true" aria-label="اقتراحات">
        <div className="h-5 w-40 animate-pulse rounded bg-border" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-56 w-[9.5rem] shrink-0 animate-pulse rounded-xl bg-border/60"
            />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError || products.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-3 pb-8", className)} aria-labelledby="cart-upsell-heading">
      <div className="flex items-end justify-between gap-2">
        <h2
          id="cart-upsell-heading"
          className="font-display text-base font-semibold text-brand-950"
        >
          قد يعجبك أيضاً
        </h2>
        <Link
          href={ROUTES.PRODUCTS}
          className="text-xs font-semibold text-brand-700 hover:text-brand-600"
        >
          عرض الكل
        </Link>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-1 pt-0.5 [scrollbar-width:thin]">
        {products.map((product: Product) => (
          <div key={product.id} className="w-[9.75rem] shrink-0 px-1 sm:w-44">
            <ProductCard
              product={product}
              variant="mobileCompact"
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={setProductLineQuantity}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
