import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";
import { ROUTES, SITE_BRAND_TITLE_AR } from "@/lib/constants";

export const metadata: Metadata = {
  title: `الصفحة غير موجودة | ${SITE_BRAND_TITLE_AR}`,
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  return (
    <main className="flex min-h-dvh items-center bg-page px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
      <h1 className="sr-only">الصفحة غير موجودة</h1>
      <div className="mx-auto w-full max-w-5xl">
        <StorefrontErrorScreen
          tone="notFound"
          title="الصفحة دي مش موجودة"
          description="يمكن الرابط اتغير أو المنتج لم يعد متاحاً. تقدر ترجع للرئيسية أو تفتح كل المنتجات وتكمل بحثك."
          primaryAction={
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-black text-black shadow-[0_18px_34px_-18px_rgba(218,255,0,0.9)] transition-transform hover:-translate-y-0.5"
            >
              تصفح المنتجات
            </Link>
          }
        />
      </div>
    </main>
  );
}
