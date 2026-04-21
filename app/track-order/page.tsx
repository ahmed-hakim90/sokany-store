import type { Metadata } from "next";
import { OrderTrackingPageContent } from "@/components/pages/OrderTrackingPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `تتبع الطلب | ${SITE_BRAND_TITLE_AR}`;
const description =
  "تتبع حالة طلبك في ثوانٍ: أدخل رقم الموبايل أو رقم الطلب لمتابعة مراحل الشحن.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/track-order`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/track-order` },
  robots: { index: true, follow: true },
};

export default function TrackOrderPage() {
  return <OrderTrackingPageContent />;
}
