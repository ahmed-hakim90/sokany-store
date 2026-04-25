import { z } from "zod";

/** Response from `GET /api/store/hotline` and WordPress `sokany/v1/hotline`. */
export const storeHotlineResponseSchema = z.object({
  hotline: z.string().trim().min(1).max(32),
});

export type StoreHotlineResponse = z.infer<typeof storeHotlineResponseSchema>;
