import { apiClient } from "@/lib/api";
import {
  trackOrderResponseSchema,
  type TrackOrderResponse,
} from "@/schemas/order-tracking";

export async function trackOrder(q: string): Promise<TrackOrderResponse> {
  const response = await apiClient.get("/orders/track", {
    params: { q: q.trim() },
  });
  return trackOrderResponseSchema.parse(response.data);
}
