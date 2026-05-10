# متصفحات داخل التطبيق (Facebook / Instagram / WebView)

## Service Worker

- على **Safari العادي** و**Chrome** يعمل التسجيل عند `NEXT_PUBLIC_ENABLE_SW=true` (انظر [`components/PwaEngagementStack.tsx`](../components/PwaEngagementStack.tsx)).
- في **WebView فيسبوك/إنستغرام** قد يكون الـ SW **معطّلاً أو غير موثوق**. المتجر يجب أن يبقى قابلاً للاستخدام **بدون** SW (طلبات الشبكة مباشرة، بدون افتراض كاش للـ worker).
- للتشخيص: عطّل SW مؤقتاً بـ `NEXT_PUBLIC_ENABLE_SW=false` أو عبر إلغاء التسجيل في نفس المكوّن.

## التخزين المحلي

- كاش TanStack المخزَّن في `localStorage` (انظر [`lib/storefront-offline-cache.ts`](../lib/storefront-offline-cache.ts)) قد يُقيَّد أو يُفرَّغ في سياقات طرف ثالث. لا تعتمد على استعادة الكاش لعرض المحتوى الحرج قبل أول `fetch` ناجح.

## التخطيط والسكرول

- تتبعات **sticky / fixed** (الهيدر، الكروم السفلي، الهالة خلف الهيرو) قد تتصرف بشكل أسوأ في WebViews القديمة مقارنة بـ Safari الكامل. راجع تعديلات WebKit في [`components/layout/mobile-scroll-collapse-controller.tsx`](../components/layout/mobile-scroll-collapse-controller.tsx) و[`mobile-hero-lime-atmosphere.tsx`](../components/layout/mobile-hero-lime-atmosphere.tsx).

## اختبار مقترح

1. فتح رابط المتجر من تطبيق فيسبوك/إنستغرام (نشرة، قصة، رسالة).
2. التحقق من تحميل الصفحة الرئيسية والكتالوج دون شاشة بيضاء.
3. تكرار الاختبار مع `NEXT_PUBLIC_ENABLE_SW=true` و`false`.

## اختبار آلي

- دخان سكرول WebKit: [`tests/mobile_scroll_webkit.spec.ts`](../tests/mobile_scroll_webkit.spec.ts) (`npx playwright test tests/mobile_scroll_webkit.spec.ts --project=webkit`).
