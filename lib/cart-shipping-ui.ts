import { FREE_SHIPPING_THRESHOLD_EGP } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export type CartFreeShippingProgress = {
  threshold: number;
  /** Amount still needed for free shipping; 0 if already qualified. */
  remaining: number;
  /** 0–100 toward threshold. */
  percentTowardFree: number;
};

/**
 * Copy for cart summary: shipping line + optional “free shipping progress” bar.
 * Subtotal is the cart subtotal in the same currency as `formatPrice`.
 */
export function getCartShippingUi(subtotal: number): {
  shippingLabel: string;
  progress: CartFreeShippingProgress | null;
} {
  const threshold = FREE_SHIPPING_THRESHOLD_EGP;
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return { shippingLabel: "يُحسب عند الطلب", progress: null };
  }

  if (subtotal >= threshold) {
    return {
      shippingLabel: "شحن مجاني",
      progress: {
        threshold,
        remaining: 0,
        percentTowardFree: 100,
      },
    };
  }

  const remaining = threshold - subtotal;
  const percentTowardFree = Math.min(
    99,
    Math.max(0, Math.round((subtotal / threshold) * 100)),
  );

  return {
    shippingLabel: "يُحسب عند الطلب",
    progress: {
      threshold,
      remaining,
      percentTowardFree,
    },
  };
}

export function freeShippingProgressHint(progress: CartFreeShippingProgress): string {
  if (progress.remaining <= 0) {
    return "تهانينا! حصلت على شحن مجاني لهذا الطلب.";
  }
  return `باقي ${formatPrice(progress.remaining)} للحصول على شحن مجاني`;
}
