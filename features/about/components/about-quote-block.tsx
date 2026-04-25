import { cn } from "@/lib/utils";

export type AboutQuoteBlockProps = {
  quote: string;
  attribution?: string;
  className?: string;
};

export function AboutQuoteBlock({ quote, attribution, className }: AboutQuoteBlockProps) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] border border-border/80 bg-white px-8 py-14 sm:px-11 sm:py-16 md:px-14 md:py-[4.25rem]",
        className,
      )}
    >
      <span
        className="absolute start-6 top-6 font-display text-6xl leading-none text-brand-500/20 sm:start-8 sm:top-8 sm:text-7xl"
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="relative max-w-3xl text-pretty text-lg font-medium leading-[1.85] text-brand-950 sm:text-xl md:text-[1.35rem]">
        {quote}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-8 text-sm font-semibold tracking-wide text-brand-800">— {attribution}</figcaption>
      ) : null}
    </figure>
  );
}
