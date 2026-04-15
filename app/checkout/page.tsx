import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { getSiteUrl } from "@/lib/site";

const title = "إتمام الطلب | سوكانى المغربى";
const description =
  "أكمل بيانات الشحن والدفع (وضع تجريبي) — راجع ملخص الطلب قبل الإرسال.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/checkout`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/checkout` },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-0 flex-1 bg-page">
      <Container className="pt-3 md:pt-4">
        <CheckoutForm />
      </Container>
    </div>
  );
}
