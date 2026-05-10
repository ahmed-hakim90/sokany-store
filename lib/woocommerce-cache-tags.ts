/**
 * وسوم كاش Woo في Next
 * بالعامية: أسماء ثابتة بنربط بيها `unstable_cache`؛ لما ييجي ويبهوك أو تحديث بنعمل `revalidateTag` بنفس الاسم.
 *
 * ملاحظات:
 * - ليه tags: تفريق إبطال (منتجات vs طلبات vs تقييمات) من غير ما نمسح كل حاجة.
 * - حذر: غيّر الاسم هنا لازم يتغيّر في كل `unstable_cache` المربوطة.
 * - شوف كمان: `@/lib/woocommerce-revalidate-broadcast.ts`
 */
export const WOO_CACHE_TAG_PRODUCTS = "woo-products";
/** وسوم المنتجات في لوحة التحكم (اقتراحات البحث السريع). */
export const WOO_CACHE_TAG_PRODUCT_TAGS = "woo-product-tags";
export const WOO_CACHE_TAG_SITEMAP = "sitemap-woo";
export const WOO_CACHE_TAG_ORDERS = "woo-orders";
export const WOO_CACHE_TAG_REVIEWS = "woo-reviews";
