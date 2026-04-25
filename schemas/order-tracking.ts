import { z } from "zod";

export const trackOrderFoundSchema = z.object({
  found: z.literal(true),
  orderId: z.number(),
  query: z.string(),
  dateCreated: z.string(),
  currentStepIndex: z.number().int().min(0).max(3),
  allCompleted: z.boolean(),
  terminal: z.enum(["cancelled", "refunded", "failed"]).nullable(),
  statusBadge: z.string(),
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
