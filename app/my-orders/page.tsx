import type { Metadata } from "next";
import { MyOrdersPageContent } from "@/components/pages/MyOrdersPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "طلباتي | سوكانى المغربى";
const description = "اعرض تاريخ مشترياتك وحالة كل طلب في مكان واحد.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/my-orders`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/my-orders` },
  robots: { index: false, follow: true },
};

export default function MyOrdersPage() {
  return <MyOrdersPageContent />;
}
