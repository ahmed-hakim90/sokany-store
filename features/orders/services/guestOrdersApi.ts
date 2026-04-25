import axios from "axios";
import { apiClient } from "@/lib/api";
import type { Order } from "@/features/orders/types";
import type { GuestOrderRef } from "@/features/orders/lib/local-guest-orders-storage";

export type GuestBatchViewOk = {
  orderId: number;
  order: Order;
  canCancel: boolean;
  canAmend: boolean;
};

export type GuestBatchViewRow =
  | GuestBatchViewOk
  | { orderId: number; error: "forbidden" | "not_found" };

export async function fetchGuestOrdersBatch(refs: GuestOrderRef[]): Promise<GuestBatchViewRow[]> {
  if (refs.length === 0) return [];
  try {
    const { data } = await apiClient.post<{ results: GuestBatchViewRow[] }>(
      "/orders/guest/batch-view",
      {
        refs: refs.map((r) => ({ orderId: r.id, orderKey: r.orderKey })),
      },
    );
    return Array.isArray(data.results) ? data.results : [];
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 400) return [];
    throw e instanceof Error ? e : new Error("تعذر تحميل الطلبات.");
  }
}

export async function cancelGuestOrder(orderId: number, orderKey: string): Promise<void> {
  try {
    await apiClient.post("/orders/guest/cancel", { orderId, orderKey });
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
      const msg = (e.response.data as { error?: string }).error;
      if (typeof msg === "string" && msg.trim()) throw new Error(msg);
    }
    throw e instanceof Error ? e : new Error("تعذر إلغاء الطلب.");
  }
}
