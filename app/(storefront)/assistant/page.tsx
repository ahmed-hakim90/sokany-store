import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { StorefrontAssistantChatPanel } from "@/features/assistant/components/StorefrontAssistantChatPanel";
import { ROUTES, SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `مساعد سوكاني | ${SITE_BRAND_TITLE_AR}`;
const description =
  "اسأل مساعد سوكاني عن المنتجات، الأسعار، الفروع، الضمان وسياسة الاسترجاع.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}${ROUTES.ASSISTANT}`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}${ROUTES.ASSISTANT}` },
  robots: { index: false, follow: true },
};

/*
 * صفحة مساعد سوكاني المستقلة: على الموبايل تظهر كصفحة محادثة كاملة بدل نافذة عائمة فوق المحتوى.
 * الموبايل: الـ bottom nav مخفي؛ الشاشة ثابتة الارتفاع بين الهيدر ولوحة المفاتيح، والرسائل وحدها تعمل scroll.
 * lg وما فوق: نفس الصفحة تظل قابلة للاستخدام داخل عمود متوسط في المنتصف، بينما زر الشات العائم مخفي على هذا المسار.
 */
export default function AssistantPage() {
  return (
    <Container className="mb-[calc(var(--mobile-commerce-chrome-height,0px)*-1)] flex h-[calc(100dvh-var(--mobile-commerce-chrome-height,0px)-6.75rem)] min-h-0 flex-col overflow-hidden py-3 lg:mb-0 lg:h-auto lg:min-h-0 lg:overflow-visible lg:py-10 lg:pb-10">
      {/*
        رأس الصفحة: يشرح حدود المساعد قبل صندوق المحادثة.
        موبايل: مخفي بصرياً لتوفير مساحة للشات؛ ديسكتوب: يتمركز مع نفس عرض لوحة الشات.
      */}
      <div className="sr-only mx-auto mb-4 max-w-3xl text-start lg:not-sr-only">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          مساعد المتجر
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
          اسأل مساعد سوكاني
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          يساعدك في اختيار المنتجات ومعرفة الفروع والضمان وسياسات المتجر. لا
          يستخدم بيانات الطلبات أو الحسابات.
        </p>
      </div>

      {/*
        منطقة المحادثة: كارت واحد مرن يحتوي الرسائل والاقتراحات وحقل الكتابة.
        موبايل: تأخذ المساحة المتاحة كلها ولا تسمح بتمرير الصفحة؛ lg: عرض مقروء في المنتصف.
      */}
      <section
        className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col pb-3 lg:pb-0"
        aria-label="محادثة مساعد سوكاني"
      >
        <StorefrontAssistantChatPanel variant="page" />
      </section>
    </Container>
  );
}
