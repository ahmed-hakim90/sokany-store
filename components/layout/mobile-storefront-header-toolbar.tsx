"use client";

/*
 * عمود الهيدر الموبايل داخل Navbar: شرائح اختصارات أفقية ثم تنبيه offline.
 * البحث أيقونة فقط في صف الشعار (بجانب المفضلة) — انظر `Navbar`.
 */
import { Suspense } from "react";
import { MobileHeaderQuickActions } from "@/components/layout/mobile-header-quick-actions";
import { MobileOfflineInlineAlert } from "@/components/layout/mobile-offline-inline-alert";

export function MobileStorefrontHeaderToolbar() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 pt-0.5">
      <Suspense fallback={null}>
        <MobileHeaderQuickActions />
      </Suspense>
      <MobileOfflineInlineAlert />
    </div>
  );
}
