import { LegalPageShell } from "@/components/layout/legal-page-shell";
import {
  CONTACT_EMAIL,
  OFFICIAL_SOKANY_INFO_EMAIL,
  OFFICIAL_SOKANY_SITE_URL,
  ROUTES,
} from "@/lib/constants";

/*
 * صفحة تواصل معنا (/contact): نفس غلاف البطاقة القانونية (`LegalPageShell`) بعرض أضيق max-w-2xl.
 *
 * — خلفية الصفحة + بطاقة بيضاء؛ رأس ثم أقسام بنص `text-[15px] sm:text-base` ومسافات رأسية موحّدة.
 * — الجوال والديسكتوب: عمود واحد؛ قوائم بـ `list-disc` وروابط واضحة.
 */
export function ContactPageContent() {
  const officialContactPage = `${OFFICIAL_SOKANY_SITE_URL}/contact-us/`;

  return (
    <LegalPageShell containerClassName="max-w-2xl">
      <header className="mb-8 border-b border-border/80 pb-6">
        <h1 className="font-display text-2xl font-bold text-brand-950 md:text-3xl">تواصل معنا</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          نحن هنا لمساعدتك في الاستفسارات عن المنتجات، الطلبات، والضمان. يمكنك استخدام قنوات هذا
          المتجر أو البيانات الرسمية للوكيل أدناه.
        </p>
      </header>

      <section className="space-y-6 text-[15px] leading-relaxed text-brand-950 sm:text-base">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-950">متجر سوكانى (هذا الموقع)</h2>
          <p className="mt-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-brand-800 underline-offset-2 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-brand-950">مؤسسة المغربي — الوكيل الرسمي</h2>
          <p className="mt-2 text-muted-foreground">
            البريد المعتمد على الموقع الرسمي:{" "}
            <a
              href={`mailto:${OFFICIAL_SOKANY_INFO_EMAIL}`}
              className="font-medium text-brand-800 underline-offset-2 hover:underline"
            >
              {OFFICIAL_SOKANY_INFO_EMAIL}
            </a>
          </p>
          <ul className="mt-3 list-disc space-y-1 ps-5 text-muted-foreground">
            <li>
              مبيعات:{" "}
              <a href="tel:0201001008086" className="font-medium text-brand-800 hover:underline">
                0201001008086
              </a>
            </li>
            <li>
              خدمة العملاء:{" "}
              <a href="tel:0201101115311" className="font-medium text-brand-800 hover:underline">
                0201101115311
              </a>
              {" — "}
              <a href="tel:0201156111015" className="font-medium text-brand-800 hover:underline">
                0201156111015
              </a>
            </li>
            <li>
              الخط الساخن (أقرب مركز ضمان):{" "}
              <a href="tel:17355" className="font-medium text-brand-800 hover:underline">
                17355
              </a>
            </li>
          </ul>
          <p className="mt-3">
            <a
              href={officialContactPage}
              className="font-medium text-brand-800 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              صفحة التواصل على الموقع الرسمي
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-brand-950">ساعات العمل</h2>
          <p className="mt-2 text-muted-foreground">
            القاهرة، مصر — دعم العملاء يومياً من 10:00 إلى 18:00 (حسب إعلان الموقع الرسمي).
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-brand-950">طلباتك والفروع</h2>
          <p className="mt-2 text-muted-foreground">
            متابعة الطلب:{" "}
            <a
              href={ROUTES.MY_ORDERS}
              className="font-medium text-brand-800 underline-offset-2 hover:underline"
            >
              تتبع الطلب
            </a>
            {" — "}
            <a
              href={ROUTES.SERVICE_CENTERS}
              className="font-medium text-brand-800 underline-offset-2 hover:underline"
            >
              الفروع ومراكز الصيانة
            </a>
          </p>
        </div>
      </section>
    </LegalPageShell>
  );
}
