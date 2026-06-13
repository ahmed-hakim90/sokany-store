"use client";

/*
 * عمود الهيدر الموبايل:
 * - عند الأعلى (لا سكرول): شرائح الاختصارات
 * - عند السكرول (صف الشعار مطوي): شريط البحث فقط
 */
import { Suspense } from "react";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { MobileHeaderQuickActions } from "@/components/layout/mobile-header-quick-actions";
import { MobileOfflineInlineAlert } from "@/components/layout/mobile-offline-inline-alert";
import { NavbarSearch, NavbarSearchRowSkeleton } from "@/components/layout/navbar-search";

export function MobileStorefrontHeaderToolbar() {
  const collapsed = useMobileChromeCollapsedStore((s) => s.headerHidden);

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 pt-0.5">
      {collapsed ? (
        /* سكرول → سيرش فقط */
        <Suspense fallback={<NavbarSearchRowSkeleton />}>
          <NavbarSearch fieldClassName="max-lg:!h-9" />
        </Suspense>
      ) : (
        /* أعلى الصفحة → شرائح الاختصارات */
        <Suspense fallback={<NavbarSearchRowSkeleton />}>
        <NavbarSearch fieldClassName="max-lg:!h-9" />
      </Suspense>
      )}
      <MobileOfflineInlineAlert />
    </div>
  );
}
