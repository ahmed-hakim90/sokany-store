"use client";

/*
 * عمود الهيدر الموبايل داخل Navbar: بحث بحجم لمس أكبر ثم شبكة الاختصارات ثم تنبيه offline.
 *
 * السلوك مستورد من Navbar — فلتر الكتالوج يظهر بجانب البحث فقط على مسارات المتجر التي تستخدمه اليوم (`CatalogFilterDrawerTrigger`).
 */
import { Suspense } from "react";
import {
  NavbarSearch,
  NavbarSearchRowSkeleton,
} from "@/components/layout/navbar-search";
import { MobileHeaderQuickActions } from "@/components/layout/mobile-header-quick-actions";
import { MobileOfflineInlineAlert } from "@/components/layout/mobile-offline-inline-alert";
import { CatalogFilterDrawerTrigger } from "@/features/catalog/components/CatalogFilterDrawerTrigger";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";

export type MobileStorefrontHeaderToolbarProps = {
  searchQuickKeywords?: readonly string[];
  showCatalogFilterTrigger: boolean;
};

export function MobileStorefrontHeaderToolbar({
  searchQuickKeywords = DEFAULT_SEARCH_QUICK_KEYWORDS,
  showCatalogFilterTrigger,
}: MobileStorefrontHeaderToolbarProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5 pt-1">
      <Suspense fallback={<NavbarSearchRowSkeleton />}>
        <div className="flex min-w-0 w-full items-center gap-2">
          <div className="min-w-0 flex-1">
            <NavbarSearch quickKeywords={searchQuickKeywords} />
          </div>
          {showCatalogFilterTrigger ? <CatalogFilterDrawerTrigger /> : null}
        </div>
      </Suspense>
      <Suspense fallback={null}>
        <MobileHeaderQuickActions />
      </Suspense>
      <MobileOfflineInlineAlert />
    </div>
  );
}
