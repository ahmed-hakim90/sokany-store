import "server-only";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants";
import {
  revalidateGranularProductAndCategoryTags,
  revalidateCategoryListingPathsAfterHook,
  revalidateProductListingPaths,
  revalidateWooDataTags,
  revalidateWooOrderTags,
  revalidateWooReviewTags,
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

function extractWooWebhookSlug(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const slug = (body as { slug?: unknown }).slug;
  return typeof slug === "string" && slug.trim() ? slug.trim() : undefined;
}

function extractWooWebhookCategorySlugs(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const categories = (body as { categories?: unknown }).categories;
  if (!Array.isArray(categories)) return [];
  const slugs = new Set<string>();
  for (const category of categories) {
    if (!category || typeof category !== "object") continue;
    const slug = (category as { slug?: unknown }).slug;
    if (typeof slug === "string" && slug.trim()) {
      slugs.add(slug.trim());
    }
  }
  return [...slugs];
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
  const t = (topic ?? "").toLowerCase().trim();

  if (t.startsWith("product_cat.")) {
    const categorySlug = extractWooWebhookSlug(payload);
    revalidateWooDataTags();
    revalidateGranularProductAndCategoryTags({
      categorySlugs: categorySlug ? [categorySlug] : [],
    });
    revalidateCategoryListingPathsAfterHook();
    return;
  }

  if (t.startsWith("product.")) {
    const productId = extractWooWebhookResourceId(payload);
    revalidateWooDataTags();
    revalidateGranularProductAndCategoryTags({
      productId,
      productSlug: extractWooWebhookSlug(payload),
      categorySlugs: extractWooWebhookCategorySlugs(payload),
    });
    revalidateProductListingPaths(productId);
    return;
  }

  if (t.startsWith("order.")) {
    revalidateWooOrderTags();
    revalidateWooReviewTags();
    revalidatePath(ROUTES.ORDER_TRACKING);
    revalidatePath(ROUTES.MY_ORDERS);
    revalidatePath(ROUTES.MY_REVIEWS);
    revalidatePath(ROUTES.ACCOUNT);
    return;
  }

  if (t.includes("review")) {
    revalidateWooReviewTags();
    return;
  }

  revalidateWooDataTags();
  revalidatePath("/products");
  revalidatePath("/offers");
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
