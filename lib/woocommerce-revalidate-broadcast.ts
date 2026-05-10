import "server-only";

/**
 * إبطال كاش Next بعد تحديث Woo
 * بالعامية: لما البيانات تتغيّر (ويبهوك أو مصدر خارجي) بننادي `revalidateTag` و`revalidatePath` علشان الصفحات والـ RSC يتبنوا من جديد.
 *
 * ملاحظات:
 * - ليه path + tag: التاج يفضي كاش `unstable_cache`؛ المسار يحدّث صفحات App Router الظاهرة.
 * - حذر: زود paths بحذر — كل `revalidatePath` تكلفة بناء/ISR.
 * - شوف كمان: `@/app/api/webhooks/woocommerce/route.ts`، `@/lib/woocommerce-cache-tags.ts`
 */
import { revalidatePath, revalidateTag } from "next/cache";
import {
  WOO_CACHE_TAG_ORDERS,
  WOO_CACHE_TAG_PRODUCT_TAGS,
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_REVIEWS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";

/** منتجات + تاجات + سايت ماب Woo — من ويبهوك Woo أو بيانات خارجية. */
export function revalidateWooDataTags(): void {
  revalidateTag(WOO_CACHE_TAG_PRODUCTS, "max");
  revalidateTag(WOO_CACHE_TAG_PRODUCT_TAGS, "max");
  revalidateTag(WOO_CACHE_TAG_SITEMAP, "max");
}

export function revalidateWooOrderTags(): void {
  revalidateTag(WOO_CACHE_TAG_ORDERS, "max");
}

export function revalidateWooReviewTags(): void {
  revalidateTag(WOO_CACHE_TAG_REVIEWS, "max");
}

/** صفحات القوائم الرئيسية + اختياري `/products/[id]` بعد ما التاجات تتشال. */
export function revalidateProductListingPaths(productId?: number): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/offers");
  revalidatePath("/search");
  revalidatePath("/categories");
  if (productId !== undefined && Number.isFinite(productId)) {
    revalidatePath(`/products/${productId}`);
  }
}

export function revalidateCategoryListingPathsAfterHook(): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/offers");
  revalidatePath("/search");
  revalidatePath("/categories", "page");
  revalidatePath("/categories", "layout");
}

/** مصدر خارجي مش Woo topic — بنعمم إبطال أوسع (منتجات/طلبات/تقييمات + قوائم). */
export function revalidateAfterExternalDataWebhook(): void {
  revalidateWooDataTags();
  revalidateWooOrderTags();
  revalidateWooReviewTags();
  revalidateProductListingPaths();
}
