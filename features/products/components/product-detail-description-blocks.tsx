import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";

function splitDescription(text: string): { lead: string; rest: string } {
  const t = text.trim();
  if (!t) return { lead: "", rest: "" };
  const parts = t.split(/\n{2,}/);
  const lead = parts[0]?.trim() ?? t;
  const rest = parts.slice(1).join("\n\n").trim();
  return { lead, rest };
}

export function ProductDetailDescriptionBlocks({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const body = product.description.trim() || product.shortDescription.trim();
  const { lead, rest } = splitDescription(body);
  const intro = lead || product.shortDescription.trim();

  if (!intro && !rest) return null;

  return (
    <div className={cn("space-y-6", className)}>
      <figure className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-900/90 via-amber-800/85 to-stone-900 p-6 text-center shadow-inner">
        <figcaption className="font-display text-lg font-bold text-amber-50">
          جودة الطهي
        </figcaption>
        <p className="mt-1 text-sm text-amber-100/90">تشغيل آمن وتصميم عملي للاستخدام اليومي</p>
      </figure>

      {(intro || rest) && (
        <section className="rounded-2xl border border-border bg-white/95 p-5 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]">
          <h2 className="font-display text-lg font-bold text-brand-950">هندسة طهي ذكية</h2>
          {intro ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-700">{intro}</p>
          ) : null}
          {rest ? (
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{rest}</p>
          ) : null}

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            <li className="flex gap-3 rounded-xl border border-border/80 bg-surface-muted/50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-200/80 text-brand-900">
                <BoltIcon />
              </span>
              <p className="text-xs font-medium leading-snug text-foreground">
                نظام تسخين سريع يصل لدرجة حرارة عالية في دقائق قليلة مع توزيع حراري متجانس.
              </p>
            </li>
            <li className="flex gap-3 rounded-xl border border-border/80 bg-surface-muted/50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <LeafIcon />
              </span>
              <p className="text-xs font-medium leading-snug text-foreground">
                يوفر في استهلاك الطاقة مقارنة بالأفرن التقليدية عند الاستخدام المنتظم.
              </p>
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M11 20A7 7 0 016 9a7 7 0 0111-5 7 7 0 01-6 16z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
