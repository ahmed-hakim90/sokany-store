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
      direction="left"
      dismissible
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-900/50" />
        <Drawer.Content
          id="catalog-filter-drawer-panel"
          className={cn(
            "fixed left-0 top-0 z-[100] flex h-dvh min-h-0 w-[min(20rem,92vw)] max-w-lg flex-col border-s border-y border-border/80 bg-page shadow-2xl outline-none",
            "max-h-[100dvh] sm:w-[22rem] sm:max-w-md",
            "pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]",
          )}
        >
          <div className="shrink-0 border-b border-border/80 px-2 pb-2 pt-1">
            <Drawer.Title className="px-2 py-1 text-center font-display text-base font-semibold text-brand-950">
              تصفية المنتجات
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            اختر التصنيف والسعر والترتيب ثم اعرض نتائج الكتالوج.
          </Drawer.Description>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-2">
            <Suspense fallback={<CatalogFilterFormFallback />}>
              <CatalogFilterForm key={resetKey} />
            </Suspense>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
