"use client";

import { ProductGrid } from "@/features/products/components/ProductGrid";
import type { Product } from "@/features/products/types";
import { useCart } from "@/hooks/useCart";

type WarrantyPostProductGridProps = {
  products: Product[];
};

export function WarrantyPostProductGrid({ products }: WarrantyPostProductGridProps) {
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  return (
    <ProductGrid
      products={products}
      getCartLineQuantity={getCartLineQuantity}
      onCartLineQuantityChange={setProductLineQuantity}
      gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      cardVariant="mobileCompact"
      cardVariantMd="desktopCatalog"
    />
  );
}
