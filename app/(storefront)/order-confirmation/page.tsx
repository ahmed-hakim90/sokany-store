import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationPageContent } from "@/components/pages/OrderConfirmationPageContent";
import { ROUTES, SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `تأكيد الطلب | ${SITE_BRAND_TITLE_AR}`;
const description =
  "راجع تفاصيل طلبك بعد الإتمام: رقم الطلب، بيانات الشحن، طريقة الدفع، ملخص المنتجات وخيارات المتابعة.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}${ROUTES.ORDER_CONFIRMATION}`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}${ROUTES.ORDER_CONFIRMATION}` },
  robots: { index: false, follow: false },
};

function OrderConfirmationFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-page px-4 py-16">
      <p className="text-sm text-brand-900/70">جاري تحميل تأكيد الطلب…</p>
    </div>
  );
}

/*
 * غلاف صفحة تأكيد الطلب: صفحة ما بعد الدفع غير مفهرسة، والمحتوى التفصيلي داخل
 * OrderConfirmationPageContent لأنه يقرأ snapshot الطلب من sessionStorage على العميل.
 * التخطيط داخل المحتوى: خطوات علوية، عمود رئيسي + sidebar من lg، وكاروسيل توصيات أسفل الصفحة.
 */
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationFallback />}>
      <OrderConfirmationPageContent />
    </Suspense>
  );
}
