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
  wooCategorySlugTag,
  wooProductDetailTag,
  wooProductSlugTag,
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

export function revalidateGranularProductAndCategoryTags(input: {
  productId?: number;
  productSlug?: string;
  categorySlugs?: string[];
}): void {
  if (input.productId !== undefined && Number.isFinite(input.productId)) {
    revalidateTag(wooProductDetailTag(input.productId), "max");
  }
  if (input.productSlug?.trim()) {
    revalidateTag(wooProductSlugTag(input.productSlug), "max");
  }
  for (const slug of input.categorySlugs ?? []) {
    if (slug.trim()) revalidateTag(wooCategorySlugTag(slug), "max");
  }
}

/** PDP محدد قدر الإمكان؛ غياب id يرجع لقائمة المنتجات فقط كـ fallback. */
export function revalidateProductListingPaths(productId?: number): void {
  if (productId !== undefined && Number.isFinite(productId)) {
    revalidatePath(`/products/${productId}`);
    return;
  }
  revalidatePath("/products");
}

export function revalidateCategoryListingPathsAfterHook(): void {
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
