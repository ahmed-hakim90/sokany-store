# تقرير UI/UX مختصر - Sokany Store

**التاريخ:** 2026-05-10  
**النطاق:** UI/UX فقط، بدون redesign، بدون مكتبات جديدة، وبدون تغيير Architecture.  
**المناطق:** homepage، product cards، mobile navigation، cart drawer، checkout، toast messages، loading skeletons، spacing، typography، mobile thumb UX.

---

## 1. نقاط القوة الحالية

- تجربة الموبايل واخدة اهتمام واضح: `MobileCommerceChrome` بيحسب ارتفاع الـ bottom chrome ويحطه في CSS variables، وده بيخلي `ToastProvider` يطلع الرسائل فوق شريط السلة والتنقل بدل ما يتغطوا.
- دعم RTL كويس في أماكن حساسة: `ProductCard` بيستخدم `dir="rtl"` للعناوين و`dir="ltr"` للأرقام/النِسب، وفيه استخدام لـ logical classes زي `ps-` و`pe-` و`ms-`.
- الـ bottom navigation مناسب للإبهام: `bottom-nav.tsx` فيه `min-h-[3.5rem]`، وده أكبر من الحد الأدنى المريح للّمس.
- الـ cart drawer معمول كسلوك موبايل مفهوم: `MobileCartBottomSheet` فيه handle، close button، scroll داخلي، و`Drawer.Title` / `Drawer.Description` للـ accessibility.
- الـ homepage بتستخدم lazy loading للأقسام عبر `useNearViewport` في `HomePageInteractiveClient`، فمش كل سكك المنتجات بتطلب API مرة واحدة.
- الـ product cards فيها تفاصيل تسويقية كويسة: sale badge، rating، guarantee line، wishlist، add-to-cart feedback، وصور بتستخدم `AppImage`.
- الـ skeletons قريبة من شكل الكروت الحقيقية، وده بيقلل الإحساس بالقفز أثناء التحميل.
- الحركة معمولة بحذر نسبي: فيه احترام لـ `prefers-reduced-motion` في كروت المنتجات، wishlist burst، cart fly animation، وcart peek.
- الـ checkout CTA واضح وقوي على الموبايل (`h-14`)، وفيه طبقات مساعدة زي `CheckoutReassuranceNote` و`CheckoutSupportFooter`.
- رسائل الـ toast عربية وRTL، وفيها ألوان semantic منفصلة للنجاح/الخطأ/التحذير.

---

## 2. المشاكل

- في `ProductCard.tsx` زر `أضف للسلة` في الكارت المضغوط ارتفاعه `h-8` ونصه `text-[10px]`؛ ده صغير على الإبهام وصعب القراءة بالعربي.
- صورة المنتج في `mobileCompact` ارتفاعها `h-[136px]`، وده بيخلي المنتج باين صغير جوه grid من عمودين، خصوصاً على شاشات 390px.
- في `ProductCard.tsx` فيه badges كتير بحجم `text-[9px]` و`text-[10px]` زي video badge وtrust badge؛ النص العربي والنِسب بتبقى مضغوطة.
- `CheckoutForm.tsx` بيعرض `CheckoutSummary` قبل حقول الشحن على الموبايل (`order-1`)؛ المستخدم بيشوف ملخص الطلب قبل ما يبدأ يكتب بياناته، وده بيزود scroll وفركشن.
- `app/globals.css` فيه fallback لـ `--mobile-commerce-chrome-height: 12rem` قبل قياس JS؛ ده ممكن يعمل فراغ سفلي كبير في أول paint.
- `CartPageContent.tsx` بيستخدم thumbnail بحجم `h-20 w-20` للموبايل؛ صغير شوية لو المستخدم عايز يتأكد من المنتج قبل الدفع.
- عناوين أقسام الـ homepage في `HomePageInteractiveClient` بحجم `text-base` على الموبايل؛ واضحة، بس مش بتفصل بصرياً بين السكك بما يكفي.
- في `ToastProvider.tsx` مدة الرسالة `4000ms`؛ الرسائل العربية الطويلة أو رسائل الخطأ ممكن تختفي بسرعة.
- في `ProductDetailPageContent.tsx` فيه paragraph فاضي تقريباً للزوار غير المسجلين تحت reviews؛ بيضيف مساحة/DOM من غير فائدة واضحة.
- في `CheckoutForm.tsx` class فيها `base` مع `h-14` على زر تأكيد الطلب؛ غالباً typo، ومش UI ظاهر لو Tailwind تجاهلها، بس تستاهل cleanup لاحق.

---

## 3. أهم 10 تحسينات UI

1. في `ProductCard.tsx` كبّر زر `أضف للسلة` في الكارت المضغوط من `h-8` إلى `h-10` على الأقل، وارفع النص من `text-[10px]` إلى `text-xs`.
2. زوّد ارتفاع صورة `mobileCompact` في `ProductCard.tsx` من `h-[136px]` إلى حوالي `h-[160px]`، ومع `sm` ممكن توصل لـ `h-[176px]`.
3. في `CheckoutForm.tsx` خلّي حقول الشحن تيجي قبل `CheckoutSummary` على الموبايل، وسيب الـ summary sticky على desktop زي ما هو.
4. وحّد أحجام الـ badges الصغيرة في `ProductCard.tsx` و`ProductGallery.tsx` على حد أدنى `text-[11px]` أو `text-xs`.
5. خلي حالة out-of-stock في `ProductCard` لها شكل واضح غير مجرد `disabled:opacity-45`، مثلاً سطح رمادي ونص أقوى.
6. قلّل fallback `--mobile-commerce-chrome-height` في `app/globals.css` من `12rem` لقيمة أقرب للـ bottom nav الحقيقي، زي `5rem`.
7. كبّر thumbnail المنتج في `CartPageContent.tsx` من `h-20 w-20` إلى `h-24 w-24` على الموبايل، ومع `sm` ممكن `h-28 w-28`.
8. ارفع وزن عناوين أقسام الـ homepage في `HomePageInteractiveClient` من `text-base` إلى `text-lg` على الموبايل، مع مسافة/فاصل بسيط لو احتاجت.
9. مدّد مدة الـ toast في `ToastProvider.tsx` من `4000ms` إلى `5000ms` علشان الرسائل العربية تتقري براحة.
10. راجع عناصر الموبايل الأصغر من 44px في `mobile-nav-drawer.tsx` و`ToastProvider.tsx`، خصوصاً close buttons والروابط الداخلية.

---

## 4. تغييرات خطرة نتجنبها

- ما تغيّرش نظام RTL والـ logical spacing بشكل واسع؛ الموجود شغال كويس وأي تغيير عام ممكن يكسر اتجاه النص أو الأسعار.
- ما تشيلش `env(safe-area-inset-bottom)` من `MobileCommerceChrome` أو `MobileCartBottomSheet`؛ ده مهم جداً لموبايلات iPhone الحديثة.
- ما تغيّرش نمط `useNearViewport` في homepage؛ ده جزء مهم من الأداء وتقليل طلبات API.
- ما تلغيش `prefers-reduced-motion` guards؛ دي حماية accessibility مهمة.
- ما تكبّرش كل المسافات مرة واحدة؛ الأفضل تحسين الكروت والـ checkout والـ cart بالترتيب علشان ما يحصلش CLS أو كثافة أقل من اللازم.
- ما تغيّرش `vaul` drawer behavior أو `overscroll-contain` في cart drawer من غير اختبار iOS؛ ده ممكن يعمل scroll bleed.
- ما تضيفش navigation layer جديدة فوق `MobileCommerceChrome`؛ المشكلة الحالية مش محتاجة architecture جديد.

---

## 5. الملفات المتأثرة

- `components/pages/home/HomePageInteractiveClient.tsx`
- `components/pages/home/HomePageShell.tsx`
- `features/products/components/ProductCard.tsx`
- `features/products/components/ProductSkeleton.tsx`
- `features/products/components/ProductGallery.tsx`
- `features/products/components/product-detail-sticky-cart.tsx`
- `features/products/components/product-quick-view-modal.tsx`
- `components/layout/bottom-nav.tsx`
- `components/layout/mobile-nav-drawer.tsx`
- `components/layout/mobile-commerce-chrome.tsx`
- `features/cart/components/MobileCartBottomSheet.tsx`
- `components/pages/CartPageContent.tsx`
- `features/checkout/components/CheckoutForm.tsx`
- `app/(storefront)/checkout/page.tsx`
- `providers/ToastProvider.tsx`
- `app/globals.css`

---

## 6. Phase 1 المقترحة فقط

Phase 1 يبقى صغير ومباشر، من غير redesign:

1. تحسين touch targets في `ProductCard`: زر السلة، badges الصغيرة، وحالة out-of-stock.
2. تحسين perceived product quality: رفع ارتفاع صورة الكارت الموبايل شوية.
3. تقليل friction في checkout: حقول الشحن قبل الملخص على الموبايل.
4. تحسين cart confidence: تكبير صور المنتجات في `CartPageContent`.
5. ضبط chrome/toast comfort: تقليل fallback height وتمديد مدة toast.

ده كفاية كأول مرحلة لأنه يمس أكتر حاجات بتأثر على الشراء بالموبايل: رؤية المنتج، الضغط بالإبهام، السلة، وإتمام الطلب.
