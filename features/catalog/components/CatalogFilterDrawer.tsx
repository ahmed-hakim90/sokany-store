"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "vaul";
import { CatalogFilterForm } from "@/features/catalog/components/catalog-filter-form";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import { useMinLg } from "@/hooks/useMinLg";
import { STOREFRONT_Z } from "@/lib/storefront-overlay-z";
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

/*
 * درج التصفية:
 * — الجوال: bottom sheet بمقبض سحب وحد علوي مستدير.
 * — من lg: لوحة يسار بعرض ثابت (الفلتر على الديسكتوب أيضاً في الشريط الجانبي للكتالوج).
 */
export function CatalogFilterDrawer() {
  const pathname = usePathname();
  const lgUp = useMinLg();
  const open = useCatalogFilterDrawerOpenStore((s) => s.open);
  const setOpen = useCatalogFilterDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useCatalogFilterDrawerOpenStore((s) => s.closeDrawer);
  const [resetKey, setResetKey] = useState(0);
  const lastPathnameRef = useRef(pathname);

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
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;
    closeDrawer();
  }, [pathname, closeDrawer]);

  const isBottomSheet = !lgUp;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal
      direction={isBottomSheet ? "bottom" : "left"}
      dismissible
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
          style={{ zIndex: STOREFRONT_Z.drawerOverlay }}
        />
        <Drawer.Content
          id="catalog-filter-drawer-panel"
          style={{ zIndex: STOREFRONT_Z.drawerPanel }}
          className={cn(
            "fixed flex min-h-0 flex-col bg-page shadow-2xl outline-none",
            isBottomSheet
              ? "inset-x-0 bottom-0 max-h-[min(92dvh,56rem)] rounded-t-3xl border-t border-border/80 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
              : "left-0 top-0 h-dvh w-[min(22rem,92vw)] max-w-lg border-s border-y border-border/80 pt-[max(0.5rem,env(safe-area-inset-top))]",
          )}
        >
          {isBottomSheet ? (
            <Drawer.Handle className="mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full bg-slate-300/90" />
          ) : null}
          <div
            className={cn(
              "shrink-0 border-b border-border/80 px-3 pb-2",
              isBottomSheet ? "pt-1" : "pt-1",
            )}
          >
            <Drawer.Title className="py-1 text-center font-display text-base font-semibold text-brand-950">
              تصفية المنتجات
            </Drawer.Title>
            <p className="text-center text-[11px] leading-snug text-muted-foreground">
              ترتيب وسعر أولاً، ثم اختر التصنيف
            </p>
          </div>
          <Drawer.Description className="sr-only">
            اختر التصنيف والسعر والترتيب ثم اعرض نتائج الكتالوج.
          </Drawer.Description>
          <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
            <Suspense fallback={<CatalogFilterFormFallback />}>
              <CatalogFilterForm key={resetKey} />
            </Suspense>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
