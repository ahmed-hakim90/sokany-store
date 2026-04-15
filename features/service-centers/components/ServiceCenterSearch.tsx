"use client";

import { useMemo, useState } from "react";
import { SearchField } from "@/components/ui/search-field";
import { cn } from "@/lib/utils";
import type { ServiceCenter } from "@/features/service-centers/types";
import { ServiceCenterCard } from "@/features/service-centers/components/ServiceCenterCard";

export type ServiceCenterSearchProps = {
  centers: ServiceCenter[];
  className?: string;
};

export function ServiceCenterSearch({ centers, className }: ServiceCenterSearchProps) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return centers;
    return centers.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        c.city.toLowerCase().includes(t) ||
        c.address.toLowerCase().includes(t),
    );
  }, [centers, q]);

  return (
    <div className={cn("space-y-8", className)}>
      <SearchField
        className="max-w-xl"
        placeholder="ابحث بالمدينة أو اسم الفرع…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="بحث مراكز الخدمة"
        leading={
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
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
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((c) => (
            <li key={c.id}>
              <ServiceCenterCard center={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
