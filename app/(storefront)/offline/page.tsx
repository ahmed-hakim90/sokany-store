import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { commerceLinkClassName } from "@/components/ui/button";
import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";
import { ROUTES } from "@/lib/constants";

/*
 * مخطط الصفحة (وضع عدم الاتصال):
 * - شاشة صغيرة ومتوسطة: عمود واحد، عنوان ثم شرح ثم زر إعادة المحاولة.
 * - لا يوجد شريط جانبي؛ الهدف إعلام المستخدم فقط بأن الشبكة غير متاحة.
 */

const title = "لا يوجد اتصال | سوكانى";

export const metadata: Metadata = {
  title,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
      <h1 className="sr-only">لا يوجد اتصال بالإنترنت</h1>
      <StorefrontErrorScreen
        tone="offline"
        title="لا يوجد اتصال بالإنترنت"
        description="افتح الواي فاي أو بيانات الجوال، ثم جرّب مرة أخرى. لو كنت تتصفح من الموبايل، الصفحة هترجع تشتغل أول ما الاتصال يستقر."
        primaryAction={
          <Link href={ROUTES.HOME} className={commerceLinkClassName}>
            العودة للرئيسية
          </Link>
        }
      />
    </div>
  );
}
