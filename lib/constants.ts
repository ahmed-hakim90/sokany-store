export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Hakimo-Ecommerce";
/** Compact mobile header wordmark (Latin mark; override via env). */
export const SITE_WORDMARK =
  process.env.NEXT_PUBLIC_SITE_WORDMARK ?? "SOKANYEgypt";
export const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP";
export const CURRENCY_LOCALE =
  process.env.NEXT_PUBLIC_CURRENCY_LOCALE ?? "ar-EG";
export const CART_STORAGE_KEY = "woo_cart";
export const AUTH_TOKEN_KEY = "woo_auth_token";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 12;
export const STALE_TIME = {
  SHORT: 30_000,
  MEDIUM: 5 * 60_000,
  LONG: 30 * 60_000,
} as const;

export const CONTACT_EMAIL = "support@sokanystore.com";

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT: (id: number | string) => `/products/${id}`,
  CATEGORIES: "/categories",
  CATEGORY: (slug: string) => `/categories/${slug}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ABOUT: "/about",
  SERVICE_CENTERS: "/service-centers",
  ACCOUNT: "/account",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

/** WordPress JWT Auth plugin token endpoint path (relative to WC_BASE_URL origin). */
export const WP_JWT_AUTH_TOKEN_PATH = "/wp-json/jwt-auth/v1/token";

/** WooCommerce REST API base path. */
export const WC_REST_BASE_PATH = "/wp-json/wc/v3";
