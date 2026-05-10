# PWA behavior — Sokany Store

## العربية

التطبيق يدعم **تثبيت PWA** عبر `manifest.webmanifest`، و**Service Worker** يُولَّد ديناميكياً من الخادم ليتضمن إصدار Firebase المطابق للمشروع. الصفحة **`/offline`** تُخزَّن مع أيقونة افتراضية عند التثبيت. **FCM** (اختياري): إشعارات خلفية وتمرير `woo-cache-invalidation` للنوافذ المفتوحة عند تهيئة Firebase — راجع [`docs/firebase-web-push-vapid.md`](firebase-web-push-vapid.md).

**معاينات Vercel:** إذا ظهر **401** على `manifest.webmanifest`، غالباً **Deployment Protection** وليس خطأ في [`app/manifest.ts`](../app/manifest.ts) — [`docs/vercel-preview-manifest-401.md`](vercel-preview-manifest-401.md).

**صيانة:** عند ترقية حزمة `firebase`، حدّث تعليق/ثابت الإصدار في [`app/api/pwa-sw/route.ts`](../app/api/pwa-sw/route.ts) (`FIREBASE_JS`) ليتوافق مع `importScripts`.

---

## English — Web app manifest

- File: [`app/manifest.ts`](../app/manifest.ts) — `MetadataRoute.Manifest`
- Loads branding from `getPublicSiteContent()` (CMS): `pwaName`, `pwaShortName`, `pwaDescription`, colors, icons (`icon192` / `icon512`)
- `lang: "ar"`, `dir: "rtl"`, `display: "standalone"`, `start_url: "/"`, `scope: "/"`

---

## English — Service worker URL

- [`next.config.ts`](../next.config.ts) `rewrites`: `/sw.js` → `/api/pwa-sw`
- Implementation: [`app/api/pwa-sw/route.ts`](../app/api/pwa-sw/route.ts) `GET` returns JavaScript with:
  - `Cache-Control: no-store` (avoid stale `sw.js` after deploy)
  - `Service-Worker-Allowed: /`
  - Cache buckets: `sokany-pwa-v4`, `-api`, `-static`, `-img`
  - `OFFLINE_URL = "/offline"`, `DEFAULT_ICON = "/images/icon-192.png"`
  - Firebase compat `importScripts` when `NEXT_PUBLIC_FIREBASE_*` present; `onBackgroundMessage` shows notifications and relays `woo-cache-invalidation` to clients
- **Fetch rules (summary):**
  - Does **not** intercept `navigate` — document requests use normal browser behavior
  - Same-origin `GET` `/api/*`: **network-first**, cache fallback
  - Same-origin static assets (`/_next/static`, common extensions): **network-first** then cache (comment in source: mitigates stale hashed assets after deployment)
  - Cross-origin **images**: **stale-while-revalidate** in Cache Storage
- Install event pre-caches `OFFLINE_URL` and default icon

---

## English — Offline route

- Storefront offline page: [`app/(storefront)/offline/page.tsx`](../app/(storefront)/offline/page.tsx) (path `/offline`)

---

## English — Push & VAPID

- Setup: [`docs/firebase-web-push-vapid.md`](firebase-web-push-vapid.md)
- Control panel may send notifications when Firebase Admin + VAPID are configured ([`README.md`](../README.md) env table)

---

## Related

- [`docs/caching-strategy.md`](caching-strategy.md) — server vs SW layers
- [`docs/deployment-runbook.md`](deployment-runbook.md) — env and hosting checks
- [`docs/seo-system.md`](seo-system.md) — manifest vs `<meta>` (install metadata only)
