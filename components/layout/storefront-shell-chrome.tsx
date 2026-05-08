"use client";

import { StorefrontOfflineBanner } from "@/components/layout/storefront-offline-banner";
import { StorefrontPullToRefresh } from "@/components/layout/storefront-pull-to-refresh";

/** بانر offline + سحب للتحديث — عميل فقط داخل ‎`SiteShell`‎. */
export function StorefrontShellChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StorefrontOfflineBanner />
      <StorefrontPullToRefresh>{children}</StorefrontPullToRefresh>
    </>
  );
}
