import type { Order } from "@/features/orders/types";
import { wcStatusToTracking } from "@/features/order-tracking/wc-status-to-tracking";

export function orderStatusPresentation(order: Order): { label: string; className: string } {
  const { statusBadge } = wcStatusToTracking(order.status);
  const completed = order.status === "completed";
  return {
    label: statusBadge,
    className: completed
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
      : "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
  };
}
