import axios from "axios";
import { apiClient } from "@/lib/api";
import type { CreateOrderPayload, Order } from "@/features/orders/types";

export type AmendGuestOrderBody = CreateOrderPayload & {
  orderId: number;
  orderKey: string;
};

export async function amendGuestOrder(body: AmendGuestOrderBody): Promise<Order> {
  try {
    const { data } = await apiClient.post<{ order: Order }>("/orders/guest/amend", body);
    if (!data?.order || typeof data.order.id !== "number") {
      throw new Error("تعذر قراءة الطلب بعد التحديث.");
    }
    return data.order;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
      const msg = (e.response.data as { error?: string }).error;
      if (typeof msg === "string" && msg.trim()) throw new Error(msg);
    }
    throw e instanceof Error ? e : new Error("تعذر تحديث الطلب.");
  }
}
