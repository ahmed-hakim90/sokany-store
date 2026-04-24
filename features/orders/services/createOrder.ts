import axios from "axios";
import { ZodError } from "zod";
import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mapOrder } from "@/features/orders/adapters";
import { mockOrders } from "@/features/orders/mock";
import { wpOrderSchema } from "@/schemas/wordpress";
import type { CreateOrderPayload, Order, WCOrder } from "@/features/orders/types";

function readApiErrorMessage(e: unknown): string | null {
  if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
    const d = e.response.data as { error?: unknown; message?: unknown };
    if (typeof d.error === "string" && d.error.trim()) return d.error;
    if (typeof d.message === "string" && d.message.trim()) return d.message;
  }
  return null;
}

function buildMockOrder(data: CreateOrderPayload): WCOrder {
  const base = mockOrders[0];
  const lineItems = data.line_items.map((item, index) => {
    const price = "0";
    return {
      id: index + 1,
      product_id: item.product_id,
      name: `Product #${item.product_id}`,
      quantity: item.quantity,
      price,
      total: price,
    };
  });

  return {
    ...base,
    id: Date.now(),
    billing: {
      ...base.billing,
      ...data.billing,
    },
    shipping: {
      ...base.shipping,
      ...data.shipping,
    },
    line_items: lineItems,
    payment_method: data.payment_method,
    payment_method_title: data.payment_method_title,
    customer_note: data.customer_note,
    meta_data: data.meta_data?.map((e) => ({ key: e.key, value: e.value })) ?? [],
  };
}

/** Expects a payload already validated with `createOrderPayloadSchema` (e.g. from `useCheckoutOrderMutation`). */
export async function createOrder(data: CreateOrderPayload): Promise<Order> {
  if (USE_MOCK) {
    return mapOrder(wpOrderSchema.parse(buildMockOrder(data)));
  }
  try {
    const response = await apiClient.post("/orders", data);
    return mapOrder(wpOrderSchema.parse(response.data));
  } catch (e) {
    const fromApi = readApiErrorMessage(e);
    if (fromApi) {
      throw new Error(fromApi);
    }
    if (e instanceof ZodError) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[createOrder] Zod parse failed for WooCommerce order response",
          e.flatten(),
          e.issues,
        );
      }
      throw new Error(
        "تعذر قراءة بيانات الطلب المُرجَعة من المتجر بعد إنشائه (شكل الرد غير متوقع).",
      );
    }
    throw e instanceof Error ? e : new Error("تعذر إكمال الطلب.");
  }
}
