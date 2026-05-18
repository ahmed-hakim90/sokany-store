import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { commerceLinkClassName } from "@/components/ui/button";
import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";
import { ROUTES, SITE_BRAND_TITLE_AR } from "@/lib/constants";

export const metadata: Metadata = {
  title: `الصفحة غير موجودة | ${SITE_BRAND_TITLE_AR}`,
  robots: { index: false, follow: false },
};

export default function StorefrontNotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
      <h1 className="sr-only">الصفحة غير موجودة</h1>
      <StorefrontErrorScreen
        tone="notFound"
        title="الصفحة دي مش موجودة"
        description="يمكن الرابط اتغير أو المنتج لم يعد متاحاً. تقدر ترجع للرئيسية أو تفتح كل المنتجات وتكمل بحثك."
        primaryAction={
          <Link href={ROUTES.PRODUCTS} className={commerceLinkClassName}>
            تصفح المنتجات
          </Link>
        }
      />
    </div>
  );
}
