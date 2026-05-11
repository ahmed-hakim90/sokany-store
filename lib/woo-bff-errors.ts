/** BFF JSON body when live Woo is required and the upstream request failed. */
export const WOO_BFF_UNAVAILABLE = {
  error:
    "WooCommerce is unavailable. Configure WC_BASE_URL plus Woo consumer credentials (env or encrypted control settings), or set NEXT_PUBLIC_USE_MOCK=true to use built-in snapshot data.",
} as const;
