import { normalizeProductDescriptionSource } from "@/lib/html";
import { parsePrice, stripHtml } from "@/lib/utils";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { Product, WCProduct } from "@/features/products/types";

const PLACEHOLDER_PATH = "/images/placeholder.png";

export function mapProduct(raw: WCProduct): Product {
  const price = parsePrice(raw.price);
  const regularPrice = parsePrice(raw.regular_price);
  const salePriceRaw = raw.sale_price.trim();
  const salePrice =
    salePriceRaw.length > 0 ? parsePrice(salePriceRaw) : null;
  const rating = Number.parseFloat(raw.average_rating);
  const normalizeImageSrc = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return PLACEHOLDER_PATH;
    // Keep local snapshot paths (`/images/...`) as-is so they always resolve on
    // the current host/environment.
    if (trimmed.startsWith("/")) return trimmed;
    return toAbsoluteSiteUrl(trimmed);
  };

  const images = raw.images.map((img) => ({
    id: img.id,
    src: normalizeImageSrc(img.src),
    alt: img.alt || raw.name,
  }));
  const thumbnail = images[0]?.src ?? PLACEHOLDER_PATH;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: normalizeProductDescriptionSource(raw.description),
    shortDescription: normalizeProductDescriptionSource(raw.short_description),
    sku: raw.sku,
    price: raw.on_sale && salePrice !== null ? salePrice : price,
    regularPrice,
    salePrice: raw.on_sale ? salePrice : null,
    onSale: raw.on_sale,
    inStock:
      raw.stock_status === "instock" || raw.stock_status === "onbackorder",
    stockQuantity: raw.stock_quantity,
    featured: raw.featured,
    images,
    thumbnail,
    categories: raw.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    rating: Number.isFinite(rating) ? rating : 0,
    ratingCount: raw.rating_count,
    permalink: raw.permalink,
    tags: raw.tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    })),
    attributes: raw.attributes.map((a) => ({
      id: a.id,
      name: a.name,
      position: a.position,
      visible: a.visible,
      variation: a.variation,
      options: [...a.options],
    })),
    relatedIds: raw.related_ids ?? [],
  };
}

export function mapProducts(raw: WCProduct[]): Product[] {
  return raw.map(mapProduct);
}
