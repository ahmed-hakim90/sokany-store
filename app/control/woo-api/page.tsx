import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Woo & API",
  robots: { index: false, follow: false },
};

/**
 * تم دمج الصفحة في تبويب «ربط Woo» داخل /control بعد توحيد لوحة التحكم.
 * هذا الملف موجود فقط ليحول الروابط القديمة إلى التبويب الجديد.
 */
export default function ControlWooApiPage() {
  redirect("/control?tab=wooApi");
}
