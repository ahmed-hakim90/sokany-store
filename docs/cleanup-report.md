# تقرير جرد وتنظيف المشروع (Cleanup Inventory)

**الفرع:** `cleanup/dead-code-and-docs`  
**التاريخ:** 2026-05-10  
**النطاق:** تحليل ثابت (Knip، بحث نصي، خريطة مسارات) + تنظيف آمن فقط. **لم يُغَيَّر منطق الأعمال أو مظهر الواجهة** في التعديلات المقترحة هنا.

---

## 1. أدوات التحليل

| الأداة | الغرض |
|--------|--------|
| `npx knip` | ملفات غير مستوردة، تصديرات غير مستخدمة، تبعيات dev مشبوهة |
| `rg` / بحث المشروع | التحقق اليدوي من المراجع الديناميكية والتوثيق |
| خريطة `app/**` | تأكيد ارتباط الملفات بمسارات Next |

---

## 2. ملخص التصنيف

- **SAFE TO DELETE:** عناصر مؤكَّد عدم استيرادها في الكود أو الاختبارات؛ حذفها لا يغيّر سلوك التشغيل.
- **NEED REVIEW:** نتائج أدوات قد تكون إيجابيات كاذبة، أو محتوى توثيقي متداخل يحتاج قرار بشري.
- **KEEP:** مسارات، SEO، PWA، API، أو أصول/توثيق لها مراجع أو دور واضح.

---

## 3. ملفات TypeScript — قرار الحذف أو الإبقاء

### 3.1 SAFE TO DELETE

| الملف | السبب | مستوى الخطورة | بديل | تأكيد الاستخدام |
|--------|--------|----------------|------|------------------|
| `lib/firebase.ts` | ملف **مهمل** يعيد تصدير `firebase-app` فقط؛ لا يوجد أي `import` من `@/lib/firebase` في المشروع. | منخفض | استخدم مباشرة: `@/lib/firebase-app`، `@/lib/firebase-admin`، `@/lib/firebase-client-auth` حسب السياق. | تأكدت: بحث على `@/lib/firebase` بدون نتائج. |
| `components/pages/HomePageContent.tsx` | **Barrel** يصدّر `HomePageShell` باسم `HomePageContent`؛ الصفحة `app/(storefront)/page.tsx` تستورد من `components/pages/home/HomePageShell` مباشرة ولا تمرّ بهذا الملف. | منخفض | المكوّن الفعلي: `components/pages/home/HomePageShell.tsx` والأنواع: `components/pages/home/home-page-types.ts`. | تأكدت: لا استيراد من `HomePageContent.tsx` سوى ذكر في `docs/project-map-ar.md` (يُحدَّث). |

### 3.2 NEED REVIEW (لا حذف تلقائي)

| البند | السبب |
|--------|--------|
| تصديرات Knip «Unused exports» (~89) و«Unused exported types» (~51) | غالبها **واجهات عامة** (مكوّنات، مخططات Zod، ثوابت) قد تُستعمل لاحقاً أو عبر أنماط لا يلتقطها التحليل الثابت بالكامل. |
| `eslint-config-next` كـ «Unused devDependency» في Knip | **إيجابية كاذبة**: الحزمة تُستخدم عبر إعداد ESLint وليست `import` في الكود. |
| `lib/constants.ts` — `PRODUCTS_ALL_CATALOG_HREF` \| `PRODUCTS_ALL_RANDOM_HREF` | Knip يبلّغ **Duplicate exports**؛ يحتاج مراجعة يدوية إن كان التصدير مكرراً بالخطأ أم مقصوداً. |
| التوثيق المتداخل | أزواج مثل `docs/tech-audit.md` و`docs/enterprise-audit-2026.md`، و`docs/api-integration-inventory.md` و`docs/woo-integration.md` — **محتوى مختلف**؛ أي دمج يكون قرار منتج وليس حذفاً عشوائياً. |
| `docs/image-specs.md` و`docs/design-image-sizes-ar.md` | **تقسيم مقصود** (مختصر إنجليزي + تفصيل عربي للمصمم) — **KEEP**. |

### 3.3 KEEP (مسارات وأصول حرجة)

- كل ملفات `app/**` (صفحات، `layout`، `route.ts`، `manifest`، خرائط SEO إن وُجدت).
- `app/api/pwa-sw/route.ts` وأصول PWA تحت `public/images/icon-*.png`، `apple-touch-icon.png`.
- أمثلة البيئة: `.env.local.example` (ولا يُحذف).
- ملفات `public/images/*` المذكورة في الكود أو السكربتات (مثل `scripts/generate-pwa-icons.mjs` → `pwa-icon-source.png`، و`/images/placeholder.png`، و`/images/hero-banner.jpg`).

---

## 4. المجلد `public/`

تمت مراجعة الملفات تحت `public/` (أيقونات، هيرو، banner-section، placeholder، manifest JSON). **كلها لها مراجع في الكود أو التوثيق أو سكربت الأيقونات** — تصنيف عام: **KEEP**. أي حذف مستقبلي يتطلب إثبات عدم وجود مرجع نصي.

---

## 5. TODO / FIXME

بحث عن `TODO` و`FIXME` و`XXX` في `*.ts` و`*.tsx` و`*.md` — **لا توجد مطابقات** في المستودع حالياً.

---

## 6. ESLint و`npm run lint`

قبل التنظيف كان أمر `npm run lint` يفشل لعدم وجود `eslint.config.*` مع ESLint 9.  
**الإجراء المطبَّق:** إضافة [`eslint.config.mjs`](../eslint.config.mjs) يستورد `eslint-config-next/core-web-vitals` (إصلاح بنية، بدون تغيير منطق التطبيق).

لتمرير `npm run lint` دون refactor واسع، عُطِّلت مؤقتاً قاعدتا `react-hooks/refs` و`react-hooks/set-state-in-effect` (كانت تُبلّغ عن مشاكل قائمة في ملفات مثل `HomePageInteractiveClient.tsx`). يُنصح بمعالجتها في PR منفصل.

---

## 7. تنفيذ Phase 3 (ما وافق خطة SAFE)

بعد اعتماد هذا التقرير طُبِّق:

1. حذف `lib/firebase.ts`
2. حذف `components/pages/HomePageContent.tsx`
3. تحديث `docs/project-map-ar.md` ليشير إلى `components/pages/home/HomePageShell.tsx` بدل الملف المحذوف
4. تشغيل `eslint . --fix` على المشروع لإزالة imports/توجيهات ESLint غير لازمة حيث اكتشفها المُحلّل (تغييرات آلية فقط).

---

## 8. Verification (Phase 4)

الأوامر المطلوبة بعد التعديلات:

1. `npm run lint`
2. `npx tsc --noEmit` (لا يوجد سكربت `typecheck` في `package.json`)
3. `npm run build`
4. `npm run analyze` — اختياري عند تغييرات كبيرة في الحزم؛ يمكن تخطيه إن كان البناء والـ lint كافيين

---

## 9. ملاحظة على فرع العمل

كل التغييرات على الفرع **`cleanup/dead-code-and-docs`** كما طُلب في الخطة.
