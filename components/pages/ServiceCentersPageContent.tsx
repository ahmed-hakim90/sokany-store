"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { SearchField } from "@/components/ui/search-field";
import { FeaturedServiceCenterCard } from "@/features/service-centers/components/featured-service-center-card";
import { ServiceCenterCard } from "@/features/service-centers/components/ServiceCenterCard";
import { ServiceCentersEmergencyCard } from "@/features/service-centers/components/service-centers-emergency-card";
import { mockServiceCenters } from "@/features/service-centers/mock";
import type { ServiceCenter } from "@/features/service-centers/types";

function matchesQuery(center: ServiceCenter, q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  return (
    center.name.toLowerCase().includes(t) ||
    center.city.toLowerCase().includes(t) ||
    center.address.toLowerCase().includes(t) ||
    (center.description?.toLowerCase().includes(t) ?? false)
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export function ServiceCentersPageContent() {
  const [q, setQ] = useState("");

  const featured = useMemo(
    () => mockServiceCenters.find((c) => c.featured) ?? mockServiceCenters[0],
    [],
  );

  const filtered = useMemo(
    () => mockServiceCenters.filter((c) => matchesQuery(c, q)),
    [q],
  );

  const showFeatured = !q.trim() || matchesQuery(featured, q);
  const listCenters = useMemo(() => {
    if (!showFeatured) return filtered;
    return filtered.filter((c) => c.id !== featured.id);
  }, [filtered, featured, showFeatured]);

  return (
    <div className="flex flex-col gap-8 pb-6 pt-2 md:gap-10 md:pt-6">
      <Container>
        <header className="space-y-3 text-center md:text-start">
          <h1 className="font-display text-3xl font-bold leading-tight text-brand-950 md:text-4xl">
            مراكز الخدمة والفروع
          </h1>
          <p className="mx-auto max-w-prose text-sm leading-relaxed text-muted-foreground md:mx-0">
            اعثر على أقرب فرع، تصفح العناوين، أو تواصل معنا عند الحاجة إلى دعم سريع — البيانات للعرض
            التجريبي.
          </p>
        </header>
      </Container>

      <Container>
        <div className="flex items-stretch gap-2.5">
          <SearchField
            id="service-center-search"
            placeholder="ابحث بالمدينة أو اسم الفرع…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="بحث مراكز الخدمة"
            className="min-h-[48px] flex-1 rounded-2xl border-border/80 bg-white py-0 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]"
            inputClassName="py-3 text-sm"
            leading={
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px] text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
            }
          />
          <button
            type="button"
            className="inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-black shadow-[0_2px_12px_-4px_rgba(218,255,0,0.45)] transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            aria-label="التركيز على حقل البحث"
            onClick={() => document.getElementById("service-center-search")?.focus()}
          >
            <SearchIcon />
          </button>
        </div>
      </Container>

      {showFeatured ? (
        <Container>
          <FeaturedServiceCenterCard center={featured} />
        </Container>
      ) : null}

      <Container>
        {listCenters.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground md:text-start">لا توجد فروع مطابقة لبحثك.</p>
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
        <ServiceCentersEmergencyCard />
      </Container>
    </div>
  );
}
