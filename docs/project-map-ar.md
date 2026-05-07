# خريطة الوصول السريعة للمشروع

هذا الملف مرجع سريع لتحديد مكان الصفحة أو الخدمة قبل التعديل. حدّثه عند إضافة صفحة رئيسية أو API جديد.

## صفحات المتجر

| المسار | ملف الصفحة | مكوّن العرض الأساسي |
| --- | --- | --- |
| `/` | `app/(storefront)/page.tsx` | `components/pages/HomePageContent.tsx` |
| `/products` | `app/(storefront)/products/page.tsx` | `components/pages/ProductsPageContent.tsx` |
| `/products/[id]` | `app/(storefront)/products/[id]/page.tsx` | `components/pages/ProductDetailPageContent.tsx` |
| `/categories` | `app/(storefront)/categories/page.tsx` | `components/pages/CategoriesPageContent.tsx` |
| `/categories/[slug]` | `app/(storefront)/categories/[slug]/page.tsx` | `components/pages/CategorySlugPageContent.tsx` |
| `/offers` | `app/(storefront)/offers/page.tsx` | `components/pages/OffersPageContent.tsx` |
| `/search` | `app/(storefront)/search/page.tsx` | `components/pages/SearchPageContent.tsx` |
| `/cart` | `app/(storefront)/cart/page.tsx` | `components/pages/CartPageContent.tsx` |
| `/checkout` | `app/(storefront)/checkout/page.tsx` | `features/checkout/components/CheckoutForm.tsx` |
| `/wishlist` | `app/(storefront)/wishlist/page.tsx` | `components/pages/WishlistPageContent.tsx` |
| `/account` | `app/(storefront)/account/page.tsx` | `components/pages/AccountPageContent.tsx` |
| `/login` | `app/(storefront)/login/page.tsx` | `components/pages/LoginPageContent.tsx` |
| `/my-orders` | `app/(storefront)/my-orders/page.tsx` | `components/pages/MyOrdersPageContent.tsx` |
| `/my-reviews` | `app/(storefront)/my-reviews/page.tsx` | `components/pages/MyReviewsPageContent.tsx` |
| `/track-order` | `app/(storefront)/track-order/page.tsx` | `components/pages/OrderTrackingPageContent.tsx` |
| `/about` | `app/(storefront)/about/page.tsx` | `components/pages/AboutPageContent.tsx` |
| `/branches` | `app/(storefront)/branches/page.tsx` | `components/pages/BranchesPageContent.tsx` |
| `/retailers` | `app/(storefront)/retailers/page.tsx` | `components/pages/RetailersPageContent.tsx` |
| `/contact` | `app/(storefront)/contact/page.tsx` | `components/pages/ContactPageContent.tsx` |
| `/warranty` و`/warranty/[slug]` | `app/(storefront)/warranty/*/page.tsx` | `components/pages/OfficialWpPageContent.tsx` |
| `/terms`, `/privacy`, `/returns` | `app/(storefront)/*/page.tsx` | legal shell + official WP content |

## لوحة التحكم

| المسار | الملف | المكوّنات الأقرب |
| --- | --- | --- |
| `/control/login` | `app/control/login/page.tsx` | صفحة دخول التحكم |
| `/control` | `app/control/page.tsx` | `features/control/components/ControlPanel.tsx` |
| `/control/dev` | `app/control/dev/page.tsx` | أدوات تشخيص التطوير |
| `/control/woo-api` | `app/control/woo-api/page.tsx` | `features/control/components/ControlWooApiTab.tsx` |

## طبقات الخدمات

| المجال | الملفات الأساسية |
| --- | --- |
| المنتجات | `features/products/services/*`, `app/api/products/*`, `lib/create-woo-client.ts` |
| التصنيفات | `features/categories/services/*`, `app/api/categories/*` |
| الطلبات | `features/orders/services/*`, `app/api/orders/*` |
| الدفع | `features/checkout/*`, `features/checkout/schema.ts` |
| التقييمات | `features/reviews/*`, `app/api/reviews/*` |
| CMS والتحكم | `features/cms/*`, `features/control/*`, `app/api/control/*` |
| WooCommerce webhooks | `features/woocommerce/*`, `app/api/webhooks/woocommerce/route.ts`, `app/api/control/woocommerce/*` |
| PWA والإشعارات | `app/api/pwa-sw/route.ts`, `features/push/*`, `lib/storefront-offline-cache.ts` |

## ملفات مشتركة مهمة

| الملف | الدور |
| --- | --- |
| `app/layout.tsx` | metadata العامة، JSON-LD، خطوط وأصل التطبيق |
| `app/(storefront)/layout.tsx` | shell المتجر والـ CMS public content |
| `components/Navbar.tsx` | هيدر المتجر ودرج الموبايل |
| `components/layout/site-shell.tsx` | تركيب الهيدر/الفوتر/الكروم السفلي |
| `lib/storefront-nav-links.ts` | روابط الهيدر ودرج الموبايل |
| `lib/constants.ts` | المسارات والثوابت العامة |
| `lib/site-branding.ts` | نصوص الهوية وSEO الافتراضية |
