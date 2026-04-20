import {
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import { Container } from "@/components/Container";
import { branchesData } from "@/features/branches/data";
import {
  telHrefFromEgyptLocal,
  waMeUrlFromEgyptLocal,
} from "@/lib/egypt-phone";
import { cn } from "@/lib/utils";

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const hitBtn =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-bold transition-colors sm:min-h-[44px]";

/*
 * الفروع ومراكز الصيانة (/branches): عمود واحد بعرض محدود max-w-4xl؛ رأس أبيض بحد سفلي ثم قسمان:
 * فروع البيع (إطار أزرق + شارة) ومراكز الصيانة (بطاقات محايدة + أزرار واتساب/اتصال/خريطة بعرض كامل على الجوال).
 * من md: المحاذاة والمسافات كما في باقي الصفحات الثابتة.
 */
export function BranchesPageContent() {
  return (
    <div className="min-w-0 flex-1 bg-page pb-20 pt-2 md:pt-4">
      <div className="border-b border-border/80 bg-white py-8 text-center md:py-10">
        <Container className="max-w-4xl">
          <header className="space-y-3">
            <h1 className="font-display text-2xl font-bold leading-tight text-brand-950 sm:text-3xl md:text-4xl">
              مراكز الصيانة والفروع
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              شركة المغربي — الوكيل الحصري لسوكانى في مصر
            </p>
            <div
              className="mx-auto mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800"
              role="status"
            >
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              <span>مواعيد العمل: يومياً من 10 صباحاً إلى 8 مساءً</span>
            </div>
          </header>
        </Container>
      </div>

      <Container className="mx-auto mt-6 max-w-4xl space-y-10 md:mt-8 md:space-y-12">
        {/* قسم فروع البيع: بطاقة مميزة بلون أزرق للتمييز عن الصيانة */}
        <section aria-labelledby="branches-sales-heading">
          <div className="mb-4 flex items-center gap-2 text-blue-800">
            <ShoppingBag className="h-6 w-6 shrink-0" aria-hidden />
            <h2
              id="branches-sales-heading"
              className="font-display text-xl font-bold text-brand-950"
            >
              فروع البيع والاستلام
            </h2>
          </div>
          <ul className="flex flex-col gap-4">
            {branchesData.sales.map((branch) => (
              <li key={branch.name}>
                <article
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6",
                  )}
                >
                  <div className="absolute end-0 top-0 rounded-bl-lg bg-blue-600 px-3 py-1 text-[10px] font-bold text-white">
                    فرع بيع متاح
                  </div>
                
                  <h3 className="mb-2 pe-24 font-display text-lg font-bold text-brand-950">
                    {branch.name}
                  </h3>
                  <p className="mb-4 flex items-start gap-2 text-base leading-relaxed text-muted-foreground">
                    <MapPin
                      className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>{branch.address}</span>
                  </p>
                  <div
              className="mx-auto mt-4 mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800"
              role="status"
            >
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              <span>مواعيد العمل: يومياً من 10 صباحاً إلى 11 مساءً</span>
            </div>
                  <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      hitBtn,
                      "bg-blue-600 text-white hover:bg-blue-700",
                    )}
                  >
                    <MapPin className="h-5 w-5 shrink-0" aria-hidden />
                    رؤية الموقع على الخريطة
                  </a>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* قسم مراكز الصيانة: شبكة بطاقات + واتساب واتصال بأهداف ضغط كبيرة */}
        <section aria-labelledby="branches-service-heading">
          <div className="mb-4 flex items-center gap-2 text-emerald-800">
            <Wrench className="h-6 w-6 shrink-0" aria-hidden />
            <h2
              id="branches-service-heading"
              className="font-display text-xl font-bold text-brand-950"
            >
              مراكز الصيانة المعتمدة
            </h2>
          </div>
          <ul className="grid gap-4">
            {branchesData.service.map((branch) => {
              const mapHref = mapsSearchUrl(branch.address);
              const waHref = waMeUrlFromEgyptLocal(branch.whatsapp);
              const phoneHref = telHrefFromEgyptLocal(branch.whatsapp);

              return (
                <li key={branch.name}>
                  <article className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="mb-2 font-display text-lg font-bold text-brand-950">
                      {branch.name}
                    </h3>
                    <p className="mb-4 flex items-start gap-2 text-base leading-relaxed text-muted-foreground">
                      <MapPin
                        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span>{branch.address}</span>
                    </p>
                    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          hitBtn,
                          "border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
                        )}
                      >
                        <MessageSquare className="h-5 w-5 shrink-0" aria-hidden />
                        واتساب
                      </a>
                      <a
                        href={phoneHref}
                        className={cn(
                          hitBtn,
                          "border border-border bg-surface-muted/50 text-brand-950 hover:bg-surface-muted",
                        )}
                      >
                        <Phone className="h-5 w-5 shrink-0" aria-hidden />
                        اتصال
                      </a>
                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          hitBtn,
                          "sm:col-span-2",
                          "border border-border bg-white text-brand-950 hover:bg-surface-muted/50",
                        )}
                      >
                        <MapPin className="h-5 w-5 shrink-0" aria-hidden />
                        موقعنا على الخريطة
                      </a>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>

      <footer className="mt-10 px-4 text-center">
        <p className="mx-auto max-w-prose text-xs leading-relaxed text-muted-foreground">
          جميع حقوق الصيانة والضمان محفوظة لشركة المغربي الوكيل الحصري لمنتجات
          سوكانى في مصر.
        </p>
      </footer>
    </div>
  );
}
