"use client";

import axios from "axios";
import { apiClient } from "@/lib/api";

export async function cancelSessionOrder(orderId: number): Promise<void> {
  try {
    await apiClient.post("/orders/cancel", { orderId });
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
      const msg = (e.response.data as { error?: string }).error;
      if (typeof msg === "string" && msg.trim()) throw new Error(msg);
    }
    throw e instanceof Error ? e : new Error("تعذر إلغاء الطلب.");
  }
}
