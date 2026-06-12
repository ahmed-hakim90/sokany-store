import { parsePrice } from "@/lib/utils";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { ProductVariation } from "@/features/products/types";
import type { z } from "zod";
import type { wpProductVariationSchema } from "@/schemas/wordpress";

type WcVariation = z.infer<typeof wpProductVariationSchema>;

export function mapProductVariation(raw: WcVariation): ProductVariation {
  const price = parsePrice(raw.price);
  const regularPrice = parsePrice(raw.regular_price);
  const salePriceRaw = raw.sale_price.trim();
  const salePrice =
    salePriceRaw.length > 0 ? parsePrice(salePriceRaw) : null;

  const imageSrc = raw.image?.src?.trim();
  const image =
    imageSrc && imageSrc.length > 0
      ? {
          id: raw.image?.id ?? 0,
          src: imageSrc.startsWith("/")
            ? imageSrc
            : toAbsoluteSiteUrl(imageSrc),
          alt: raw.image?.alt || "",
        }
      : null;

  return {
    id: raw.id,
    sku: raw.sku,
    price: raw.on_sale && salePrice !== null ? salePrice : price,
    regularPrice,
    salePrice: raw.on_sale ? salePrice : null,
    onSale: raw.on_sale,
    inStock:
      raw.stock_status === "instock" || raw.stock_status === "onbackorder",
    stockQuantity: raw.stock_quantity,
    attributes: raw.attributes.map((a) => ({
      id: a.id,
      name: a.name,
      option: a.option,
    })),
    image,
  };
}

export function mapProductVariations(raw: WcVariation[]): ProductVariation[] {
  return raw.map(mapProductVariation);
}
