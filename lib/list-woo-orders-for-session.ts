import type { AxiosInstance } from "axios";
import type { WCOrder } from "@/features/orders/types";
import type { SessionJwtPayload } from "@/lib/jwt";

function orderHasFirebaseUid(order: WCOrder, firebaseUid: string): boolean {
  const meta = order.meta_data;
  if (!Array.isArray(meta)) return false;
  return meta.some(
    (m) => m.key === "firebase_uid" && String(m.value) === firebaseUid,
  );
}

/**
 * Lists WooCommerce orders for a storefront JWT session.
 * - WordPress-only sessions: by `customer` id from email (unchanged behaviour).
 * - Firebase sessions: merges orders for that WC customer with orders whose `meta_data` contains `firebase_uid`
 *   (covers guest checkouts that only stored Firebase linkage in order meta). Meta scan is paginated with a cap.
 */
export async function listWooOrdersForSession(
  woo: AxiosInstance,
  session: SessionJwtPayload,
  queryParams: Record<string, string>,
): Promise<unknown[]> {
  const customers = await woo.get("/customers", {
    params: { email: session.email, per_page: 1 },
  });
  const customerId = Array.isArray(customers.data)
    ? (customers.data as { id: number }[])[0]?.id
    : undefined;

  const byId = new Map<number, unknown>();

  if (customerId) {
    const response = await woo.get("/orders", {
      params: { ...queryParams, customer: customerId },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    for (const row of rows) {
      const o = row as WCOrder;
      if (typeof o.id === "number") byId.set(o.id, row);
    }
  }

  if (!session.firebaseUid) {
    return [...byId.values()];
  }

  const scanParams = { ...queryParams };
  delete scanParams.customer;

  const maxPages = 8;
  const perPage = 100;
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await woo.get("/orders", {
      params: {
        ...scanParams,
        per_page: String(perPage),
        page: String(page),
        orderby: scanParams.orderby ?? "date",
        order: scanParams.order ?? "desc",
      },
    });
    const batch = Array.isArray(response.data) ? response.data : [];
    for (const row of batch) {
      const o = row as WCOrder;
      if (
        typeof o.id === "number" &&
        orderHasFirebaseUid(o, session.firebaseUid) &&
        !byId.has(o.id)
      ) {
        byId.set(o.id, row);
      }
    }
    if (batch.length < perPage) break;
  }

  return [...byId.values()].sort((a, b) => {
    const da = new Date((a as WCOrder).date_created).getTime();
    const db = new Date((b as WCOrder).date_created).getTime();
    return db - da;
  });
}
