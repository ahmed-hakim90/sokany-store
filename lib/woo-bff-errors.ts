/** BFF JSON body when live Woo is required and the upstream request failed. */
export const WOO_BFF_UNAVAILABLE = {
  error:
    "WooCommerce is unavailable. Configure WC_BASE_URL, WC_CONSUMER_KEY, and WC_CONSUMER_SECRET, or set NEXT_PUBLIC_USE_MOCK=true to use built-in snapshot data.",
} as const;
