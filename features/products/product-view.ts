import { stripHtml } from "@/lib/html";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { Product, WCProduct } from "./types";

export type ProductView = {
  id: number;
  name: string;
  sku: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  productType: string;
  permalink: string;
  thumbnail: string;
  images: { src: string; alt: string }[];
  shortDescriptionPlain: string;
  descriptionPlain: string;
  inStock: boolean;
  rating: number;
  ratingCount: number;
};

export function toProductViewFromProduct(product: Product): ProductView {
  const t = product.thumbnail.trim();
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: String(product.price),
    regularPrice: String(product.regularPrice),
    salePrice: product.salePrice != null ? String(product.salePrice) : null,
    onSale: product.onSale,
    productType: product.productType,
    permalink: product.permalink,
    thumbnail: t ? toAbsoluteSiteUrl(product.thumbnail) : "",
    images: product.images.map((img) => ({
      src: toAbsoluteSiteUrl(img.src),
      alt: img.alt,
    })),
    shortDescriptionPlain: product.shortDescription,
    descriptionPlain: product.description || product.shortDescription,
    inStock: product.inStock,
    rating: product.rating,
    ratingCount: product.ratingCount,
  };
}

export function toProductView(product: WCProduct): ProductView {
  const shortPlain = stripHtml(product.short_description);
  const descPlain = stripHtml(product.description);
  const salePriceRaw = product.sale_price.trim();
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    regularPrice: product.regular_price,
    salePrice: salePriceRaw.length > 0 ? salePriceRaw : null,
    onSale: product.on_sale,
    productType: product.type?.trim() || "simple",
    permalink: product.permalink,
    thumbnail: toAbsoluteSiteUrl(
      product.images[0]?.src ?? "/images/placeholder.png",
    ),
    images: product.images.map((img) => ({
      src: toAbsoluteSiteUrl(img.src),
      alt: img.alt,
    })),
    shortDescriptionPlain: shortPlain,
    descriptionPlain: descPlain || shortPlain,
    inStock: product.stock_status === "instock",
    rating: Number.parseFloat(product.average_rating) || 0,
    ratingCount: product.rating_count,
  };
}
