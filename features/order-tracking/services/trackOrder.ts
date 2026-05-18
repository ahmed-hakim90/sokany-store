import { apiClient } from "@/lib/api";
import {
  trackOrderResponseSchema,
  type TrackOrderResponse,
} from "@/schemas/order-tracking";
import { listGuestOrderRefs } from "@/features/orders/lib/local-guest-orders-storage";

function localOrderKeyForQuery(q: string): string | null {
  const id = Number(q.trim());
  if (!Number.isInteger(id) || id <= 0) return null;
  return listGuestOrderRefs().find((ref) => ref.id === id)?.orderKey ?? null;
}

export async function trackOrder(q: string, orderKeyHint?: string): Promise<TrackOrderResponse> {
  const orderKey = orderKeyHint?.trim() || localOrderKeyForQuery(q);
  const response = await apiClient.get("/orders/track", {
    params: { q: q.trim(), ...(orderKey ? { k: orderKey } : {}) },
  });
  return trackOrderResponseSchema.parse(response.data);
}
