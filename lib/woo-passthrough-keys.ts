/**
 * Top-level keys validated in `wpProductSchema` (`schemas/wordpress.ts`).
 * Any other key on a parsed Woo product is copied to `Product.wooExcess`.
 */
export const WOO_V3_PRODUCT_SCHEMA_KEYS = new Set(
  [
    "id",
    "name",
    "slug",
    "permalink",
    "date_created",
    "date_modified",
    "type",
    "status",
    "featured",
    "catalog_visibility",
    "description",
    "short_description",
    "sku",
    "price",
    "regular_price",
    "sale_price",
    "on_sale",
    "purchasable",
    "total_sales",
    "virtual",
    "downloadable",
    "manage_stock",
    "stock_quantity",
    "stock_status",
    "backorders",
    "backorders_allowed",
    "backordered",
    "images",
    "categories",
    "tags",
    "attributes",
    "average_rating",
    "rating_count",
    "related_ids",
    "meta_data",
  ] as const,
);

/**
 * Keys on {@link wpCategorySchema} (Woo: products/categories).
 */
export const WOO_V3_CATEGORY_SCHEMA_KEYS = new Set(
  [
    "id",
    "name",
    "slug",
    "description",
    "display",
    "image",
    "parent",
    "count",
    "_links",
  ] as const,
);

/**
 * Top-level order keys in {@link wpOrderSchema} + {@link orderMetaData} column.
 */
export const WOO_V3_ORDER_SCHEMA_KEYS = new Set(
  [
    "id",
    "order_key",
    "status",
    "date_created",
    "total",
    "subtotal",
    "total_tax",
    "shipping_total",
    "currency",
    "line_items",
    "billing",
    "shipping",
    "payment_method",
    "payment_method_title",
    "customer_note",
    "meta_data",
  ] as const,
);

/** Matches `wpOrderLineItemSchema` in `schemas/wordpress.ts` (price/total + optional image). */
export const WOO_V3_ORDER_LINE_ITEM_SCHEMA_KEYS = new Set(
  [
    "id",
    "name",
    "product_id",
    "variation_id",
    "quantity",
    "price",
    "total",
    "image",
  ] as const,
);

/** Keys not in `excess` — for building `Record` of unmodeled top-level API fields. */
export function pickWooExcess(
  record: object,
  known: ReadonlySet<string>,
): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (!known.has(k)) {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
