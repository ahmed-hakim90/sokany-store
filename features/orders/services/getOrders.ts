import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mapOrders } from "@/features/orders/adapters";
import { mockOrders } from "@/features/orders/mock";
import { wpOrdersSchema } from "@/schemas/wordpress";
import type { Order } from "@/features/orders/types";

export async function getOrders(): Promise<Order[]> {
  if (USE_MOCK) {
    return mapOrders(wpOrdersSchema.parse(mockOrders));
  }
  const response = await apiClient.get("/orders");
  return mapOrders(wpOrdersSchema.parse(response.data));
}
