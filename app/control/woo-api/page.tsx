import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Woo & API",
  robots: { index: false, follow: false },
};

/**
 * يعيد التوجيه إلى تبويب «صحة الموقع والربط» داخل /control (قسم Woo).
 */
export default function ControlWooApiPage() {
  redirect("/control?tab=health");
}
