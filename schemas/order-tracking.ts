import { z } from "zod";

const trackOrderItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
  image: z.string(),
});

const trackOrderShippingSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
});

const trackOrderCarrierSchema = z.object({
  name: z.string(),
  trackingNumber: z.string(),
  trackingUrl: z.string(),
});

export const trackOrderFoundSchema = z.object({
  found: z.literal(true),
  orderId: z.number(),
  orderNumber: z.string(),
  query: z.string(),
  dateCreated: z.string(),
  currentStepIndex: z.number().int().min(0).max(4),
  allCompleted: z.boolean(),
  terminal: z.enum(["cancelled", "refunded", "failed"]).nullable(),
  statusBadge: z.string(),
  paymentMethodTitle: z.string(),
  subtotal: z.number(),
  shippingTotal: z.number(),
  total: z.number(),
  discount: z.number(),
  items: z.array(trackOrderItemSchema).optional(),
  shipping: trackOrderShippingSchema.optional(),
  carrier: trackOrderCarrierSchema.optional(),
  source: z.enum(["woocommerce", "mock"]),
});

export const trackOrderNotFoundSchema = z.object({
  found: z.literal(false),
});

export const trackOrderResponseSchema = z.discriminatedUnion("found", [
  trackOrderFoundSchema,
  trackOrderNotFoundSchema,
]);

export type TrackOrderResponse = z.infer<typeof trackOrderResponseSchema>;
