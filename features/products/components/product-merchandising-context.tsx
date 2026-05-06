"use client";

import { createContext, useContext } from "react";
import { SITE_WORDMARK } from "@/lib/constants";

export type ProductMerchandisingConfig = {
  productCardBadgeEnabled: boolean;
  productCardBadgeText: string;
};

const DEFAULT_PRODUCT_MERCHANDISING: ProductMerchandisingConfig = {
  productCardBadgeEnabled: true,
  productCardBadgeText: `Official ${SITE_WORDMARK}`,
};

const ProductMerchandisingContext = createContext<ProductMerchandisingConfig>(
  DEFAULT_PRODUCT_MERCHANDISING,
);

export function ProductMerchandisingProvider({
  value,
  children,
}: {
  value: Partial<ProductMerchandisingConfig>;
  children: React.ReactNode;
}) {
  const resolved: ProductMerchandisingConfig = {
    productCardBadgeEnabled:
      value.productCardBadgeEnabled ??
      DEFAULT_PRODUCT_MERCHANDISING.productCardBadgeEnabled,
    productCardBadgeText:
      value.productCardBadgeText?.trim() ||
      DEFAULT_PRODUCT_MERCHANDISING.productCardBadgeText,
  };

  return (
    <ProductMerchandisingContext.Provider value={resolved}>
      {children}
    </ProductMerchandisingContext.Provider>
  );
}

export function useProductMerchandising() {
  return useContext(ProductMerchandisingContext);
}
