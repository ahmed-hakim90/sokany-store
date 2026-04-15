import { Footer } from "@/components/layout/footer";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { Navbar } from "@/components/Navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col bg-page pb-36 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileCommerceChrome />
    </>
  );
}
