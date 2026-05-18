"use client";

import { StorefrontPullToRefresh } from "@/components/layout/storefront-pull-to-refresh";

/** سحب للتحديث — عميل فقط داخل ‎`SiteShell`‎. تنبيه عدم اتصال مدمج أسفل شريط اختصارات الهيدر (موبايل). */
export function StorefrontShellChrome({ children }: { children: React.ReactNode }) {
  return <StorefrontPullToRefresh>{children}</StorefrontPullToRefresh>;
}
