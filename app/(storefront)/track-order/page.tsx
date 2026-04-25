import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderTrackingPageContent } from "@/components/pages/OrderTrackingPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `تتبع الطلب | ${SITE_BRAND_TITLE_AR}`;
const description =
  "اعرض حالة طلبك بعد الضغط على «تتبع الطلب» من صفحة طلباتي أو من رابط التأكيد.";

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

function TrackOrderFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-page px-4 py-16">
      <p className="text-sm text-brand-900/70">جاري التحميل…</p>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackOrderFallback />}>
      <OrderTrackingPageContent />
    </Suspense>
  );
}
