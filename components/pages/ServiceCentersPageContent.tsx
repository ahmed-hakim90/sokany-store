"use client";

import { useMemo } from "react";
import { Container } from "@/components/Container";
import { FeaturedServiceCenterCard } from "@/features/service-centers/components/featured-service-center-card";
import { ServiceCenterCard } from "@/features/service-centers/components/ServiceCenterCard";
import { ServiceCentersEmergencyCard } from "@/features/service-centers/components/service-centers-emergency-card";
import { mockServiceCenters } from "@/features/service-centers/mock";

/*
 * مراكز الخدمة (/service-centers): عمود رأسي بعرض الصفحة؛ رأس متمركز على الجوال ومحاذي للبداية من md.
 * ثلاث كتل Container متتابعة: عنوان — بطاقة مميزة — قائمة فروع — بطاقة طوارئ.
 */
export function ServiceCentersPageContent() {
  const featured = useMemo(
    () => mockServiceCenters.find((c) => c.featured) ?? mockServiceCenters[0],
    [],
  );

  const listCenters = useMemo(
    () => mockServiceCenters.filter((c) => c.id !== featured.id),
    [featured],
  );

  return (
    <div className="flex min-w-0 flex-col gap-8 pb-6 pt-2 md:gap-10 md:pt-6">
      <Container>
        {/* رأس الصفحة: عنوان ووصف */}
        <header className="space-y-3 text-center md:text-start">
          <h1 className="font-display text-2xl font-bold leading-tight text-brand-950 sm:text-3xl md:text-4xl">
            مراكز الخدمة والفروع
          </h1>
          <p className="mx-auto max-w-prose text-sm leading-relaxed text-muted-foreground md:mx-0">
            تصفح العناوين أو تواصل معنا عند الحاجة إلى دعم سريع — البيانات للعرض التجريبي.
          </p>
        </header>
      </Container>

      <Container>
        {/* فرع مميز بعرض الحاوية */}
        <FeaturedServiceCenterCard center={featured} />
      </Container>

      <Container>
        {/* قائمة عمودية لباقي الفروع */}
        {listCenters.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground md:text-start">
            لا توجد فروع إضافية في القائمة.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {listCenters.map((c) => (
              <li key={c.id}>
                <ServiceCenterCard center={c} />
              </li>
            ))}
          </ul>
        )}
      </Container>

      <Container>
        {/* تنبيه/طوارئ في أسفل المسار */}
        <ServiceCentersEmergencyCard />
      </Container>
    </div>
  );
}
