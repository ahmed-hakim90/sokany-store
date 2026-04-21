import { Container } from "@/components/Container";
import { CONTACT_EMAIL, ROUTES } from "@/lib/constants";

/*
 * صفحة تواصل معنا (/contact): عمود واحد داخل Container.
 * — العنوان + نص تعريفي؛ بريد كرابط mailto؛ ساعات العمل؛ رابط اختياري لتتبع الطلب.
 * — الجوال والديسكتوب: نفس الترتيب؛ مسافات رأسية موحّدة.
 */
export function ContactPageContent() {
  return (
    <div className="bg-page pb-10 pt-6 md:pb-16 md:pt-10">
      <Container className="max-w-2xl">
        <header className="mb-8 border-b border-border/80 pb-6">
          <h1 className="font-display text-2xl font-bold text-brand-950 md:text-3xl">
            تواصل معنا
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            نحن هنا لمساعدتك في الاستفسارات عن المنتجات، الطلبات، والضمان. اختر الوسيلة المناسبة
            أدناه.
          </p>
        </header>

        <section className="space-y-6 text-sm leading-relaxed md:text-base">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">البريد الإلكتروني</h2>
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
            <h2 className="font-display text-lg font-semibold text-brand-950">ساعات العمل</h2>
            <p className="mt-2 text-muted-foreground">
              القاهرة، مصر — دعم العملاء يومياً من 10:00 إلى 18:00.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">طلباتك</h2>
            <p className="mt-2 text-muted-foreground">
              لمتابعة حالة طلب:{" "}
              <a
                href={ROUTES.ORDER_TRACKING}
                className="font-medium text-brand-800 underline-offset-2 hover:underline"
              >
                تتبع الطلب
              </a>
            </p>
          </div>
        </section>
      </Container>
    </div>
  );
}
