"use client";

import {
  CheckCircle,
  ExternalLink,
  Handshake,
  Map as MapIcon,
  Phone,
  Store,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import {
  authorizedRetailers as staticAuthorizedRetailers,
  distinctGovernorates,
  retailersMapHeroSrc as staticRetailersMapHeroSrc,
} from "@/features/retailers/data";
import type { AuthorizedRetailer } from "@/features/retailers/data";
import { CONTACT_EMAIL, WHATSAPP_SUPPORT_URL } from "@/lib/constants";
import {
  telHrefFromEgyptLocal,
  waMeUrlFromEgyptLocal,
} from "@/lib/egypt-phone";
import { cn } from "@/lib/utils";

function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function retailerTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10 && digits.startsWith("0")) {
    return telHrefFromEgyptLocal(phone);
  }
  return `tel:${phone.replace(/\s/g, "")}`;
}

function mapHrefForRetailer(r: AuthorizedRetailer): string {
  if (r.googleMapsUrl) return r.googleMapsUrl;
  return mapsSearchUrl(`${r.name} ${r.location}`);
}

const hitBtn =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-bold transition-colors sm:min-h-[44px]";

/*
 * الموزعون المعتمدون (/retailers): خلفية صفحة `bg-page`؛ رأس hero بعمودين من md (نص + خريطة)،
 * ثم سيكشن شراكة بعرض كامل بخلفية داكنة، ثم قائمة بطاقات مع فلتر محافظة (منسدلة) وشبكة responsive حتى lg:3 أعمدة.
 * سيكشن انضمام أسفل الصفحة بعرض محدود max-w-3xl.
 */
export type RetailersPageContentProps = {
  retailers?: AuthorizedRetailer[];
  mapHeroSrc?: string;
};

export function RetailersPageContent({
  retailers = staticAuthorizedRetailers,
  mapHeroSrc = staticRetailersMapHeroSrc,
}: RetailersPageContentProps) {
  const governorates = useMemo(() => distinctGovernorates(retailers), [retailers]);
  const [govFilter, setGovFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (govFilter === "all") return retailers;
    return retailers.filter((r) => r.governorate === govFilter);
  }, [govFilter, retailers]);

  const joinHref =
    WHATSAPP_SUPPORT_URL.trim() ||
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("طلب الانضمام كموزع معتمد")}`;

  const joinIsExternal = WHATSAPP_SUPPORT_URL.trim().length > 0;

  return (
    <div className="min-w-0 flex-1 bg-page pb-20 pt-2 md:pt-4">
      {/* Hero: خريطة بصرية + مقدمة */}
      <section className="border-b border-border/80 bg-white py-10 md:py-14">
        <Container className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div className="space-y-6 text-start">
              <h1 className="font-display text-2xl font-bold leading-tight text-brand-950 sm:text-3xl md:text-4xl">
                شبكة الموزعين المعتمدين
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                نحرص في سوكانى مصر على الوصول إليكم في كل مكان. اخترنا موزعينا
                بعناية لضمان حصولكم على المنتج الأصلي والخدمة التي تليق بكم تحت
                إشراف مجموعة المغربي.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">
                  <MapIcon className="h-4 w-4 shrink-0" aria-hidden />
                  تغطية على مستوى المحافظات
                </span>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-lg">
              <AppImage
                src={mapHeroSrc}
                alt="توزيع الموزعين المعتمدين على خريطة مصر"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover opacity-90"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* منطق الشراكة: أصالة، ضمان، تسعير */}
      <section
        className="bg-brand-950 py-14 text-white md:py-16"
        aria-labelledby="retailers-partnership-heading"
      >
        <Container className="mx-auto max-w-5xl">
          <div className="mb-10 text-center md:mb-12">
            <Handshake
              className="mx-auto mb-4 h-12 w-12 text-blue-200"
              aria-hidden
            />
            <h2
              id="retailers-partnership-heading"
              className="font-display text-2xl font-bold md:text-3xl"
            >
              لماذا تشتري من موزع معتمد؟
            </h2>
            <p className="mt-3 text-sm text-blue-100/90 md:text-base">
              العلاقة ليست مجرد بيع — بل منظومة متكاملة مع الوكيل الحصري.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <CheckCircle
                className="mb-4 h-8 w-8 text-emerald-400"
                aria-hidden
              />
              <h3 className="mb-2 font-display text-lg font-bold">
                أصالة المنتج
              </h3>
              <p className="text-sm leading-relaxed text-blue-100/95">
                الموزع المعتمد يستلم بضائعه من مخازن شركة المغربي الوكيل الحصري
                — منتج أصلي 100%.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <CheckCircle
                className="mb-4 h-8 w-8 text-emerald-400"
                aria-hidden
              />
              <h3 className="mb-2 font-display text-lg font-bold">
                سريان الضمان
              </h3>
              <p className="text-sm leading-relaxed text-blue-100/95">
                فاتورة الموزع المعتمد تضمن لك تفعيل ضمان الوكيل في مراكز صيانة
                المغربي المعتمدة.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <CheckCircle
                className="mb-4 h-8 w-8 text-emerald-400"
                aria-hidden
              />
              <h3 className="mb-2 font-display text-lg font-bold">
                التسعير الرسمي
              </h3>
              <p className="text-sm leading-relaxed text-blue-100/95">
                الالتزام بقائمة الأسعار الرسمية لضمان حق المستهلك وعدم التلاعب
                بالأسعار.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* قائمة المحلات + فلتر المحافظة */}
      <section
        className="py-12 md:py-16"
        aria-labelledby="retailers-list-heading"
      >
        <Container className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
            <div className="flex items-center gap-2 text-blue-800">
              <Store className="h-7 w-7 shrink-0" aria-hidden />
              <h2
                id="retailers-list-heading"
                className="font-display text-xl font-bold text-brand-950 md:text-2xl"
              >
                المحلات ونقاط البيع المعتمدة
              </h2>
            </div>
            <div className="flex flex-col gap-1 sm:min-w-[220px]">
              <label
                htmlFor="retailer-gov-filter"
                className="text-xs font-medium text-muted-foreground"
              >
                تصفية حسب المحافظة
              </label>
              <select
                id="retailer-gov-filter"
                value={govFilter}
                onChange={(e) => setGovFilter(e.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-3 text-base font-medium text-brand-950 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <option value="all">كل المحافظات</option>
                {governorates.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p
              className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-muted-foreground"
              role="status"
            >
              لا يوجد موزعون مسجّلون في هذه المحافظة حالياً. جرّب اختيار محافظة
              أخرى أو عرض الكل.
            </p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((store) => (
                <li key={store.name}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative aspect-[16/10] bg-muted">
                      <AppImage
                        src={store.imageSrc}
                        alt={`واجهة ${store.name}`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="absolute end-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        موزع معتمد
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="mb-1 text-xs font-bold text-blue-600">
                        {store.governorate}
                      </p>
                      <h3 className="mb-2 font-display text-lg font-bold text-brand-950">
                        {store.name}
                      </h3>
                      <p className="mb-6 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {store.location}
                      </p>
                      <div className="flex flex-col gap-2">
                        <a
                          href={mapHrefForRetailer(store)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            hitBtn,
                            "border border-border bg-surface-muted/50 text-brand-950 hover:bg-surface-muted",
                          )}
                        >
                          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                          الموقع على الخريطة
                        </a>
                        <a
                          href={retailerTelHref(store.phone)}
                          className={cn(
                            hitBtn,
                            "bg-blue-600 text-white hover:bg-blue-700",
                          )}
                        >
                          <Phone className="h-4 w-4 shrink-0" aria-hidden />
                          اتصال: {store.phone}
                        </a>
                        {store.phone.replace(/\D/g, "").length >= 10 ? (
                          <a
                            href={waMeUrlFromEgyptLocal(store.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              hitBtn,
                              "border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
                            )}
                          >
                            واتساب
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* طلب انضمام كموزع */}
      <section aria-labelledby="retailers-join-heading">
        <Container className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-sm sm:p-8">
            <h2
              id="retailers-join-heading"
              className="font-display text-xl font-bold text-brand-950"
            >
              هل ترغب في الانضمام كموزع معتمد؟
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              نرحّب بالشراكات التي تلتزم بمعايير الوكيل في العرض والتسعير
              والخدمة. أرسل لنا طلبك وسنتواصل معك لاستكمال الإجراءات.
            </p>
            <div className="mt-6">
              <Link
                href={joinHref}
                {...(joinIsExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={cn(
                  hitBtn,
                  "inline-flex w-full sm:w-auto",
                  "bg-brand-950 text-white hover:bg-brand-900",
                )}
              >
                تقديم طلب انضمام
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
