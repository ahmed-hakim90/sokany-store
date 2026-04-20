import { Suspense } from "react";
import { FooterGate } from "@/components/layout/footer-gate";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { MobileScrollCollapseController } from "@/components/layout/mobile-scroll-collapse-controller";
import { Navbar } from "@/components/Navbar";
import { DesktopCartDrawer } from "@/features/cart/components/DesktopCartDrawer";
import { CatalogFilterDrawer } from "@/features/catalog/components/CatalogFilterDrawer";
import { DesktopWishlistDrawer } from "@/features/wishlist/components/DesktopWishlistDrawer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <Suspense fallback={null}>
        <DesktopCartDrawer />
      </Suspense>
      <Suspense fallback={null}>
        <DesktopWishlistDrawer />
      </Suspense>
      <Suspense fallback={null}>
        <CatalogFilterDrawer />
      </Suspense>
      <main className="flex min-h-0 min-w-0 max-w-none flex-1 flex-col bg-page pb-mobile-commerce lg:pb-0">
        {children}
      </main>
      <FooterGate />
      <MobileScrollCollapseController />
      <MobileCommerceChrome />
    </>
  );
}
