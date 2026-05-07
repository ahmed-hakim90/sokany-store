import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `سياسة الاسترجاع والاستبدال | ${SITE_BRAND_TITLE_AR}`;
const description =
  "سياسة الاسترجاع والاستبدال لدى مؤسسة المغربى، وشروط وإجراءات إرجاع المنتجات.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/returns`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/returns` },
  robots: { index: true, follow: true },
};

export default function ReturnsPolicyPage() {
  return (
    <LegalPageShell dir="rtl" lang="ar">
      <header className="mb-6 border-b border-border/80 pb-6 sm:mb-8">
        <h1 className="text-right font-display text-2xl font-bold text-brand-950 md:text-3xl">
          سياسة الاسترجاع والاستبدال
        </h1>
      </header>

      <article className="prose prose-sm max-w-none text-right text-brand-950 sm:prose-base prose-headings:font-display prose-headings:text-brand-950 prose-p:leading-8 prose-li:leading-8 prose-a:font-medium prose-a:text-brand-800 prose-a:no-underline hover:prose-a:underline">
        <section>
          <h2>سياسة الاسترجاع</h2>
          <p>
            نحن في مؤسسة المغربى نحرص على رضاك التام. إذا كنت غير راضٍ عن منتجك، يمكنك
            إرجاعه خلال [عدد 14 يوم] من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية
            وغير مستخدم.
          </p>
        </section>

        <section>
          <h2>شروط الاسترجاع</h2>
          <ul>
            <li>يجب أن يكون المنتج غير مستخدم وفي حالته الأصلية.</li>
            <li>يجب تقديم الفاتورة أو إثبات الشراء.</li>
            <li>يتم قبول الاسترجاع فقط خلال [14] من تاريخ الشراء.</li>
          </ul>
        </section>

        <section>
          <h2>كيفية الاسترجاع</h2>
          <ul>
            <li>
              تواصل مع خدمة العملاء عبر البريد الإلكتروني{" "}
              <a href="mailto:info@sokanyelmaghraby.com">info@sokanyelmaghraby.com</a> أو رقم
              الهوت لاين <a href="tel:17355">17355</a>.
            </li>
            <li>قم بتعبئة نموذج الاسترجاع وتقديمه مع المنتج المرفق بالعبوة الأصلية.</li>
          </ul>
        </section>

        <section>
          <h2>استثناءات</h2>
          <p>لا يمكن إرجاع المنتجات القابلة للتلف أو التي تم استخدامها، مثل [أجهزة العناية الشخصيه].</p>
        </section>
      </article>

      <p className="mt-8 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground sm:mt-10">
        <Link href="/" className="font-medium text-brand-800 underline-offset-2 hover:underline">
          العودة للمتجر
        </Link>
      </p>
    </LegalPageShell>
  );
}
