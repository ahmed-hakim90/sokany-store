import type { OrderConfirmationSessionPayload } from "@/features/checkout/types";

const ORDER_CONFIRMATION_SESSION_PREFIX = "order_confirmation_";

export function getOrderConfirmationSessionKey(orderId: number | string): string {
  return `${ORDER_CONFIRMATION_SESSION_PREFIX}${orderId}`;
}

export function saveOrderConfirmationSession(
  payload: OrderConfirmationSessionPayload,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    getOrderConfirmationSessionKey(payload.order.id),
    JSON.stringify(payload),
  );
}

export function readOrderConfirmationSession(
  orderId: number | string,
): OrderConfirmationSessionPayload | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(getOrderConfirmationSessionKey(orderId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<OrderConfirmationSessionPayload>;
    if (parsed.order && parsed.snapshot) {
      return parsed as OrderConfirmationSessionPayload;
    }
  } catch {
    return null;
  }

  return null;
}
