"use client";

import { useEffect, useMemo, useState } from "react";
import type { AddProductLineOptions } from "@/hooks/useCart";
import type { Product, ProductVariation } from "@/features/products/types";
import { useProductVariations } from "@/features/products/hooks/useProductVariations";
import {
  findVariationByAttributes,
  formatVariationLabel,
  isVariableProduct,
  variationAttributeNames,
  variationPriceRange,
} from "@/features/products/lib/product-variations";

export function useProductVariationSelection(product: Product) {
  const isVariable = isVariableProduct(product);
  const variationsQuery = useProductVariations(product.id, isVariable);
  const attributeNames = useMemo(
    () => variationAttributeNames(product),
    [product],
  );

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    setSelectedAttributes({});
  }, [product.id]);

  const variations = variationsQuery.data ?? [];

  const selectedVariation: ProductVariation | null = useMemo(
    () => findVariationByAttributes(variations, selectedAttributes),
    [variations, selectedAttributes],
  );

  const allAttributesChosen = attributeNames.every((name) =>
    Boolean(selectedAttributes[name]?.trim()),
  );

  const priceRange = useMemo(
    () => variationPriceRange(variations),
    [variations],
  );

  const displayPrice = selectedVariation?.price ?? product.price;
  const displayRegularPrice =
    selectedVariation != null
      ? selectedVariation.regularPrice
      : product.regularPrice;
  const displayOnSale =
    selectedVariation != null
      ? selectedVariation.onSale
      : product.onSale;
  const displayInStock = isVariable
    ? Boolean(selectedVariation?.inStock)
    : product.inStock;
  const displayThumbnail =
    selectedVariation?.image?.src ?? product.thumbnail;

  const canAddToCart =
    !isVariable ||
    (allAttributesChosen &&
      selectedVariation != null &&
      selectedVariation.inStock);

  const selectionHint = isVariable
    ? allAttributesChosen
      ? selectedVariation
        ? selectedVariation.inStock
          ? null
          : "هذا التنويع غير متوفر حالياً."
        : "التنويع المختار غير متاح — جرّب خياراً آخر."
      : "اختر كل الخيارات قبل الإضافة للسلة."
    : null;

  function selectAttribute(name: string, option: string) {
    setSelectedAttributes((prev) => ({ ...prev, [name]: option }));
  }

  function buildAddOptions(): AddProductLineOptions | undefined {
    if (!selectedVariation) return undefined;
    return {
      variationId: selectedVariation.id,
      variationAttributes: { ...selectedAttributes },
      variationLabel: formatVariationLabel(selectedAttributes),
      price: selectedVariation.price,
      regularPrice:
        selectedVariation.regularPrice > selectedVariation.price
          ? selectedVariation.regularPrice
          : undefined,
      sku: selectedVariation.sku || product.sku,
      thumbnail: selectedVariation.image?.src ?? product.thumbnail,
      inStock: selectedVariation.inStock,
    };
  }

  return {
    isVariable,
    variationsQuery,
    attributeNames,
    selectedAttributes,
    selectAttribute,
    selectedVariation,
    allAttributesChosen,
    priceRange,
    displayPrice,
    displayRegularPrice,
    displayOnSale,
    displayInStock,
    displayThumbnail,
    canAddToCart,
    selectionHint,
    buildAddOptions,
  };
}
