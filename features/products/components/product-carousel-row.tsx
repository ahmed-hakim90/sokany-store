"use client";

import type { ReactNode } from "react";
import type { Product } from "@/features/products/types";
import { ProductWishlistHeart } from "@/features/wishlist/components/ProductWishlistHeart";
import {
  ProductCard,
} from "@/features/products/components/ProductCard";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { cn } from "@/lib/utils";

export type ProductCarouselRowStatus = "loading" | "empty" | "ready";

export type ProductCarouselRowProps = {
  className?: string;
  status: ProductCarouselRowStatus;
  products?: Product[];
  loading?: ReactNode;
  empty?: ReactNode;
  getCartLineQuantity?: (productId: number) => number;
  onCartLineQuantityChange?: (product: Product, next: number) => void;
};

export function ProductCarouselRow({
  products = [],
  getCartLineQuantity,
  onCartLineQuantityChange,
  className,
  status,
  loading,
  empty,
}: ProductCarouselRowProps) {
  if (status === "loading") {
    return (
      <div
        className={cn(
          "flex min-w-0 gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
        aria-busy
        aria-label="جاري تحميل المنتجات"
      >
        {loading ?? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[10.5rem] shrink-0 snap-start sm:w-44 md:w-48"
              >
                <ProductSkeleton />
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return <div className={cn("min-w-0", className)}>{empty ?? null}</div>;
  }

  return (
    <div
      className={cn(
        "flex min-w-0 gap-3 overflow-x-auto scroll-smooth pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="list"
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="w-[10.5rem] shrink-0 snap-start sm:w-44 md:w-48"
          role="listitem"
        >
          <ProductCard
            product={product}
            imagePriority={index < 3}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={onCartLineQuantityChange}
            variant="mobileCompact"
            wishlistSlot={<ProductWishlistHeart product={product} />}
          />
        </div>
      ))}
    </div>
  );
}
