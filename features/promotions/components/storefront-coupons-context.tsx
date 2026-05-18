"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getEnabledStorefrontCoupons } from "@/features/promotions/lib/storefront-coupons";
import type { CmsStorefrontCoupon } from "@/schemas/cms";

const StorefrontCouponsContext = createContext<CmsStorefrontCoupon[]>([]);

export function StorefrontCouponsProvider({
  coupons,
  children,
}: {
  coupons: CmsStorefrontCoupon[];
  children: ReactNode;
}) {
  const value = useMemo(() => coupons, [coupons]);
  return (
    <StorefrontCouponsContext.Provider value={value}>
      {children}
    </StorefrontCouponsContext.Provider>
  );
}

export function useStorefrontCouponsAll() {
  return useContext(StorefrontCouponsContext);
}

export function useEnabledStorefrontCoupons() {
  const all = useStorefrontCouponsAll();
  return useMemo(() => getEnabledStorefrontCoupons(all), [all]);
}
