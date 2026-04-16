"use client";

import {
  ProductCardWishlistIconButton,
} from "@/features/products/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/features/products/types";

export function ProductWishlistHeart({ product }: { product: Product }) {
  const { isInWishlist, toggleProduct } = useWishlist();
  const pressed = isInWishlist(product.id);

  return (
    <ProductCardWishlistIconButton
      pressed={pressed}
      onPress={() => toggleProduct(product)}
      labels={{ add: "أضف إلى المفضلة", remove: "إزالة من المفضلة" }}
    />
  );
}
