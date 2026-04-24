import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

/*
 * غلاف /control: خلفية مسطّحة، سلسلة flex بارتفاع الشاشة حتى يلتقط /control (لوحة) flex-1 و min-h-0
 * (نمط غلاف تطبيق: Stripe-like).
 */
export default function ControlLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh w-full min-h-0 flex-col bg-[#f6f9fc]">
      {children}
    </div>
  );
}
