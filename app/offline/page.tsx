import type { Metadata } from "next";
import Link from "next/link";

/*
 * مخطط الصفحة (وضع عدم الاتصال):
 * - شاشة صغيرة ومتوسطة: عمود واحد، عنوان ثم شرح ثم زر إعادة المحاولة.
 * - لا يوجد شريط جانبي؛ الهدف إعلام المستخدم فقط بأن الشبكة غير متاحة.
 */

const title = "لا يوجد اتصال | سوكانى";

export const metadata: Metadata = {
  title,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-display text-xl font-bold text-brand-950">لا يوجد اتصال بالإنترنت</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        تعذّر تحميل هذه الصفحة. تحقّق من الشبكة ثم أعد المحاولة.
      </p>
      <Link
        href="/"
        className="inline-flex h-8 items-center justify-center rounded-md bg-brand-500 px-3 text-sm font-medium text-black transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
