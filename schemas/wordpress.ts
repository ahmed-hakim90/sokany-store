import { z } from "zod";

const emptyString = z.string().default("");
const numericString = z.string().default("0");

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
});

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
});

const wpBillingSchema = z.object({
  first_name: emptyString,
  last_name: emptyString,
  company: emptyString,
  address_1: emptyString,
  address_2: emptyString,
  city: emptyString,
  state: emptyString,
  postcode: emptyString,
  country: emptyString,
  email: emptyString,
  phone: emptyString,
});

const wpShippingSchema = z.object({
  first_name: emptyString,
  last_name: emptyString,
  company: emptyString,
  address_1: emptyString,
  address_2: emptyString,
  city: emptyString,
  state: emptyString,
  postcode: emptyString,
  country: emptyString,
});

export const wpOrderLineItemSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  name: z.string(),
  quantity: z.number(),
  price: numericString,
  total: numericString,
  image: z
    .object({
      src: z.string().url(),
    })
    .optional(),
});

export const wpOrderSchema = z.object({
  id: z.number(),
  status: z.string(),
  date_created: z.string(),
  total: numericString,
  subtotal: numericString,
  total_tax: numericString,
  shipping_total: numericString,
  currency: z.string(),
  line_items: z.array(wpOrderLineItemSchema).default([]),
  billing: wpBillingSchema,
  shipping: wpShippingSchema,
  payment_method: emptyString,
  payment_method_title: emptyString,
  customer_note: emptyString,
});

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
