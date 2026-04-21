import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

/*
 * غلاف مسارات /control: بدون شريط متجر كامل — المحتوى يحدد العرض داخل الصفحات.
 */
export default function ControlLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-page">{children}</div>;
}
