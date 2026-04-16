import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { Navbar } from "@/components/Navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className="flex min-w-0 w-full flex-1 flex-col bg-page pb-[var(--mobile-commerce-chrome-height,12rem)] md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileCommerceChrome />
    </>
  );
}
