# Caching strategy — Sokany Store

## العربية

هناك **طبقات** مختلفة: (1) كاش Next.js (`unstable_cache` + `revalidateTag`) لبيانات Woo وCMS على الخادم، (2) **`export const revalidate`** على بعض صفحات App Router، (3) رؤوس **HTTP** لأصول ثابتة في `next.config.ts`، (4) كاش **Service Worker** للمتصفح (API شبكة-أولاً، أصول ثابتة، صور خارجية stale-while-revalidate) — انظر [`docs/pwa-behavior.md`](pwa-behavior.md).

**صيانة:** عند إضافة `unstable_cache` جديد لبيانات Woo، استخدم وسومًا من [`lib/woocommerce-cache-tags.ts`](../lib/woocommerce-cache-tags.ts) واربط الإبطال بـ [`lib/woocommerce-revalidate-broadcast.ts`](../lib/woocommerce-revalidate-broadcast.ts) أو ويبهوك Woo.

---

## English — Next.js Data Cache (`unstable_cache`)

### CMS bundle

- [`features/cms/services/getPublicSiteContent.ts`](../features/cms/services/getPublicSiteContent.ts): `getCachedPublicSiteContent` with `revalidate: 60`, tag **`CMS_CACHE_TAG`** (`"storefront-cms"`).
- Invalidation on CMS save: [`app/api/control/cms/route.ts`](../app/api/control/cms/route.ts) calls `revalidateTag(CMS_CACHE_TAG, "max")`.
- Also: [`app/api/control/seed/route.ts`](../app/api/control/seed/route.ts) may invalidate the same tag.

### WooCommerce-backed reads

**Tag constants** ([`lib/woocommerce-cache-tags.ts`](../lib/woocommerce-cache-tags.ts)):

| Tag constant | String value | Typical use |
|--------------|--------------|-------------|
| `WOO_CACHE_TAG_PRODUCTS` | `woo-products` | Products, categories metadata, sitemap inventory |
| `WOO_CACHE_TAG_PRODUCT_TAGS` | `woo-product-tags` | Control quick-search tag suggestions |
| `WOO_CACHE_TAG_SITEMAP` | `sitemap-woo` | Sitemap generation |
| `WOO_CACHE_TAG_ORDERS` | `woo-orders` | Order track / order reads |
| `WOO_CACHE_TAG_REVIEWS` | `woo-reviews` | Reviews API |

**TTL:** BFF routes and server fetchers use `WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC` from [`lib/woo-bff-revalidate.ts`](../lib/woo-bff-revalidate.ts) (default **300s**, overridable via `WOO_BFF_CACHE_REVALIDATE_SEC` in range 60–3600). Examples: [`app/api/products/route.ts`](../app/api/products/route.ts), [`features/products/services/getProductsServer.ts`](../features/products/services/getProductsServer.ts), [`features/seo/services/getSitemapInventory.ts`](../features/seo/services/getSitemapInventory.ts) (`revalidate: 600` + sitemap tags).

**Webhook broadcast:** [`lib/woocommerce-revalidate-broadcast.ts`](../lib/woocommerce-revalidate-broadcast.ts) — `revalidateWooDataTags()`, `revalidateWooOrderTags()`, `revalidateWooReviewTags()`, path helpers for listing pages; invoked from [`features/woocommerce/revalidate-after-product-webhook.ts`](../features/woocommerce/revalidate-after-product-webhook.ts) and external-data path.

### Diagnostics / manual invalidation

- [`app/api/control/diagnostics/revalidate-cache/route.ts`](../app/api/control/diagnostics/revalidate-cache/route.ts) (Control UI) — see [`features/control/components/ControlHealthTab.tsx`](../features/control/components/ControlHealthTab.tsx).

---

## English — Route segment ISR / revalidate

- Example: [`app/(storefront)/page.tsx`](../app/(storefront)/page.tsx) — `export const revalidate = 300` (home segment revalidation window).

Adjust when product freshness requirements change; keep in sync with webhook-driven `revalidatePath` behavior.

---

## English — Sitemap

- [`app/sitemap.ts`](../app/sitemap.ts) — `export const revalidate = 3600`; inventory from `getSitemapInventory()` (cached with Woo/sitemap tags — see [`features/seo/services/getSitemapInventory.ts`](../features/seo/services/getSitemapInventory.ts)). SEO file index: [`docs/seo-reference.md`](seo-reference.md).

---

## English — HTTP `Cache-Control` (Next config)

- [`next.config.ts`](../next.config.ts) `headers`: e.g. `/images/hero/*` → `public, max-age=31536000, stale-while-revalidate=86400`.
- Global security headers on `/(.*)` (not product data cache — baseline response headers).

---

## English — PWA service worker (browser)

- Generated script: [`app/api/pwa-sw/route.ts`](../app/api/pwa-sw/route.ts) (served as `/sw.js` via rewrite in `next.config.ts`).
- **Navigate:** not intercepted — default browser network-first for documents.
- **Same-origin `GET`:** `/api/*` → network-first with cache fallback; `/_next/static` and static extensions → network-first then cache (comment in file: reduces stale chunks after deploy); cross-origin **images** → stale-while-revalidate cache.
- SW response uses `Cache-Control: no-store` so `sw.js` updates are not stuck.

Details: [`docs/pwa-behavior.md`](pwa-behavior.md).

---

## Related

- [`docs/woo-integration.md`](woo-integration.md) — webhooks
- [`docs/seo-system.md`](seo-system.md) — metadata & sitemap entry points
