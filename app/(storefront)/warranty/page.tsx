import type { Metadata } from "next";
import { StorefrontPolicyPageLayout } from "@/components/layout/storefront-policy-page-layout";
import { OfficialWpPageContent } from "@/components/pages/OfficialWpPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `طرق الاستخدام | ${SITE_BRAND_TITLE_AR}`;
const description =
  "مدونة طرق استخدام أجهزة سوكاني ونصائح العناية بها — محتوى معتمد من الموقع الرسمي لوكيل سوكاني في مصر.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/warranty`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/warranty` },
  robots: { index: true, follow: true },
};

/*
 * صفحة الضمان/طرق الاستخدام:
 * — أعلى: شبكة روابط دعم سريعة (ضمان، صيانة، فروع…).
 * — أسفل: محتوى ووردبريس عبر OfficialWpPageContent دون تغيير HTML.
 */
export default function WarrantyPage() {
  return (
    <StorefrontPolicyPageLayout
      supportTitle="الدعم والضمان"
      supportSubtitle="اختصارات لأهم صفحات الخدمة بعد الشراء"
    >
      <OfficialWpPageContent
        slug="warranty-and-maintenance"
        heading="طرق الاستخدام"
        internalPostBasePath="/warranty"
      />
    </StorefrontPolicyPageLayout>
  );
}
