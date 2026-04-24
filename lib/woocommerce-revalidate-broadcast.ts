import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";

/**
 * يبطل ‎`unstable_cache`‎ (منتجات + سايت-ماب Woo) — مُستخدَم من ويب هووك Woo
 * وويب هووك الـ API الخارجي.
 */
export function revalidateWooDataTags(): void {
  revalidateTag(WOO_CACHE_TAG_PRODUCTS, "max");
  revalidateTag(WOO_CACHE_TAG_SITEMAP, "max");
}

/** مسارات الكتالوج + صفحة منتج اختياري — بعد استدعاء ‎`revalidateWooDataTags`‎ من الـ hook. */
export function revalidateProductListingPaths(productId?: number): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/categories");
  if (productId !== undefined && Number.isFinite(productId)) {
    revalidatePath(`/products/${productId}`);
  }
}

export function revalidateCategoryListingPathsAfterHook(): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/categories", "page");
  revalidatePath("/categories", "layout");
}

/**
 * إبطال كاش ومسارات القوائم بعد **مصدر بيانات خارجي** (بدون ‎Woo topic‎).
 * لا يتضمّن ‎`productId`‎ — لإضافة ‎`id`‎ اختيارياً من جسم الـ JSON لاحقاً.
 */
export function revalidateAfterExternalDataWebhook(): void {
  revalidateWooDataTags();
  revalidateProductListingPaths();
}
