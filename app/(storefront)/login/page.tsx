import type { Metadata } from "next";
import { SITE_BRAND_TITLE_AR, SITE_NAME } from "@/lib/constants";
import { LoginPageContent } from "@/components/pages/LoginPageContent";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول برقم الموبايل لعرض طلباتك",
  openGraph: {
    title: `تسجيل الدخول | ${SITE_NAME}`,
    description: "تسجيل الدخول برقم الموبايل لعرض طلباتك",
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
  },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginPageContent />;
}
