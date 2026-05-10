# Deployment runbook — Sokany Store

## العربية

قبل النشر: انسخ المتغيرات من [`.env.local.example`](../.env.local.example)، وتأكد من **`NEXT_PUBLIC_SITE_URL`** للروابط المطلقة وSEO، و**مفاتيح Woo** على الخادم فقط، و**`WC_WEBHOOK_SECRET`** متطابقة مع إعداد الويبهوك في ووردبريس. إن وُجدت **Firestore/CMS** أو **Firebase Admin**، راجع JSON الخدمة ومتغيرات `NEXT_PUBLIC_FIREBASE_*`.

بعد النشر: افتح الصفحة الرئيسية، مسار منتج، `sitemap.xml`، و`robots.txt`؛ راقب وصول الويبهوك من Woo (لوحة التحكم → تبويب Woo API). على **معاينات Vercel** تحقق من `manifest.webmanifest` بدون جلسة — [`docs/vercel-preview-manifest-401.md`](vercel-preview-manifest-401.md).

**صيانة:** حدّث هذا الملف عند إضافة متغيرات بيئة إلزامية جديدة.

---

## English — Prerequisites

- **Node.js:** 20+ recommended ([`README.md`](../README.md))
- **WordPress + WooCommerce** reachable from the deployment region
- **REST API keys** with appropriate permissions (server env only)

---

## English — Initial setup

```bash
cp .env.local.example .env.local
# fill secrets locally; in production use host env UI (e.g. Vercel Project Settings)
npm install
npm run build
npm run start
```

CI / quality:

- `npm run lint`
- `npm run test` — Vitest + «no Woo secrets in client trees» guard
- `npm run test:e2e` — Playwright (see below: preview server + mock)

### English — Build checklist (pre-merge)

- `npm run build` succeeds locally
- `npm run test` passes
- No new `NEXT_PUBLIC_*` variables carrying secrets

### English — Playwright / E2E notes

- [`playwright.config.ts`](../playwright.config.ts) starts **`next build` + `next start`** on port **3330** with `NEXT_PUBLIC_USE_MOCK=true` so tests do not fight an existing `next dev` lock and always use mock catalog data.
- Override with `PLAYWRIGHT_SKIP_WEBSERVER=1` and `PLAYWRIGHT_TEST_BASE_URL` if you attach to another server.
- Optional: `PLAYWRIGHT_REUSE_WEBSERVER=1` to skip starting a new preview when the `url` already responds.

### English — Rollback (Vercel)

- Promote the previous **Production** deployment from the dashboard, or use the host CLI if available.
- After rollback, trigger **«تحديث الواجهة»** in Control (revalidate) if HTML/CDN still looks stale.

### English — Post-deploy smoke (quick)

- `GET /api/health` — `200`, `{ "ok": true }`
- Home, PLP (`/products`), PDP, `/cart`, start `/checkout`
- `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`

---

## English — Critical environment variables

| Area | Variables |
|------|-----------|
| Data mode | `NEXT_PUBLIC_USE_MOCK`, `NEXT_PUBLIC_API_URL` |
| Canonical URL / SEO | `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` |
| Woo (server) | `WC_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` |
| Webhooks | `WC_WEBHOOK_SECRET` — must match WooCommerce webhook configuration; endpoint `https://<your-domain>/api/webhooks/woocommerce` |
| JWT | `JWT_SECRET` |
| BFF cache tuning | `WOO_BFF_CACHE_REVALIDATE_SEC` (optional, 60–3600) |
| Analytics (optional) | `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` — empty disables |
| Firebase / CMS (optional) | `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`, etc. — see `.env.local.example` |

Details: [`README.md`](../README.md), [`docs/woo-integration.md`](woo-integration.md).

---

## English — Webhooks checklist

1. In WooCommerce, create webhook pointing to production `/api/webhooks/woocommerce` with the same secret as `WC_WEBHOOK_SECRET`.
2. Use Control panel **Woo API** tab to sync recipes / verify deliveries — [`docs/control-woo-api.md`](control-woo-api.md).
3. Optional: `EXTERNAL_DATA_WEBHOOK_SECRET` for `/api/webhooks/external-data` — see [`docs/api-integration-inventory.md`](api-integration-inventory.md).

---

## English — Vercel / hosting notes

- **Deployment Protection:** can return **401** for unauthenticated requests to static manifest URLs — see [`docs/vercel-preview-manifest-401.md`](vercel-preview-manifest-401.md).
- **Vercel CLI** is optional; session hooks may note it is not installed globally — use host dashboard for env and logs if CLI unavailable.

---

## English — Post-deploy smoke tests

- Home, PLP, PDP, cart, checkout happy path
- `GET /manifest.webmanifest` (200, JSON)
- `GET /sitemap.xml`, `GET /robots.txt`
- Control login (`/control`) if using CMS — session via [`proxy.ts`](../proxy.ts)

---

## Related

- [`docs/architecture.md`](architecture.md)
- [`docs/caching-strategy.md`](caching-strategy.md)
- [`docs/pwa-behavior.md`](pwa-behavior.md)
