import "server-only";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants";
import {
  revalidateCategoryListingPathsAfterHook,
  revalidateProductListingPaths,
  revalidateWooDataTags,
  revalidateWooOrderTags,
} from "@/lib/woocommerce-revalidate-broadcast";

/**
 * مُستخرَج من جسم الـ Webhook (منتج / تصنيف) — ‎`id`‎ لعدد صحيح.
 */
export function extractWooWebhookResourceId(body: unknown): number | undefined {
  if (!body || typeof body !== "object") return undefined;
  const id = (body as { id?: unknown }).id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string") {
    const n = Number(id);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * بعد ‎`POST`‎ مُوثّق لـ ‎`/api/webhooks/woocommerce`‎.
 *
 * - ‎`product.*`‎ (مثلاً ‎`product.updated`‎): تغيير سعر، كمية، جديد/محذوف — يعيد توليد الصفحات + كاش الـ API.
 * - ‎`product_cat.*`‎: تصنيفات + سايت-ماب.
 * - الاستعلام على العميل (TanStack Query) له ‎`staleTime`‎ — قد يلزم تنقّل أو إعادة تحميل لرؤية فورية.
 */
export function revalidateAfterWooCommerceWebhook(
  topic: string | null,
  payload: unknown,
): void {
  revalidateWooDataTags();

  const t = (topic ?? "").toLowerCase().trim();

  if (t.startsWith("product_cat.")) {
    revalidateCategoryListingPathsAfterHook();
    return;
  }

  if (t.startsWith("product.")) {
    revalidateProductListingPaths(extractWooWebhookResourceId(payload));
    return;
  }

  if (t.startsWith("order.")) {
    revalidateWooOrderTags();
    revalidatePath(ROUTES.ORDER_TRACKING);
    revalidatePath(ROUTES.MY_ORDERS);
    revalidatePath(ROUTES.MY_REVIEWS);
    revalidatePath(ROUTES.ACCOUNT);
    revalidatePath("/");
    return;
  }

  revalidatePath("/products");
  revalidatePath("/categories");
}

/**
 * @deprecated استخدم ‎`revalidateAfterWooCommerceWebhook`‎. مُبقاة لتوافق اختبارات/
 * استدعاءات قديمة.
 */
export function revalidateAfterProductWebhook(productId?: number): void {
  revalidateWooDataTags();
  revalidateProductListingPaths(productId);
}
