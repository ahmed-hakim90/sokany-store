import type { Metadata } from "next";
import { OrderTrackingPageContent } from "@/components/pages/OrderTrackingPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "تتبع الطلب | سوكانى المغربى";
const description =
  "تتبع حالة طلبك في ثوانٍ: أدخل رقم الموبايل أو رقم الطلب لمتابعة مراحل الشحن.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/track-order`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/track-order` },
  robots: { index: true, follow: true },
};

export default function TrackOrderPage() {
  return <OrderTrackingPageContent />;
}
