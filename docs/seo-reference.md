# مرجع SEO — Sokany Store

**الغرض:** ملف واحد لمراجعة أين يُضبط SEO في المشروع (Next.js App Router) وروابط الملفات المعتمدة.

---

## 1) القاعدة العامة (كل الموقع)

| الملف | ماذا |
|--------|------|
| [`app/layout.tsx`](../app/layout.tsx) | `generateMetadata`: `metadataBase`، قالب `title`، وصف افتراضي، Open Graph، Twitter، أيقونات؛ جزء من البيانات من `getPublicSiteContent()` |
| [`lib/site.ts`](../lib/site.ts) | `getSiteUrl()` / `toAbsoluteSiteUrl()` — `NEXT_PUBLIC_SITE_URL` (أو Vercel) للروابط المطلقة و canonical |
| [`app/manifest.ts`](../app/manifest.ts) | PWA: الاسم، الوصف، الألوان، الأيقونات (للتثبيت — ليس استبدال `<meta>` لكنه يرتبط بالتجربة العامة) |

**بيئة (عادة من لوحة الاستضافة):**  
`NEXT_PUBLIC_SITE_URL`، `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`، وتوحيد العلامة عبر `NEXT_PUBLIC_SITE_NAME` / السياق في [`docs/project-vision.md`](./project-vision.md).

---

## 2) فهرسة وفهرس الموقع

| الملف | ماذا |
|--------|------|
| [`app/sitemap.ts`](../app/sitemap.ts) | توليد `sitemap.xml` — رئيسية، قوائم، صفحات معلومات، + منتجات وفئات من [`features/seo/services/getSitemapInventory.ts`](../features/seo/services/getSitemapInventory.ts) — `revalidate: 3600` |
| [`app/robots.ts`](../app/robots.ts) | `robots.txt` — `disallow` للمسارات الحساسة + ربط `sitemap.xml` |

---

## 3) أنماط الصفحات (ماذا تفتح عند المراجعة)

- **رئيسية — مثال كامل:** [`app/page.tsx`](../app/page.tsx) — `generateMetadata` (عنوان، وصف، keywords، OG، Twitter، `canonical`، `robots`).
- **ديناميكي — منتج:** [`app/products/[id]/page.tsx`](../app/products/[id]/page.tsx) — `generateMetadata` من `getProductByIdMeta` + `ProductJsonLd` + `BreadcrumbJsonLd`.
- **ديناميكي — فئة:** [`app/categories/[slug]/page.tsx`](../app/categories/[slug]/page.tsx) — `generateMetadata` + `BreadcrumbJsonLd`.
- **بحث — عدم فهرسة النتائج:** [`app/search/page.tsx`](../app/search/page.tsx) — `generateMetadata` حسب `?q`، `robots.index: false`.
- **صفحة ثابتة بسيطة:** [`app/about/page.tsx`](../app/about/page.tsx) — `export const metadata` (بدل دالة).
- **لوحة تحكم — لا فهرسة:** [`app/control/layout.tsx`](../app/control/layout.tsx) — `robots: { index: false, follow: false }` لفرع `/control` كاملاً.

**قاعدة:** إن لم تُعرّف الصفحة `metadata` / `generateMetadata`، **ترث** من [`app/layout.tsx`](../app/layout.tsx).

---

## 4) بيانات منظمة (JSON-LD)

| الملف | النوع |
|--------|--------|
| [`components/seo/OrganizationJsonLd.tsx`](../components/seo/OrganizationJsonLd.tsx) + [`WebSiteJsonLd.tsx`](../components/seo/WebSiteJsonLd.tsx) | في `app/layout.tsx` — منظمة + موقع |
| [`components/seo/ProductJsonLd.tsx`](../components/seo/ProductJsonLd.tsx) | صفحة المنتج |
| [`components/seo/BreadcrumbJsonLd.tsx`](../components/seo/BreadcrumbJsonLd.tsx) | منتج + فئة |

تعديل حقول البراند/الهاتف/الشعار للمنظمة يظهر في لوحة التحكم (Control Panel) بقدر ارتباطهما بالبيانات المخزّنة.

---

## 5) سرد سريع — صفحات بها `metadata` في `app/`

`layout`، `page` (الرئيسية)، `all`، `products`، `products/[id]`، `categories`، `categories/[slug]`، `search`، `about`، `contact`، `branches`، `retailers`، `warranty`، `terms`، `privacy`، `returns`، `cart`، `checkout`، `account`، `wishlist`، `my-orders`، `track-order`، `login`، `offline`، `control/layout`.

---

*آخر تحديث: أبريل 2026 — عند تغيير هيكل المسارات أو الـ metadata، حدّث هذا الملف في نفس الـ PR.*
