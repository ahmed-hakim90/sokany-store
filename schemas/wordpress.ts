import { z } from "zod";

const emptyString = z.string().default("");
const numericString = z.string().default("0");

/**
 * WooCommerce order/customer REST payloads often use `null` for empty strings.
 * Plain `z.string().default("")` only treats missing keys as default, not `null`.
 * Some API surfaces return numbers/booleans for fields documented as string — coerce.
 */
const wooStringField = z.preprocess(
  (v) => {
    if (v == null || v === undefined) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v);
  },
  z.string(),
);

/**
 * Order totals/line items: WC returns decimal strings, but some plugins/versions
 * may return numbers; coerce to string for the rest of the pipeline.
 */
const wooOrderNumericString = z.preprocess(
  (v) => {
    if (v == null || v === undefined) return "0";
    if (typeof v === "number" && !Number.isNaN(v)) return String(v);
    if (typeof v === "string") return v;
    return "0";
  },
  z.string(),
);

// Accepts either an absolute URL (live WooCommerce response) or an absolute
// path beginning with "/" (snapshot loader after rewriting to local assets
// under public/images/sokany-eg/**). Both are valid inputs for next/image
// via the AppImage wrapper.
const imageSourceSchema = z.string().refine(
  (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
  { message: "Image src must be an absolute URL or a path starting with '/'." },
);

export const wpImageSchema = z.object({
  id: z.number(),
  src: imageSourceSchema,
  name: emptyString,
  alt: emptyString,
});

export const wpCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: emptyString.default(""),
  display: emptyString.default("default"),
  image: wpImageSchema
    .pick({ id: true, src: true, alt: true })
    .nullish()
    .transform((value) => value ?? null),
  parent: z.number().default(0),
  count: z.number().default(0),
  _links: z.record(z.string(), z.unknown()).default({}),
})
  .passthrough();

export const wpProductTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const wpProductAttributeSchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.number().default(0),
  visible: z.boolean().default(false),
  variation: z.boolean().default(false),
  options: z.array(z.string()).default([]),
});

export const wpProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  permalink: z.string().url(),
  date_created: z.string(),
  date_modified: z.string(),
  type: z.string(),
  status: z.string(),
  featured: z.boolean(),
  catalog_visibility: z.string(),
  description: emptyString,
  short_description: emptyString,
  sku: emptyString,
  price: numericString,
  regular_price: numericString,
  sale_price: emptyString,
  on_sale: z.boolean(),
  purchasable: z.boolean(),
  total_sales: z.number().default(0),
  virtual: z.boolean().default(false),
  downloadable: z.boolean().default(false),
  manage_stock: z.boolean().default(false),
  stock_quantity: z.number().nullable().default(null),
  stock_status: z.enum(["instock", "outofstock", "onbackorder"]),
  backorders: emptyString,
  backorders_allowed: z.boolean().default(false),
  backordered: z.boolean().default(false),
  images: z.array(wpImageSchema).default([]),
  categories: z.array(wpProductTagSchema).default([]),
  tags: z.array(wpProductTagSchema).default([]),
  attributes: z.array(wpProductAttributeSchema).default([]),
  average_rating: numericString,
  rating_count: z.number().default(0),
  /** WooCommerce «Linked products» — upsells/related IDs from the REST product payload. */
  related_ids: z.array(z.number()).default([]),
  meta_data: z.array(z.unknown()).default([]),
})
  .passthrough();

const wpBillingSchema = z.object({
  first_name: wooStringField,
  last_name: wooStringField,
  company: wooStringField,
  address_1: wooStringField,
  address_2: wooStringField,
  city: wooStringField,
  state: wooStringField,
  postcode: wooStringField,
  country: wooStringField,
  email: wooStringField,
  phone: wooStringField,
});

const wpShippingSchema = z.object({
  first_name: wooStringField,
  last_name: wooStringField,
  company: wooStringField,
  address_1: wooStringField,
  address_2: wooStringField,
  city: wooStringField,
  state: wooStringField,
  postcode: wooStringField,
  country: wooStringField,
});

/**
 * Line item `image`: WC may omit, use `[]`, or send `src` as any path (not only
 * absolute URL or `/...` as in catalog images) — do not reuse `imageSourceSchema`.
 */
const wooOrderLineItemImageSrcSchema = z.preprocess(
  (v) => {
    if (v == null || v === "") return "/images/placeholder.png";
    const s = String(v).trim();
    if (!s) return "/images/placeholder.png";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("//")) return `https:${s}`;
    if (s.startsWith("/")) return s;
    return s;
  },
  z.string().min(1),
);

const wpOrderLineItemImageSchema = z
  .object({
    id: z.coerce.number().optional(),
    src: wooOrderLineItemImageSrcSchema,
  })
  .passthrough();

function normalizeWooLineItemImageInput(v: unknown): unknown {
  if (v == null || v === false) return undefined;
  if (Array.isArray(v)) {
    if (v.length === 0) return undefined;
    const first = v[0];
    if (first && typeof first === "object" && !Array.isArray(first)) return first;
    return undefined;
  }
  if (typeof v === "string") {
    const t = v.trim();
    return t ? { src: t } : undefined;
  }
  return v;
}

export const wpOrderLineItemSchema = z
  .object({
    id: z.coerce.number(),
    product_id: z.coerce.number(),
    /** 0 = بسيط؛ غير 0 = معرّف المتغير (الـ parent في ‎`product_id`‎). */
    variation_id: z.coerce.number().optional().default(0),
    name: wooStringField,
    quantity: z.coerce.number(),
    price: wooOrderNumericString,
    total: wooOrderNumericString,
    image: z.preprocess(
      (v) => {
        const n = normalizeWooLineItemImageInput(v);
        if (n == null) return undefined;
        return n;
      },
      wpOrderLineItemImageSchema.optional(),
    ),
  })
  .passthrough();

const wpOrderMetaEntrySchema = z.object({
  key: z.string(),
  value: z.unknown(),
});

export const wpOrderSchema = z.object({
  id: z.coerce.number(),
  status: wooStringField,
  date_created: wooStringField,
  total: wooOrderNumericString,
  subtotal: wooOrderNumericString,
  total_tax: wooOrderNumericString,
  shipping_total: wooOrderNumericString,
  currency: wooStringField,
  line_items: z.array(wpOrderLineItemSchema).default([]),
  billing: wpBillingSchema,
  shipping: wpShippingSchema,
  payment_method: wooStringField,
  payment_method_title: wooStringField,
  customer_note: wooStringField,
  meta_data: z.array(wpOrderMetaEntrySchema).nullish().default([]),
})
  .passthrough();

export const createOrderPayloadSchema = z.object({
  billing: wpBillingSchema,
  shipping: wpShippingSchema,
  line_items: z.array(
    z.object({
      product_id: z.number(),
      quantity: z.number().int().positive(),
    }),
  ),
  shipping_lines: z
    .array(
      z.object({
        method_id: z.string(),
        method_title: z.string(),
        total: z.string().optional(),
      }),
    )
    .optional(),
  payment_method: z.string(),
  payment_method_title: z.string(),
  customer_note: emptyString,
  set_paid: z.boolean().optional(),
  /** WooCommerce customer id — links the order to the registered shopper. */
  customer_id: z.number().int().positive().optional(),
  meta_data: z
    .array(
      z.object({
        key: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .optional(),
});

export const wpReviewSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  status: z.string(),
  reviewer: z.string(),
  reviewer_email: z.string(),
  review: z.string(),
  rating: z.number(),
  verified: z.boolean(),
  date_created: z.string(),
});

export const createReviewPayloadSchema = z.object({
  product_id: z.number(),
  review: z.string().min(1),
  reviewer: z.string().min(1),
  reviewer_email: z.string().email(),
  rating: z.number().min(1).max(5),
});

export const reviewEligibilityResponseSchema = z.object({
  canReview: z.boolean(),
  mustLogin: z.boolean(),
  alreadyReviewed: z.boolean(),
});

export const wpUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: emptyString,
  last_name: emptyString,
  username: z.string(),
  avatar_url: z.string().url().optional(),
  billing: wpBillingSchema,
  shipping: wpShippingSchema,
});

export const wpProductsSchema = z.array(wpProductSchema);
export const wpCategoriesSchema = z.array(wpCategorySchema);
export const wpOrdersSchema = z.array(wpOrderSchema);
export const wpReviewsSchema = z.array(wpReviewSchema);
