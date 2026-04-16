import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { Navbar } from "@/components/Navbar";
import { DesktopCartDrawer } from "@/features/cart/components/DesktopCartDrawer";
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
      <main className="flex min-w-0 max-w-none flex-1 flex-col bg-page pb-[var(--mobile-commerce-chrome-height,12rem)] md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileCommerceChrome />
    </>
  );
}
