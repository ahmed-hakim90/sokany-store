export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Sokany-Eg";
/** Compact mobile header wordmark (Latin mark; override via env). */
export const SITE_WORDMARK =
  process.env.NEXT_PUBLIC_SITE_WORDMARK ?? "SOKANY-Eg";
/** Public path to storefront logo (`public/` root). Override via `NEXT_PUBLIC_SITE_LOGO_PATH`. */
export const SITE_LOGO_PATH =
  process.env.NEXT_PUBLIC_SITE_LOGO_PATH?.trim() || "/images/logo.png";
export const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP";
export const CURRENCY_LOCALE =
  process.env.NEXT_PUBLIC_CURRENCY_LOCALE ?? "ar-EG";
export const CART_STORAGE_KEY = "woo_cart";
export const WISHLIST_STORAGE_KEY = "woo_wishlist";
export const AUTH_TOKEN_KEY = "woo_auth_token";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 12;
export const STALE_TIME = {
  SHORT: 30_000,
  MEDIUM: 5 * 60_000,
  LONG: 30 * 60_000,
} as const;

export const CONTACT_EMAIL = "support@sokanystore.com";

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
  SERVICE_CENTERS: "/service-centers",
  ACCOUNT: "/account",
  /** قائمة المفضلة المحفوظة محلياً (صفحة مستقلة + نفس المحتوى داخل الدرج). */
  WISHLIST: "/wishlist",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

/** Prefix for header product search input `id` (suffix from `useId()`; two instances may exist). */
export const GLOBAL_PRODUCT_SEARCH_INPUT_ID = "global-product-search";

/** WordPress JWT Auth plugin token endpoint path (relative to WC_BASE_URL origin). */
export const WP_JWT_AUTH_TOKEN_PATH = "/wp-json/jwt-auth/v1/token";

/** WooCommerce REST API base path. */
export const WC_REST_BASE_PATH = "/wp-json/wc/v3";
