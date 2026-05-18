import type { Order } from "@/features/orders/types";
import { wcStatusToTracking } from "@/features/order-tracking/wc-status-to-tracking";

export function orderStatusPresentation(order: Order): { label: string; className: string } {
  const tracking = wcStatusToTracking(order.status);
  const { statusBadge, terminal } = tracking;

  if (terminal === "failed") {
    return {
      label: statusBadge,
      className: "bg-red-50 text-red-800 ring-1 ring-red-200/80",
    };
  }
  if (terminal === "cancelled" || terminal === "refunded") {
    return {
      label: statusBadge,
      className: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
    };
  }
  if (order.status === "completed") {
    return {
      label: statusBadge,
      className: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
    };
  }
  if (order.status === "processing" || order.status === "on-hold") {
    return {
      label: statusBadge,
      className: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
    };
  }
  return {
    label: statusBadge,
    className: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80",
  };
}
