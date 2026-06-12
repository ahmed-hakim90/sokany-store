# Production checklist — Sokany Store

قائمة تحقق للتشغيل الحي لمتجر Headless (Next.js BFF + WooCommerce). **لا تضع أسراراً في الكود أو في Git** — استخدم متغيرات بيئة الاستضافة (مثل Vercel Project Settings).

مرتبطة بـ: [`deployment-runbook.md`](./deployment-runbook.md)، [`.env.local.example`](../.env.local.example)، [`woo-integration.md`](./woo-integration.md).

---

## 1. وضع البيانات

| المتغير | مطلوب | ملاحظة |
|---------|--------|--------|
| `NEXT_PUBLIC_USE_MOCK` | نعم | **`false`** في الإنتاج |
| `NEXT_PUBLIC_API_URL` | نعم | URL تطبيق Next (نفس الدومين العام) |
| `NEXT_PUBLIC_SITE_URL` | نعم | Canonical لـ SEO، sitemap، OG، JSON-LD، روابط callback |

---

## 2. WooCommerce (خادم فقط — بدون `NEXT_PUBLIC_`)

| المتغير | مطلوب | ملاحظة |
|---------|--------|--------|
| `WC_BASE_URL` | نعم* | عنوان WordPress/Woo؛ أو `wooBaseUrl` من CMS في `/control` |
| `WC_CONSUMER_KEY` | نعم* | مفتاح REST API بصلاحيات قراءة/كتابة حسب الحاجة |
| `WC_CONSUMER_SECRET` | نعم* | سر REST API |
| `WC_WEBHOOK_SECRET` | موصى به | يطابق مفتاح التوقيع في Woo → Webhooks |
| `WOO_BFF_CACHE_REVALIDATE_SEC` | اختياري | 60–3600؛ افتراضي ~300 ثانية |
| `WOO_ORDER_PAYMENT_METHOD_COD` | اختياري | معرف بوابة الدفع عند الاستلام في Woo |
| `WOO_ORDER_PAYMENT_METHOD_CARD` | اختياري | معرف بوابة البطاقة إن اختلفت عن COD |
| `WOO_ORDER_PAYMENT_METHOD_FAWRY` | اختياري | افتراضي `fawry` |
| `WOO_ORDER_PAYMENT_METHOD_PAYMOB` | اختياري | افتراضي `paymob` |

\*يمكن تخزين المفاتيح مشفّرة من لوحة `/control` بدل env إذا وُجد `CONTROL_WOO_CREDENTIALS_ENCRYPTION_KEY`.

---

## 3. JWT والجلسات

| المتغير | مطلوب | ملاحظة |
|---------|--------|--------|
| `JWT_SECRET` | نعم | جلسة المتجر بعد `/api/auth/login`؛ أنشئ: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `CONTROL_SESSION_JWT_SECRET` | نعم لـ `/control` | **منفصل** عن `JWT_SECRET` |
| `WC_JWT_AUTH_TOKEN_PATH` | إن لزم | مسار JWT على WordPress إن لم يكن الافتراضي |

---

## 4. Firebase / CMS (اختياري لكن مطلوب للوحة والمحتوى الديناميكي)

### عميل (مسموح `NEXT_PUBLIC_`)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` — لإشعارات الويب (انظر [`firebase-web-push-vapid.md`](./firebase-web-push-vapid.md))

### خادم

- `FIREBASE_SERVICE_ACCOUNT_JSON` — JSON سطر واحد لـ Admin SDK
- `CONTROL_PANEL_ALLOWED_UIDS` — UIDs مسموحة لـ `/control`

---

## 5. Fawry (خادم فقط)

| المتغير | ملاحظة |
|---------|--------|
| `FAWRY_MERCHANT_CODE` | من لوحة فوري |
| `FAWRY_SECURE_KEY` أو `FAWRY_SECRET_KEY` | للتوقيع |
| `FAWRY_ENABLED` | `true` لتفعيل المسار |
| `FAWRY_SANDBOX` | `true` للتجربة؛ `false` للإنتاج |
| `FAWRY_BASE_URL` | اختياري — endpoint مخصص إن طلبته فوري |
| `FAWRY_HOSTED_PAYMENT_METHOD` | اختياري — `CARD`، `PayAtFawry`، إلخ |

**Callback URL (إنتاج):**

```text
https://<NEXT_PUBLIC_SITE_URL>/api/payments/fawry/callback
```

يُبنى تلقائياً من `returnUrl` في طلب الشحن؛ تأكد أن `NEXT_PUBLIC_SITE_URL` صحيح.

---

## 6. PayMob (خادم فقط)

| المتغير | ملاحظة |
|---------|--------|
| `PAYMOB_API_KEY` | |
| `PAYMOB_INTEGRATION_ID` | |
| `PAYMOB_IFRAME_ID` | |
| `PAYMOB_HMAC_SECRET` | للتحقق من callback |
| `PAYMOB_ENABLED` | `true` |

**Callback URL:**

```text
https://<NEXT_PUBLIC_SITE_URL>/api/payments/paymob/callback
```

---

## 7. Webhooks

### WooCommerce → Next

1. Woo → **Settings → Advanced → Webhooks → Add webhook**
2. **Delivery URL:** `https://<domain>/api/webhooks/woocommerce`
3. **Secret:** نفس قيمة `WC_WEBHOOK_SECRET`
4. **Topics موصى بها:** `product.updated`، `product.deleted`، `order.updated` (حسب الحاجة)

### إبطال الكاش من لوحة التحكم

- `/control` → تشخيص → «تحديث الواجهة» يستدعي `/api/control/diagnostics/revalidate-cache`

### بيانات خارجية (اختياري)

- **URL:** `https://<domain>/api/webhooks/external-data`
- **Secret:** `EXTERNAL_DATA_WEBHOOK_SECRET`

---

## 8. تحليلات (اختياري)

| المتغير | تعطيل |
|---------|--------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | قيمة فارغة |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | قيمة فارغة |

---

## 9. خطوات اختبار طلب حقيقي

1. **بناء:** `npm run build` و`npm run test` بدون أخطاء.
2. **صحة API:** `GET https://<domain>/api/health` → `{ "ok": true }`.
3. **كتالوج حي:** افتح `/products` و`/products/<id>` — أسعار من Woo وليس mock.
4. **سلة:** أضف منتجاً simple؛ راجع السعر في السلة والـ peek السفلي.
5. **منتج متغير (إن وُجد):** اختر خصائصاً كاملة ثم أضف للسلة — يجب ظهور `variationId` في payload الطلب.
6. **Checkout COD:**
   - املأ نموذجاً صالحاً (موبايل مصري).
   - أكّد الطلب.
   - تحقق من الطلب في Woo Admin ورقم الطلب في `/order-confirmation`.
7. **Checkout Fawry/PayMob (إن مفعّل):**
   - اختر طريقة الدفع الإلكترونية.
   - تأكد من التحويل لبوابة الدفع ثم العودة لـ callback.
   - راجع حالة الطلب في Woo.
8. **Webhook:** عدّل سعر منتج في Woo؛ خلال دقائق يجب انعكاسه على PDP بعد إبطال الكاش (أو فوراً مع webhook صحيح).
9. **PWA (اختياري):** `/manifest.webmanifest`، تثبيت، صفحة `/offline`.
10. **SEO:** `https://<domain>/sitemap.xml`، `robots.txt`، Rich Results Test على صفحة منتج.

---

## 10. ما بعد النشر

- راقب Vercel Logs لـ `[woo-bff]` و`502` من `/api/products`.
- على معاينات Vercel راجع [`vercel-preview-manifest-401.md`](./vercel-preview-manifest-401.md).
- بعد rollback، نفّذ revalidate من `/control` إن بقي HTML قديماً.

---

*آخر مراجعة: يونيو 2026 — حدّث هذا الملف عند إضافة متغيرات إلزامية جديدة.*
