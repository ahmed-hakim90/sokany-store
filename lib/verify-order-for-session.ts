/**
 * التأكد إن الطلب للمستخدم الحالي
 * بالعامية: نفس فكرة `listWooOrdersForSession` — يا إما `customer_id` يطابق عميل Woo بالإيميل، يا إما الـ meta فيها `firebase_uid` بتاع الجلسة.
 *
 * ملاحظات:
 * - ليه مش بس customer_id: فيه مسارات ضيف خلت الربط في الميتا بس.
 * - شوف كمان: `@/lib/list-woo-orders-for-session.ts`
 */
import type { AxiosInstance } from "axios";
import type { z } from "zod";
import { GuestOrderAccessError } from "@/features/orders/lib/guest-order-server";
import type { SessionJwtPayload } from "@/lib/jwt";
import { wpOrderSchema } from "@/schemas/wordpress";

type WCOrderParsed = z.infer<typeof wpOrderSchema> & { customer_id?: number };

function orderHasFirebaseUid(order: WCOrderParsed, firebaseUid: string): boolean {
  const meta = order.meta_data;
  if (!Array.isArray(meta)) return false;
  return meta.some(
    (m) => m.key === "firebase_uid" && String(m.value) === firebaseUid,
  );
}

export async function assertOrderAccessibleBySession(
  woo: AxiosInstance,
  session: SessionJwtPayload,
  order: WCOrderParsed,
): Promise<void> {
  const customers = await woo.get("/customers", {
    params: { email: session.email, per_page: 1 },
  });
  const wcUserId = Array.isArray(customers.data)
    ? (customers.data as { id: number }[])[0]?.id
    : undefined;

  const cid = typeof order.customer_id === "number" ? order.customer_id : 0;
  if (wcUserId && cid > 0 && cid === wcUserId) {
    return;
  }
  if (session.firebaseUid && orderHasFirebaseUid(order, session.firebaseUid)) {
    return;
  }
  throw new GuestOrderAccessError("تعذر التحقق من الطلب.", 403);
}
