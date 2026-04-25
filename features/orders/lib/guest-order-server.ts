import type { AxiosInstance } from "axios";
import type { z } from "zod";
import { mapOrder } from "@/features/orders/adapters";
import type { Order } from "@/features/orders/types";
import { GUEST_ORDER_AMEND_ENABLED } from "@/lib/constants";
import { wpOrderSchema } from "@/schemas/wordpress";

export type WCOrderParsed = z.infer<typeof wpOrderSchema>;

/** Two-hour amend/cancel window from Woo order creation time. */
export const GUEST_AMEND_WINDOW_MS = 2 * 60 * 60 * 1000;

/** حالات «انتهى الطلب» — لا تعديل ضيف بعدها. */
const GUEST_AMEND_BLOCKED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "refunded",
  "failed",
  "completed",
  "trash",
]);

export type GuestOrderTimingInput = {
  date_created: string;
  date_created_gmt?: string;
};

function normalizeWooOrderStatus(status: string): string {
  let s = status.trim().toLowerCase();
  if (s.startsWith("wc-")) s = s.slice(3);
  return s;
}

/** أقرب وقت إنشاء معروف من استجابة ووكومرس (يفضّل GMT). */
export function orderCreatedTimestampMs(order: GuestOrderTimingInput): number | null {
  const tryParse = (raw: string | undefined): number | null => {
    const s = raw?.trim();
    if (!s) return null;
    let t = Date.parse(s);
    if (Number.isFinite(t)) return t;
    /* Woo أحياناً يرسل ‎"YYYY-MM-DD HH:MM:SS"‎ بلا ‎T‎ */
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
      t = Date.parse(s.replace(" ", "T"));
      if (Number.isFinite(t)) return t;
    }
    return null;
  };

  return tryParse(order.date_created_gmt) ?? tryParse(order.date_created);
}

export function orderWithinGuestAmendWindow(order: GuestOrderTimingInput): boolean {
  const t = orderCreatedTimestampMs(order);
  if (t == null) return false;
  return Date.now() - t <= GUEST_AMEND_WINDOW_MS;
}

/**
 * إلغاء الضيف (ضمن النافذة الزمنية): ‎pending‎ / ‎on-hold‎ / ‎processing‎ —
 * ووكومرس يحرّك الطلب لـ ‎processing‎ بسرعة فكان زر «إلغاء» يختفي رغم أن الطلب لسه «مفتوح» للعميل.
 */
export function statusAllowsGuestCancel(status: string): boolean {
  const s = normalizeWooOrderStatus(status);
  return s === "pending" || s === "on-hold" || s === "processing";
}

/**
 * تعديل طلب الضيف: أي حالة ليست نهائية (مكتمل/ملغى/مرجع…) — يغطي ‎processing‎ وحالات مخصصة من إضافات ووكومرس.
 */
export function statusAllowsGuestAmend(status: string): boolean {
  const s = normalizeWooOrderStatus(status);
  if (!s) return false;
  return !GUEST_AMEND_BLOCKED_STATUSES.has(s);
}

export function guestOrderActionEligibility(order: {
  status: string;
  date_created: string;
  date_created_gmt?: string;
}): {
  canCancel: boolean;
  canAmend: boolean;
} {
  const timing: GuestOrderTimingInput = {
    date_created: order.date_created,
    date_created_gmt: order.date_created_gmt,
  };
  const inWindow = orderWithinGuestAmendWindow(timing);
  return {
    canCancel: statusAllowsGuestCancel(order.status) && inWindow,
    canAmend: statusAllowsGuestAmend(order.status) && inWindow,
  };
}

export class GuestOrderAccessError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GuestOrderAccessError";
  }
}

export async function fetchAndVerifyGuestOrder(
  woo: AxiosInstance,
  orderId: number,
  orderKey: string,
): Promise<WCOrderParsed> {
  if (!orderKey?.trim()) {
    throw new GuestOrderAccessError("مفتاح الطلب غير صالح.", 400);
  }
  const res = await woo.get(`/orders/${orderId}`);
  const order = wpOrderSchema.parse(res.data);
  if (order.order_key !== orderKey) {
    throw new GuestOrderAccessError("تعذر التحقق من الطلب.", 403);
  }
  return order;
}

export function mapGuestViewResponse(order: z.infer<typeof wpOrderSchema>): {
  order: Order;
  canCancel: boolean;
  canAmend: boolean;
} {
  const actions = guestOrderActionEligibility({
    status: order.status,
    date_created: order.date_created,
    date_created_gmt: order.date_created_gmt,
  });
  return {
    order: mapOrder(order),
    canCancel: actions.canCancel,
    canAmend: GUEST_ORDER_AMEND_ENABLED && actions.canAmend,
  };
}
