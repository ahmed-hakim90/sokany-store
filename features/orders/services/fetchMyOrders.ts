"use client";

import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mapOrders } from "@/features/orders/adapters";
import { mockOrders } from "@/features/orders/mock";
import type { Order } from "@/features/orders/types";
import { wpOrdersSchema } from "@/schemas/wordpress";

export async function fetchMyOrders(): Promise<Order[]> {
  if (USE_MOCK) {
    return mapOrders(mockOrders);
  }
  const response = await apiClient.get("/orders", {
    params: {
      orderby: "date",
      order: "desc",
      per_page: 50,
    },
  });
  const parsed = wpOrdersSchema.parse(response.data);
  return mapOrders(parsed);
}
