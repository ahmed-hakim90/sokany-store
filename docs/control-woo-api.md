# صفحة «Woo & API» في لوحة التحكم — كيف تعمل

هذا الملف يشرح **مسار الصفحة**، **مصدر البيانات**، **المكوّنات**، و**مسارات الـ API** المرتبطة بها.

---

## 1. المسار والوصول

| العنصر | القيمة |
|--------|--------|
| URL الحالي | `/control?tab=wooApi` (تبويب داخل /control) |
| URL القديم | `/control/woo-api` — يحوّل تلقائياً إلى التبويب الجديد. |
| تبويب لوحة التحكم | `wooApi` ضمن مجموعة «صحة وربط» في `features/control/lib/control-tabs.ts`. |
| واجهة العرض (Client) | `features/control/components/ControlWooApiTab.tsx` (تجلب الملخص من API لأنها داخل لوحة التحكم). |
| API ملخص الواجهة | `GET /api/control/woo-api-summary` — يجمع `getWooDiagnosticReport`، `getPublicSiteContent`، روابط الويبهوك. |
| حماية المسار | `proxy.ts` يفرض جلسة صالحة لكل `/control/*` عدا `/control/login`. بدون كوكي جلسة → إعادة توجيه لـ `/control/login`. |

التبويب يستلم البيانات من العميل عبر API بعد التحقق من الجلسة (`requireScopeFull`). لا تظهر تبويبات «صحة وربط» إلا للمستخدمين الذين لديهم صلاحية `full`.

---

## 2. ماذا يحدث في `page.tsx` (السيرفر)

عند كل طلب، يُنفَّذ بالتوازي:

1. **`getControlSessionUser()`** — إن لم يوجد مستخدم → `redirect("/control/login")`.
2. **`getWooDiagnosticReport()`** — من `lib/woo-diagnostics.ts`: يبني تقريراً **بدون كشف مفاتيح Woo** يتضمن:
   - هل البيئة مهيأة (`WC_CONSUMER_*` + أصل Woo من CMS أو `WC_BASE_URL`).
   - استدعاء فعلي لـ Woo: `GET …/products?per_page=1` و `GET …/categories?per_page=1`.
   - التحقق من أن الاستجابة تطابق **Zod** (`wpProductsSchema` / `wpCategoriesSchema`).
   - قياس **`latencyMs`** لكل استدعاء ناجح.
   - جدول **`apiMap`**: ربط مسارات Next العامة بتلميح المورد الريموت.
3. **`getPublicSiteContent()`** — قراءة CMS (Firestore/مسار الملف حسب الإعداد) لعرض حقول مثل `publicReadBaseUrl`, `wooBaseUrl` المعروض، إلخ.
4. **`resolveWooCommerceWebhookUrl()`** و **`resolveExternalDataWebhookUrl()`** — من `lib/storefront-origin.ts`: يُشتق **عنوان URL كامل** لويبهوك Woo وويبهوك البيانات الخارجية، مع أولوية لما في **تكاملات CMS** (`publicStorefrontBaseUrl`، إلخ) ثم `NEXT_PUBLIC_SITE_URL` وغيرها.

ثم تُمرَّر كل القيم إلى `<WooApiDashboard />`.

---

## 3. هيكل واجهة `WooApiDashboard`

مكوّن عميل (`"use client"`) يعرض أقساماً بالتقريب كالتالي (من أعلى لأسفل):

### أ) رأس الصفحة وأزرار

- **إعادة الفحص**: `router.refresh()` — يعيد تشغيل الـ Server Component فيُعاد `getWooDiagnosticReport` و`getPublicSiteContent`.
- **نسخ JSON كامل**: ينسخ كائناً يضم `wooDiagnostic` + حقول CMS المعروضة.
- **Site health**: رابط إلى `/control/dev` (مركز الصحة/التشخيص الموسّع).
- **رجوع للوحة**: `/control`.

### ب) بطاقة «البيئة»

تعرض مثلاً: توقيت الفحص، `NEXT_PUBLIC_USE_MOCK`، هل Woo مُكوّن، **أصل Woo الفعلي** (من `getWooDiagnosticReport`) مقابل **حقل `wooBaseUrl` في CMS** (للمعرفة فقط)، و `publicReadBaseUrl`، `externalDataWebhookUrl` من CMS، وروابط لتعديل «عام — تكاملات».

### ج) ويبهوك Woo (ووردبريس → Next)

- نص تعليمي: إعداد Webhook في Woo باستخدام **نفس** `WC_WEBHOOK_SECRET` في الـ env.
- عرض **`webhookEndpointUrl`**: عادة `https://<نطاق المتجر>/api/webhooks/woocommerce`.
- اقتراح **مواضيع (topics)**: `product.*`, `product_cat.*`, `order.*`، إلخ.

### د) ويبهوك البيانات الخارجية (HMAC)

- يشرح أن الطرف الخارجي يرسل `POST` بجسم خام ويوقّعه بـ **Base64(HMAC-SHA256(body, secret))** (مماثل لمنطق Woo).
- **Env**: `EXTERNAL_DATA_WEBHOOK_SECRET`، واختياري `EXTERNAL_DATA_WEBHOOK_HEADER` (قيمة افتراضية من `lib/external-data-webhook-constants.ts`).
- الرابط: **`externalDataWebhookUrl`** — من حقل CMS إن وُجد وإلا مُشتق من نطاق المتجر (`/api/webhooks/external-data`).

### هـ) `WooWebhooksPanel`

| المصدر | الملف |
|--------|--------|
| واجهة | `app/control/woo-api/woo-webhooks-panel.tsx` |
| API | `GET/POST` → `/api/control/woocommerce/webhooks` (مع `credentials: "include"`) |

- **GET**: يجلب قائمة webhooks من **Woo REST** (`/wc/v3/webhooks`) المطابقة لنفس `deliveryUrl` الحالي + وصف الـ **recipes** المعرّفة في `features/woocommerce/woo-webhook-topics.ts` (`SOKANY_WOO_WEBHOOK_RECIPES`).
- **POST (مزامنة)**: ينشئ/يحدّث الـ webhooks في Woo حسب تلك الوصفات (يحتاج `WC_CONSUMER_*` و`WC_WEBHOOK_SECRET` مضبوطين).

### و) `WooWebhookDeliveriesPanel`

| المصدر | الملف |
|--------|--------|
| واجهة | `app/control/woo-api/woo-webhook-deliveries-panel.tsx` |
| API | `GET` → `/api/control/woocommerce/webhook-deliveries?limit=…` (اختياري `cursor` للتصفح) |

- يعرض سجلاً من **Firestore** (مجموعة `wooWebhookDeliveries`) لطلبات وصلت إلى `POST /api/webhooks/woocommerce` **بعد** التحقق من التوقيع.
- إذا `FIREBASE_SERVICE_ACCOUNT_JSON` غير مضبوط: تظهر رسالة أن التسجيل غير مفعّل.
- الجدول: الوقت، الموضوع (`x-wc-webhook-topic`)، مورد/معرف، حالة (تمت المعالجة / فشل)، اختصار **SHA-256** للجسم.

### ز) بطاقات الفحص (Probe) — المنتجات والتصنيفات

تعرض نتائج `report.products` و `report.categories`: HTTP، توافق Schema، عيّنة أول سطر، أخطاء Zod إن وُجدت.

### ح) «خريطة الـ API»

جدول ثابت من `report.apiMap` يربط: تسمية عربية → مسار Next (مثل `/api/products`) → تلميح **ريموت** (مثل `wc/v3/products`).

### ط) بيئة التطوير فقط

رابط «فتح الاستجابة JSON الخام» إلى **`/api/dev/woo-status`** (يعمل في `development` فقط دون باقي الـ production إلا بتوكن `DEV_WOO_DIAG_TOKEN` حسب `lib/dev-diagnostic-allow.ts`).

---

## 4. الاعتماديات الخلفية (ملخص)

| الملف / الوحدة | الدور |
|----------------|--------|
| `lib/create-woo-client.ts` | يبني عميل HTTP لـ Woo باستخدام `resolveWooBaseUrlForServer()` + مفاتيح الـ env. |
| `lib/resolve-woo-base-url.ts` | أولوية: `WC_BASE_URL` (إن وُجد) ثم `storefrontIntegrations.wooBaseUrl` (CMS). |
| `lib/woo-diagnostics.ts` | `getWooDiagnosticReport` — الاستدعاءات + Zod + `apiMap`. |
| `lib/storefront-origin.ts` | `resolveWooCommerceWebhookUrl`, `getStorefrontOrigin`, إلخ. |
| `app/api/webhooks/woocommerce/route.ts` | استقبال ويبهوك Woo، التحقق، إبطال كاش، تسجيل في Firestore. |
| `app/api/control/woocommerce/webhook-deliveries/route.ts` | قراءة سجل التسليمات للوحة (و `?id=` لسجل واحد — مستخدم مثلاً في `/control/dev`). |
| `app/api/control/woocommerce/webhooks/route.ts` | مزامنة/عرض webhooks في Woo من اللوحة. |

---

## 5. صفحات/مسارات مرتبطة (ليست داخل نفس الملف)

| المسار | الغرض |
|--------|--------|
| `/control/dev` | «Site health» — نبض مركّب، إحصائيات 24 ساعة، أدوات اختبار ويبهوك/سكيما/كاش. |
| `/api/control/health-check` | فحص صحة كامل (جلسة لوحة). |
| `/api/dev/health-check` | فحص صحة بدون واجهة (dev أو Bearer token). |
| `/api/dev/woo-status` | نفس منطق التشخيص الـ JSON الخام كما في رابط صفحة الـ dev. |

---

## 6. أمان وخصوصية

- **لا تُعرض** `WC_CONSUMER_SECRET` ولا الـ body الكامل لطلبات عميلي المتجر في هذه الصفحة.
- **مفاتيح API** الظاهرة للمطوّر في الـ env فقط — الواجهة تعرض عناوين ويبهوك **عامة** (HTTPS) وحقول CMS للقراءة.
- مسارات `/api/control/*` تتطلب عادة **جلسة تحكم** (`requireControlSession` / `requireScopeFull` حسب المسار)؛ راجع كل route على حدة.

---

## 7. صيانة الكود

- عند إضافة مسار API جديد للمتجر: حدّث `API_MAP` في `lib/woo-diagnostics.ts` إن أردت أن يظهر في «خريطة الـ API».
- عند تغيير وصفات الـ webhooks: عدّل `SOKANY_WOO_WEBHOOK_RECIPES` و `revalidate-after-product-webhook.ts` بما يتناسب.

---

*آخر مراجعة تتبع هيكل المشروع: `app/control/woo-api/`, `lib/woo-diagnostics.ts`, `proxy.ts` (حماية `/control`).*
