import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `إتمام الطلب | ${SITE_BRAND_TITLE_AR}`;
const description =
  "أكمل بيانات الشحن والدفع (وضع تجريبي) — راجع ملخص الطلب قبل الإرسال.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/checkout`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/checkout` },
  robots: { index: false, follow: false },
};

/*
 * غلاف صفحة إتمام الطلب (/checkout)
 * — الجوال: Container ضيق؛ بطاقات خطوات داخل CheckoutForm + dock إرسال ثابت.
 * — من lg: نفس الغلاف بعرض أوسع؛ النموذج صفّان (حقول | ملخص لاصق) داخل CheckoutForm.
 */
export default function CheckoutPage() {
  return (
    <div className="min-h-0 min-w-0 flex-1 bg-page max-lg:pb-32">
      <Container className="pt-3 md:pt-4">
        <h1 className="sr-only">إتمام الطلب</h1>
        <CheckoutForm />
      </Container>
    </div>
  );
}
