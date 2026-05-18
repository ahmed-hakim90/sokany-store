"use client";

import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { startTransition, useCallback } from "react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "popularity:desc", label: "الأكثر مبيعاً" },
  { value: "date:desc", label: "الأحدث" },
  { value: "price:asc", label: "السعر: من الأقل للأعلى" },
  { value: "price:desc", label: "السعر: من الأعلى للأقل" },
  { value: "rating:desc", label: "الأعلى تقييماً" },
  { value: "rand", label: "ترتيب عشوائي" },
] as const;

type CatalogSortSelectProps = {
  /** تسمية مرئية أقصر لصف العناوين (مثلاً رأس الكتالوج) */
  compact?: boolean;
};

export function CatalogSortSelect({ compact = false }: CatalogSortSelectProps) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const currentOrderby = searchParams.get("orderby") ?? "popularity";
  const currentOrder = searchParams.get("order") ?? "desc";
  const value =
    currentOrderby === "rand"
      ? "rand"
      : `${currentOrderby}:${currentOrder}`;

  const onChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "rand") {
        params.set("orderby", "rand");
        params.delete("order");
      } else {
        const [orderby, order] = next.split(":") as [string, "asc" | "desc"];
        if (orderby && order) {
          params.set("orderby", orderby);
          params.set("order", order);
        }
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
    <label
      className={cn(
        "flex min-w-0 flex-col gap-1 text-start",
        !compact && "sm:inline-flex sm:flex-row sm:items-center sm:gap-2",
        compact && "inline-flex flex-row items-center gap-2",
      )}
    >
      <span
        className={cn(
          "shrink-0 text-xs font-semibold text-muted-foreground sm:text-sm",
          compact && "sr-only",
        )}
      >
        ترتيب حسب
      </span>
      <select
        className={cn(
          "max-w-full rounded-xl border border-border bg-white font-semibold text-foreground outline-none ring-brand-500/0 focus-visible:ring-2 focus-visible:ring-brand-500/35",
          compact
            ? "h-9 min-w-[9rem] max-w-[min(100%,11rem)] px-2.5 text-xs"
            : "h-10 min-w-[10.5rem] px-3 text-sm",
        )}
        value={
          OPTIONS.some((o) => o.value === value) ? value : "popularity:desc"
        }
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
