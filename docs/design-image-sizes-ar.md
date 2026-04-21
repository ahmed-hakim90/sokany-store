# مقاسات الصور للمصمم (Sokany Store)

مرجع موحّد لتصدير الصور ورفعها في الأماكن الصحيحة. الصور تُعرض غالباً بـ `object-cover` داخل إطار ثابت؛ أي جزء زائد يُقصّ — ركّز العنصر المهم في **المنتصف** أو ضمن **منطقة آمنة** في الوسط.

| الاستخدام | المصدر / المسار | المقاس أو النسبة الموصى بها | ملاحظات |
|-----------|-----------------|------------------------------|---------|
| شرائح الهيرو (الصفحة الرئيسية) | `public/images/hero/` — انظر [`public/images/hero/README.md`](../public/images/hero/README.md) | **330×540** بكسل (أو **660×1080** لـ Retina)؛ نسبة تقريبية **11∶18** | العرض المعروض للبطاقة ~**300px** وارتفاع حتى **400px** أو **70dvh** (الأصغر). صيغة: WebP أو JPG، جودة **80–90%**. الكود: [`features/home/components/home-hero-banner.tsx`](../features/home/components/home-hero-banner.tsx). |
| بانر «حصرياً» لكل قسم أب (ترتيب بالرقم) | `public/images/banner-section/` — التسمية: [`public/images/banner-section/README.md`](../public/images/banner-section/README.md) | عرض كامل تقريباً؛ ارتفاع مرجعي **≥ 224px** (`min-h` ≈ 14rem)؛ للتصدير الآمن: **عرض 1200–1600px** × ارتفاع **450–600px** (أفقي) | على الجوال الخلفية **100vw**؛ على الشاشات الأوسع يُحمَّل عرض منطقي حتى ~**520px** في جانب الصورة. `object-cover`. الكود: [`features/home/components/home-category-exclusive-banner.tsx`](../features/home/components/home-category-exclusive-banner.tsx). يمكن ربط نفس الصور من لوحة التحكم (CMS) بنفس الترتيب. |
| شريط صور التصنيفات (سكروول تحت الهيرو) | صور التصنيف من WooCommerce (أو placeholder) | **240×120** بكسل (**2∶1**)؛ للـ Retina: **480×240** | بطاقات ثابتة في الواجهة. الكود: [`features/home/components/home-category-image-scroller.tsx`](../features/home/components/home-category-image-scroller.tsx). |
| سيكشن صورة قسم عريضة (`HomeCategoryImageSection`) | صورة التصنيف من الـ API | **2∶1** — مثال تصدير: **896×448** (1×) أو **1792×896** (2×) | `sizes` حتى **896px** عرضاً. الكود: [`features/home/components/home-category-image-section.tsx`](../features/home/components/home-category-image-section.tsx). |
| بطاقة ترويج أسفل الصفحة (نص + صورة) | من إعدادات الصفحة / `imageSrc` في `HomePromoCard` | أفقي؛ ارتفاع منطقي **≥ 240px** (`md:min-h-[15rem]`); تصدير ~**1040×600** أو أوسع بنفس النسبة | على الجوال: خلفية **100vw**؛ على الديسكتوب جانب الصورة حتى ~**520px** عرضاً. الكود: [`features/home/components/home-promo-card.tsx`](../features/home/components/home-promo-card.tsx). |
| شبكة Bento للتصنيفات (ديسكتوب) | صور التصنيف من WooCommerce | لا مقاس بكسل واحد؛ خلايا متعددة الأحجام — صورة **مربعة أو أفقية** بمساحة آمنة وسطية | `object-cover` مع `sizes` تقريباً **50vw** / **28vw**. الكود: [`features/home/components/home-category-bento.tsx`](../features/home/components/home-category-bento.tsx). |

## صور التصنيف في WooCommerce

صورة التصنيف الواحدة قد تُستخدم في أكثر من مكان (بانر القسم، Bento، الشريط، إلخ). الأفضل:

- دقة كافية (**عرض ≥ 1200px** للصور الأفقية أو **مربع ≥ 1000×1000** إن أمكن).
- محتوى مهم في **منتصف** الإطار لتقليل ضرر القصّ عند النِسَب المختلفة.

## رموز سريعة

- **`object-cover`**: تغطية كاملة للإطار مع قصّ الزوائد.
- **Retina / 2×**: ضعف أبعاد التصدير عند الحاجة لشاشات عالية الكثافة.
