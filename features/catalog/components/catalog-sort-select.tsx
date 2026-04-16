"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback } from "react";
import { ROUTES } from "@/lib/constants";

const OPTIONS = [
  { value: "popularity:desc", label: "الأكثر مبيعاً" },
  { value: "date:desc", label: "الأحدث" },
  { value: "price:asc", label: "السعر: من الأقل للأعلى" },
  { value: "price:desc", label: "السعر: من الأعلى للأقل" },
  { value: "rating:desc", label: "الأعلى تقييماً" },
] as const;

export function CatalogSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentOrderby = searchParams.get("orderby") ?? "popularity";
  const currentOrder = searchParams.get("order") ?? "desc";
  const value = `${currentOrderby}:${currentOrder}`;

  const onChange = useCallback(
    (next: string) => {
      const [orderby, order] = next.split(":") as [string, "asc" | "desc"];
      const params = new URLSearchParams(searchParams.toString());
      if (orderby && order) {
        params.set("orderby", orderby);
        params.set("order", order);
      }
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS, {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  return (
    <label className="flex min-w-0 flex-col gap-1 text-start sm:inline-flex sm:flex-row sm:items-center sm:gap-2">
      <span className="shrink-0 text-xs font-semibold text-muted-foreground sm:text-sm">
        ترتيب حسب
      </span>
      <select
        className="h-10 min-w-[10.5rem] max-w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none ring-brand-500/0 focus-visible:ring-2 focus-visible:ring-brand-500/35"
        value={OPTIONS.some((o) => o.value === value) ? value : "popularity:desc"}
        onChange={(e) => onChange(e.target.value)}
        aria-label="ترتيب المنتجات"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
