"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "vaul";
import { CatalogFilterForm } from "@/features/catalog/components/catalog-filter-form";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import { cn } from "@/lib/utils";

function CatalogFilterFormFallback() {
  return (
    <div className="space-y-4 px-4 pb-6 pt-2" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 animate-shimmer rounded-xl bg-surface-muted" />
      ))}
    </div>
  );
}

export function CatalogFilterDrawer() {
  const pathname = usePathname();
  const open = useCatalogFilterDrawerOpenStore((s) => s.open);
  const setOpen = useCatalogFilterDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useCatalogFilterDrawerOpenStore((s) => s.closeDrawer);
  const [resetKey, setResetKey] = useState(0);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        setResetKey((k) => k + 1);
      }
      setOpen(next);
    },
    [setOpen],
  );

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal
      dismissible
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-900/50" />
        <Drawer.Content
          id="catalog-filter-drawer-panel"
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[92dvh] min-w-0 max-w-lg flex-col rounded-t-2xl border border-border/80 bg-page outline-none",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          <Drawer.Handle className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-border" />
          <Drawer.Title className="px-4 pt-2 text-center font-display text-base font-semibold text-brand-950">
            تصفية المنتجات
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            اختر التصنيف والسعر والترتيب ثم اعرض نتائج الكتالوج.
          </Drawer.Description>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-4">
            <Suspense fallback={<CatalogFilterFormFallback />}>
              <CatalogFilterForm resetKey={resetKey} />
            </Suspense>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
