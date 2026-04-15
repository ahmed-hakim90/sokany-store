import { stripHtml } from "@/lib/html";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { Product, WCProduct } from "./types";

export type ProductView = {
  id: number;
  name: string;
  sku: string;
  price: string;
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
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: String(product.price),
    permalink: product.permalink,
    thumbnail: toAbsoluteSiteUrl(product.thumbnail),
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
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
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
