import type { CmsStorefrontCoupon, CmsTopAnnouncementBar } from "@/schemas/cms";

export function sortStorefrontCoupons(coupons: CmsStorefrontCoupon[]): CmsStorefrontCoupon[] {
  return [...coupons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getEnabledStorefrontCoupons(
  coupons: CmsStorefrontCoupon[],
): CmsStorefrontCoupon[] {
  return sortStorefrontCoupons(coupons.filter((c) => c.enabled));
}

export function getPromoBarStorefrontCoupons(
  coupons: CmsStorefrontCoupon[],
): CmsStorefrontCoupon[] {
  return sortStorefrontCoupons(
    coupons.filter((c) => c.enabled && c.showInPromoBar),
  );
}

export function mergeAnnouncementBarWithCoupons(
  bar: CmsTopAnnouncementBar,
  coupons: CmsStorefrontCoupon[],
): CmsTopAnnouncementBar {
  if (!bar.enabled) return bar;

  const fromCoupons = sortStorefrontCoupons(
    coupons.filter((c) => c.enabled && c.showInAnnouncementBar),
  ).map((c) => ({
    text: `${c.headline} — الكود: ${c.code}`,
    copyCode: c.code,
  }));

  if (fromCoupons.length === 0) return bar;

  return {
    ...bar,
    items: [...fromCoupons, ...bar.items],
  };
}
