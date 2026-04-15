import Link from "next/link";
import { cn } from "@/lib/utils";

export type AfterSalesRow = { title: string; body: string };

export type AboutAfterSalesSectionProps = {
  title: string;
  intro: string;
  rows: readonly AfterSalesRow[];
  ctaLabel: string;
  ctaHref: string;
  className?: string;
};

export function AboutAfterSalesSection({
  title,
  intro,
  rows,
  ctaLabel,
  ctaHref,
  className,
}: AboutAfterSalesSectionProps) {
  return (
    <section className={cn("space-y-9 sm:space-y-10", className)}>
      <header className="max-w-prose space-y-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl">{title}</h2>
        <p className="text-pretty text-sm leading-[1.85] text-muted-foreground sm:text-[15px]">{intro}</p>
      </header>
      <ul className="space-y-3 sm:space-y-4">
        {rows.map((row) => (
          <li
            key={row.title}
            className="rounded-2xl border border-black/[0.06] bg-white px-5 py-5 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6"
          >
            <h3 className="font-display text-[15px] font-bold text-brand-950">{row.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{row.body}</p>
          </li>
        ))}
      </ul>
      <div className="pt-2">
        <Link
          href={ctaHref}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-500 px-8 text-sm font-bold text-black transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-950 sm:w-auto sm:min-w-[200px]"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
