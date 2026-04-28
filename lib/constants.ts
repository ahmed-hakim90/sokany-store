export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/**
 * تعديل طلب الضيف (واجهة «طلباتي» + ‎`POST /api/orders/guest/amend`‎).
 * الافتراضي: **معطّل**. فعّل بـ ‎`GUEST_ORDER_AMEND_ENABLED=true`‎ في بيئة الخادم فقط.
 */
export const GUEST_ORDER_AMEND_ENABLED =
  process.env.GUEST_ORDER_AMEND_ENABLED === "true";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Sokany-Eg";
/** Arabic brand line for SEO titles (product/category pages). Override via env for «سوكانى مصر» vs legal name. */
export const SITE_BRAND_TITLE_AR =
  process.env.NEXT_PUBLIC_SITE_BRAND_TITLE_AR ?? "سوكانى المغربى";
/** Compact mobile header wordmark (Latin mark; override via env). */
export const SITE_WORDMARK =
  process.env.NEXT_PUBLIC_SITE_WORDMARK ?? "SOKANY-Eg";
/** Latin label for installable PWA (`manifest` name / short_name). Override via env. */
export const PWA_INSTALL_NAME =
  process.env.NEXT_PUBLIC_PWA_INSTALL_NAME?.trim() || "Sokany-EG";
const rawSiteLogoPath = process.env.NEXT_PUBLIC_SITE_LOGO_PATH;
/** Set `NEXT_PUBLIC_SITE_LOGO_PATH=` (empty) to use the site name instead of a logo image where supported. */
export const SITE_LOGO_DISABLED =
  typeof rawSiteLogoPath === "string" && rawSiteLogoPath.trim() === "";
/** Public path to storefront logo (`public/` root). Override via `NEXT_PUBLIC_SITE_LOGO_PATH`. */
export const SITE_LOGO_PATH = SITE_LOGO_DISABLED
  ? "/images/logo.png"
  : rawSiteLogoPath?.trim() || "/images/logo.png";
export const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP";
export const CURRENCY_LOCALE =
  process.env.NEXT_PUBLIC_CURRENCY_LOCALE ?? "ar-EG";
/** عرض إجمالي مبيعات المنتج (من Woo ‎`total_sales`‎) على كارت المنتج. ‎`NEXT_PUBLIC_PRODUCT_CARD_SHOW_SALES_COUNT=false`‎ لإخفاء السطر بالكامل. */
export const PRODUCT_CARD_SHOW_SALES_COUNT =
  process.env.NEXT_PUBLIC_PRODUCT_CARD_SHOW_SALES_COUNT !== "false";
/** لا تُعرض أرقام المبيعات على الكارت عندما يكون العدد أصغر من هذه القيمة. */
export const PRODUCT_CARD_MIN_SALES_TO_DISPLAY = 50;
/** زر/نافذة «معاينة سريعة» من كارت المنتج. الافتراضي: مخفي — فعّل بـ ‎`NEXT_PUBLIC_PRODUCT_CARD_SHOW_QUICK_VIEW=true`‎. */
export const PRODUCT_CARD_SHOW_QUICK_VIEW =
  process.env.NEXT_PUBLIC_PRODUCT_CARD_SHOW_QUICK_VIEW === "true";
export const CART_STORAGE_KEY = "woo_cart";
/** Minimum cart subtotal (EGP) for the “free shipping” progress message on /cart. `0` = always show free shipping, no bar. */
export const FREE_SHIPPING_THRESHOLD_EGP = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_EGP ?? 0,
);
export const WISHLIST_STORAGE_KEY = "woo_wishlist";
/** مسودة بيانات إتمام الطلب (بدون كلمة السر) ليُكمل العميل لاحقاً. */
export const CHECKOUT_DRAFT_STORAGE_KEY = "checkout_draft";
export const AUTH_TOKEN_KEY = "woo_auth_token";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const STALE_TIME = {
  SHORT: 30_000,
  MEDIUM: 5 * 60_000,
  LONG: 30 * 60_000,
} as const;

export const CONTACT_EMAIL = "support@sokanystore.com";

/** الموقع الرسمي (ووردبريس) — مصدر صفحات الشروط والسياسات ونسخ الاتصال المعتمدة. */
export const OFFICIAL_SOKANY_SITE_URL = "https://sokany-eg.com";

/** بريد الوكيل الرسمي كما يظهر على الموقع الرسمي (مؤسسة المغربي). */
export const OFFICIAL_SOKANY_INFO_EMAIL = "info@sokanyelmaghraby.com";

/** Hero «شاهد الفيديو» — set `NEXT_PUBLIC_STORE_HERO_VIDEO_URL` to your channel or clip. */
export const STORE_HERO_VIDEO_URL =
  process.env.NEXT_PUBLIC_STORE_HERO_VIDEO_URL ??
  "https://www.youtube.com/results?search_query=Sokany+Egypt";

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  /** Dedicated search results (query param `q`). */
  SEARCH: "/search",
  PRODUCT: (id: number | string) => `/products/${id}`,
  CATEGORIES: "/categories",
  CATEGORY: (slug: string) => `/categories/${slug}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ABOUT: "/about",
  CONTACT: "/contact",
  /** محتوى من ووردبريس الموقع الرسمي (slug: terms-and-conditions). */
  TERMS: "/terms",
  /** سياسة الإرجاع — slug: returns. */
  RETURNS_POLICY: "/returns",
  /** الصيانة والضمان — slug: warranty-and-maintenance. */
  WARRANTY: "/warranty",
  /** سياسة الخصوصية — slug: privcy-policy (إملاء الموقع الأصلي). */
  PRIVACY: "/privacy",
  /** الفروع ومراكز الصيانة (كان المسار السابق `/service-centers` مع إعادة توجيه 301). */
  SERVICE_CENTERS: "/branches",
  /** الموزعون المعتمدون (تجزئة معتمدة من الوكيل). */
  RETAILERS: "/retailers",
  ACCOUNT: "/account",
  /** قائمة المفضلة المحفوظة محلياً (صفحة مستقلة + نفس المحتوى داخل الدرج). */
  WISHLIST: "/wishlist",
  /** تتبع حالة الطلب برقم الطلب أو الموبايل. */
  ORDER_TRACKING: "/track-order",
  LOGIN: "/login",
  REGISTER: "/register",
  /** طلبات العميل المسجّل (يتطلب جلسة). */
  MY_ORDERS: "/my-orders",
  /** منتجات مكتملة الطلب مؤهّلة للتقييم (يتطلب جلسة). */
  MY_REVIEWS: "/my-reviews",
} as const;

/** كتالوج الموبايل: عيّنة عشوائية ثابتة الحجم من `/products` (زر الشريط السفلي). */
export const PRODUCTS_ALL_RANDOM_HREF = `${ROUTES.PRODUCTS}?${new URLSearchParams({
  per_page: "40",
  orderby: "rand",
}).toString()}`;

/** رابط دردشة واتساب لخدمة العملاء (مثل `https://wa.me/201xxxxxxxxxx`). يُضبط عبر البيئة لصفحة التتبع. */
export const WHATSAPP_SUPPORT_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_URL?.trim() ?? "";

/** Prefix for header product search input `id` (suffix from `useId()`; two instances may exist). */
export const GLOBAL_PRODUCT_SEARCH_INPUT_ID = "global-product-search";

/**
 * Microsoft Clarity project ID. Set `NEXT_PUBLIC_CLARITY_PROJECT_ID=` (empty) to disable.
 * When the env var is omitted, the production project id is used.
 */
const rawClarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
export const CLARITY_PROJECT_ID =
  rawClarityId === undefined ? "wen7myivca" : rawClarityId.trim();

/**
 * Google Analytics 4 measurement ID (`G-xxxxxxxxxx`).
 * Omit env for default; set `NEXT_PUBLIC_GA_MEASUREMENT_ID=` (empty) to disable.
 */
const rawGaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const GA_MEASUREMENT_ID =
  rawGaMeasurementId === undefined
    ? "G-RLD66T23W5"
    : rawGaMeasurementId.trim();

/**
 * المسار الافتراضي لإضافة JWT Authentication (مسار نسبي من أصل ‎WC_BASE_URL‎).
 * للتجاوز: ‎`WC_JWT_AUTH_TOKEN_PATH`‎ في البيئة (انظر ‎`.env.local.example`‎).
 */
export const WP_JWT_AUTH_TOKEN_PATH_DEFAULT = "/wp-json/jwt-auth/v1/token";

/** WooCommerce REST API base path. */
export const WC_REST_BASE_PATH = "/wp-json/wc/v3";
