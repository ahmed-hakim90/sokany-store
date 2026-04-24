# جرد تكامل الـ API (Sokany Store)

وثيقة **قراءة** فقط: خريطة مسارات `app/api`، والخدمات على العميل التي تستدعيها، والأنظمة الخلفية (WooCommerce، WordPress، Firebase، تخزين). يُرجى تحديثها عند تغيير المسارات.

## النموذج العام

- **واجهة متجر (BFF):** المتصفح يتكلم مع **نفس دومين Next** عبر `apiClient` → [`lib/api-client.ts`](../lib/api-client.ts) (`baseURL: "/api"`). مفاتيح Woo **لا** تظهر في المتصفح؛ الطلبات تمرّ عبر Route Handlers.
- **WooCommerce REST:** الخادم يبني عميل axios عبر [`lib/create-woo-client.ts`](../lib/create-woo-client.ts) (`Basic` بمفاتيح `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` + `WC_BASE_URL` أو تكاملات CMS).
- **وضع mock:** `NEXT_PUBLIC_USE_MOCK=true` يُ short-circuit بعض خدمات الطلبات/الكاتالوج (انظر `USE_MOCK` في [`lib/constants.ts`](../lib/constants.ts)).

## خدمات العميل → `/api` (عبر `apiClient`)

| خدمة | طريقة / مسار | غرض |
|------|----------------|-----|
| [`getProducts`](../features/products/services/getProducts.ts) | `GET /api/products` | قائمة المنتجات (مع query) |
| [`getProductById`](../features/products/services/getProductById.ts) | `GET /api/products/:id` | منتج واحد |
| [`getCategories`](../features/categories/services/getCategories.ts) | `GET /api/categories` | تصنيفات |
| [`getCategoryBySlug`](../features/categories/services/getCategoryBySlug.ts) | `GET /api/categories?slug=…` | تصنيف بالـ slug |
| [`getReviews`](../features/reviews/services/getReviews.ts) | `GET /api/reviews` | تقييمات منتج |
| [`createReview`](../features/reviews/services/createReview.ts) | `POST /api/reviews` | إرسال تقييم |
| [`getUser`](../features/user/services/getUser.ts) | `GET /api/user` | بيانات عميل وو (مع جلسة) |
| [`updateUser`](../features/user/services/updateUser.ts) | `PUT /api/user` | تحديث فواتير/شحن وو |
| [`login`](../features/auth/services/login.ts) | `POST /api/auth/login` | JWT وو |
| [`logout`](../features/auth/services/logout.ts) | `POST /api/auth/logout` | إلغاء جلسة مخصص |
| [`register`](../features/auth/services/register.ts) | `POST /api/auth/register` | تسجيل عميل وو |
| [`loginWithFirebase`](../features/auth/services/loginWithFirebase.ts) | `POST /api/auth/firebase` | تبادل `idToken` — ربط Woo + JWT مخصص |
| [`createOrder`](../features/orders/services/createOrder.ts) | `POST /api/orders` | إنشاء طلب |
| [`fetchMyOrders`](../features/orders/services/fetchMyOrders.ts) | `GET /api/orders` | طلبات المستخدم (مع جلسة) |
| [`getOrders`](../features/orders/services/getOrders.ts) | `GET /api/orders` | (استخدام أقدم/عام) |
| [`trackOrder`](../features/order-tracking/services/trackOrder.ts) | `GET /api/orders/track` | تتبع حسب id أو رقم |
| [`getStoreHotline`](../features/store/services/getStoreHotline.ts) | `GET /api/store/hotline` | رقم خدمة العملاء |

يُرسل `Authorization: Bearer` تلقائياً عند وجود `token` في Zustand ([`lib/api-client.ts`](../lib/api-client.ts))، ما عدا مسارات الاستثناء (login, firebase, إلخ).

**استدعاءات `fetch` مباشرة (ليس `apiClient`):** لوحة التحكم `ControlPanel`، PWA/push، وبعض شاشات dev/control — مذكورة تحت `control` و`push` أدناه.

## مسارات `app/api` — حسب المجال

### متجر (عموماً عام)

| المسار | Upstream / سلوك |
|---------|-----------------|
| `GET/POST` [`/api/orders`](../app/api/orders/route.ts) | `GET` يطلب جلسة؛ `POST` → `woo.post("/orders", body)` |
| `GET` [`/api/orders/track`](../app/api/orders/track/route.ts) | بحث/جلب من Woo `orders` |
| `GET` [`/api/products`](../app/api/products/route.ts) | Woo products |
| `GET` [`/api/products/[id]`](../app/api/products/[id]/route.ts) | Woo product by id |
| `GET` [`/api/categories`](../app/api/categories/route.ts) | Woo categories |
| `GET` [`/api/categories/[id]`](../app/api/categories/[id]/route.ts) | Woo category by id |
| `GET/POST` [`/api/reviews`](../app/api/reviews/route.ts) | Woo product reviews read/write |
| `GET` [`/api/user`](../app/api/user/route.ts) | `PUT/GET` عميل وو (JWT) |
| `PUT` | نفس الملف — تحديث billing/shipping |
| `GET` [`/api/store/hotline`](../app/api/store/hotline/route.ts) | مسار مخصص على WordPress إن وُجد، وإلا `STORE_CUSTOMER_HOTLINE` / افتراضي |
| `GET` [`/api/m/[[...path]]`](../app/api/m/[[...path]]/route.ts) | **ليست Woo:** بث من Firebase Storage (مسارات `cms/...`) |
| `GET` [`/api/pwa-sw`](../app/api/pwa-sw/route.ts) | توليد/خدمة سياق worker (حسب الملف) |

### مصادقة

| المسار | Upstream |
|--------|----------|
| `POST` [`/api/auth/login`](../app/api/auth/login/route.ts) | Woo + إصدار JWT مخصص |
| `POST` [`/api/auth/logout`](../app/api/auth/logout/route.ts) | تفادي الجلسة |
| `POST` [`/api/auth/register`](../app/api/auth/register/route.ts) | `woo.post("/customers", …)` |
| `POST` [`/api/auth/firebase`](../app/api/auth/firebase/route.ts) | Firebase Admin + ربط عميل وو + JWT ([`list-woo-orders`](../lib/list-woo-orders-for-session.ts) تستخدم `firebase_uid`) |

### لوحة التحكم `control` (داخلية)

تتطلب عادة جلسة/صلاحية لوحة — التفاصيل داخل كل route: CMS، رفع، إشعارات، webhooks وو، صحة، إلخ.

- [`/api/control/cms`](../app/api/control/cms/route.ts) — `GET/PUT` محتوى إعدادات
- [`/api/control/session`](../app/api/control/session/route.ts) — جلسة لوحة
- [`/api/control/upload`](../app/api/control/upload/route.ts)، [`/api/control/media`](../app/api/control/media/route.ts)
- [`/api/control/seed`](../app/api/control/seed/route.ts)، [`/api/control/panel-access`](../app/api/control/panel-access/route.ts)
- [`/api/control/notifications`](../app/api/control/notifications/route.ts) — FCM/إشعارات
- [`/api/control/woocommerce/webhooks`](../app/api/control/woocommerce/webhooks/route.ts)، [`webhook-deliveries`](../app/api/control/woocommerce/webhook-deliveries/route.ts)
- [`/api/control/diagnostics/*`](../app/api/control/diagnostics/) — اختبارات/ذاكرة/سكيما
- [`/api/control/health-check`](../app/api/control/health-check/route.ts)، [`/api/control/health/aggregates`](../app/api/control/health/aggregates/route.ts)

### Webhooks

| المسار | غرض |
|--------|------|
| [`/api/webhooks/woocommerce`](../app/api/webhooks/woocommerce/route.ts) | وارد من وو (مزامنة/فحص حسب التنفيذ) |
| [`/api/webhooks/external-data`](../app/api/webhooks/external-data/route.ts) | بيانات خارجية |

### أدوات dev

| المسار | غرض |
|--------|------|
| [`/api/dev/health-check`](../app/api/dev/health-check/route.ts) | فحص صحة |
| [`/api/dev/woo-status`](../app/api/dev/woo-status/route.ts) | حالة الاتصال بـ Woo |

### أخرى

| المسار | غرض |
|--------|------|
| `POST` [`/api/push/subscribe`](../app/api/push/subscribe/route.ts) | تسجيل جهاز FCM (انظر [`useFcmWebPush`](../features/push/useFcmWebPush.ts)) |

## استدعاءات Woo من السيرفر (بدون المرور بـ `apiClient` البراوزر)

مثال: [`getProductByIdMeta`](../features/products/services/getProductByIdMeta.ts)، [`getCategoryBySlugMeta`](../features/categories/services/getCategoryBySlugMeta.ts)، [`getSitemapInventory`](../features/seo/services/getSitemapInventory.ts)، [`lib/woo-diagnostics`](../lib/woo-diagnostics.ts)، مزامنة الـ webhooks — تستعمل `createWooClient` في **مكوّنات سيرفر** أو سكربتات.

## واجهة الخروج فقط: ما هو «وهمي/ناقص» (حسب الكود الحالي)

- **الكوبونات في صفحة الدفع:** واجهة فقط — لا `coupon_lines` — انظر [`checkout-coupon-row`](../features/checkout/components/checkout-coupon-row.tsx).
- **السلة → طلب:** تُرسل `product_id` + `quantity` فقط لكل سطر ([`to-create-order-payload`](../features/checkout/lib/to-create-order-payload.ts))؛ لا `variation_id` (متغيّرات وو) في النموذج الحالي.
- **Mock:** عند `NEXT_PUBLIC_USE_MOCK` توجد مسارات بديلة للطلبات وغيرها.

## متغيرات بيئة (مؤشر)

راجع [`.env.local.example`](../.env.local.example) — منها `WC_BASE_URL`، `WC_CONSUMER_KEY`، `WC_CONSUMER_SECRET`، `FIREBASE_SERVICE_ACCOUNT_JSON`، hotline، إلخ.

## متى تُكمل «كل التفاصيل»؟

هذه الوثيقة **جرد**؛ اختيار **تنفيذ** لاحق (كوبونات، variations، توسيع `meta_data`) يكون حسب أولوية المنتج والكتالوج الفعلي — وليس شرطاً لجرد الـ API نفسه.
