"use client";

import { useId, useState } from "react";
import { Link } from "next-view-transitions";
import type { ProductTrustSummary } from "@/components/pages/ProductDetailPageContent";
import {
  buildProductTrustStripItems,
  type ProductTrustStripItem,
} from "@/features/products/content/product-trust-strip-content";
import { cn } from "@/lib/utils";

export type ProductTrustStripProps = {
  trustSummary?: ProductTrustSummary;
};

export function ProductTrustStrip({ trustSummary }: ProductTrustStripProps) {
  const branchTotal =
    (trustSummary?.salesBranchesCount ?? 0) +
    (trustSummary?.serviceBranchesCount ?? 0);
  const items = buildProductTrustStripItems(branchTotal);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_14px_44px_-34px_rgba(15,23,42,0.42)]"
      aria-label="مزايا الشراء والثقة"
    >
      {items.map((item) => (
        <ProductTrustStripAccordionItem
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={() =>
            setOpenId((current) => (current === item.id ? null : item.id))
          }
        />
      ))}
    </section>
  );
}

function ProductTrustStripAccordionItem({
  item,
  open,
  onToggle,
}: {
  item: ProductTrustStripItem;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const Icon = item.icon;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60">
      <button
        type="button"
        className="flex min-w-0 w-full items-center gap-3 p-4 text-start transition-colors hover:bg-white"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 ring-1 ring-slate-200">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-bold text-slate-950">
            {item.title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {item.body}
          </span>
        </span>
        <Chevron expanded={open} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id={panelId} className="min-h-0 overflow-hidden">
          <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3">
            <ul className="space-y-2 text-xs leading-6 text-slate-600">
              {item.summaryPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href={item.href}
              className="inline-flex min-h-10 items-center text-xs font-semibold text-brand-800 underline-offset-2 hover:underline"
            >
              {item.linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={cn(
        "shrink-0 text-muted-foreground transition-transform duration-200",
        expanded && "-rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
