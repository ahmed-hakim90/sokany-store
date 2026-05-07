import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Site health",
  robots: { index: false, follow: false },
};

/**
 * تم دمج الصفحة في تبويب «صحة الموقع» داخل /control بعد توحيد لوحة التحكم.
 * هذا الملف موجود فقط ليحول الروابط القديمة إلى التبويب الجديد.
 */
export default function ControlDevPage() {
  redirect("/control?tab=health");
}
