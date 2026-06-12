# Cache invalidation playbook — storefront

دليل تشغيلي لطبقات الكاش في متجر Sokany Headless: **متى تُبطَل**، **كيف تتزامن**، و**أين لا نثق بالكاش** (PDP / سلة / checkout).

---

## 1. طبقات الكاش (من الأبعد للأقرب)

| الطبقة | الموقع | TTL تقريبي | ماذا تخزّن |
|--------|--------|------------|------------|
| **Woo BFF** | `unstable_cache` في `app/api/*` | `WOO_BFF_CACHE_REVALIDATE_SEC` (افتراضي 300s) | استجابات Woo REST |
| **ISR** | `export const revalidate` على صفحات | 300s | HTML/بيانات سيرفر للهوم/PDP metadata |
| **TanStack Query** | `providers/QueryProvider.tsx` | `STALE_TIME.MEDIUM` (5m) افتراضي؛ `COMMERCE` (0) على PDP |
| **Query persist** | `lib/storefront-offline-cache.ts` → localStorage | 7 أيام | مفاتيح `products`، `product`، `categories`، `reviews` |
| **Axios GET cache** | `lib/api-client.ts` → localStorage | 7 أيام | `/products`، `/products/:id`، `/categories`، `/reviews` |
| **Service Worker** | `app/api/pwa-sw/route.ts` | حسب الاستراتيجية | GET `/api/*` network-first + fallback |

```mermaid
flowchart TB
  webhook[Woo_webhook] --> revalidateTag[revalidateTag_BFF]
  revalidateTag --> fcm[FCM_woo-cache-invalidation]
  fcm --> sw[Service_Worker]
  fcm --> event[window_woo-cache-invalidation]
  event --> rq[invalidateQueries]
  event --> lsclear[clearStorefrontApiCache]
  shopper[PDP_cart_checkout] --> fresh[X-Sokany-Commerce-Trust]
  fresh --> api[/api/products]
```

---

## 2. أحداث تغيّر البيانات

| الحدث | Scope | إجراء الخادم | إجراء العميل |
|-------|-------|--------------|--------------|
| **تغيير سعر** (`product.updated`) | `products` | `revalidateTag(woo-product-detail:*)` | invalidate `["product", id]` + مسح api cache للمنتج |
| **تغيير مخزون** | `products` | نفس أعلاه | نفس أعلاه + `syncCartWithServer` على السلة/checkout |
| **حالة منتج** (publish/draft/stock_status) | `products` | نفس أعلاه | إخفاء/تحديث في القوائم بعد invalidate |
| **عروض** (`on_sale`, `sale_price`) | `products` | نفس أعلاه | تحديث بطاقات وPDP |
| **تصنيف** (`product_cat.*`) | `categories` | tags التصنيفات | invalidate `categories` |
| **تقييم جديد** | `reviews` | — | invalidate `["reviews", productId]` |
| **طلب** | `orders` | لا يمس الكتالوج | — |
| **CMS / control** | — | `revalidateTag(cms)` | إعادة تحميل محتوى عام |

المصدر: `app/api/webhooks/woocommerce/route.ts`، `features/woocommerce/revalidate-after-product-webhook.ts`، `lib/woocommerce-revalidate-broadcast.ts`.

---

## 3. مفاتيح Query المعيارية

| `queryKey` | الاستخدام |
|------------|-----------|
| `["products", params]` | قوائم الكتالوج |
| `["product", id]` | PDP |
| `["product-variations", productId]` | متغيرات Woo |
| `["categories"]` | شريط التصنيفات |
| `["reviews", productId]` | تقييمات PDP |

عند تغيير `queryKey` حدّث `isPersistableStorefrontQueryKey` في `lib/storefront-offline-cache.ts`.

---

## 4. مسار إبطال من Webhook إلى المتصفح

1. Woo يرسل POST إلى `/api/webhooks/woocommerce` مع `WC_WEBHOOK_SECRET`.
2. الخادم يستدعي `revalidateTag` للوسوم المناسبة.
3. `sendWooCacheInvalidation` يبث FCM أو حدث داخلي.
4. Service Worker يمرّر `postMessage` → `emitWooCacheInvalidation`.
5. `invalidateStorefrontQueriesFromWooEvent` يبطل Query + `clearStorefrontApiCacheForScope`.

---

## 5. مسارات الثقة التجارية (لا كاش قديم)

الهيدر `X-Sokany-Commerce-Trust: 1` على طلبات axios:

- **لا يُكتب** في localStorage api cache.
- **لا يُستخدم** cache fallback عند 502/503.
- يُستخدم في:
  - `getProductById` / `getProducts` عند `syncCartWithServer`
  - `useProductCommerce` على PDP (`staleTime: 0`، `refetchOnMount: always`)
  - التحقق قبل `POST /api/orders` في checkout

**قاعدة:** عند الشك في السلة أو الدفع، **السيرفر هو مصدر الحقيقة** — انظر `features/cart/lib/sync-cart-with-server.ts`.

---

## 6. تشخيص «لماذا العميل يرى سعراً قديماً؟»

1. هل `WC_WEBHOOK_SECRET` متطابق ووصل webhook؟ (لوحة Woo → Deliveries)
2. هل BFF ما زال ضمن TTL؟ جرّب revalidate من `/control`.
3. هل Query restored من localStorage؟ اسحب للتحديث أو افتح PDP من جديد (commerce refetch).
4. هل SW أعاد رداً مخزناً؟ network-first يفضّل الشبكة؛ عطّل SW مؤقتاً للتشخيص.
5. هل السلة تحتفظ بسعر لحظة الإضافة؟ `syncCartWithServer` يحدّث قبل الدفع.

---

## 7. صيانة

- بعد تغيير سياسة الكاش: حدّث هذا الملف و`production-checklist.md`.
- لا تقلّل TTL بشكل عشوائي — راقب حمل Woo.
- لا تحذف طبقة كاش دون اختبار checkout وPLP على موبايل.
