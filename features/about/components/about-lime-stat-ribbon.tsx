import { cn } from "@/lib/utils";

export type AboutLimeStatRibbonProps = {
  value: string;
  label: string;
  className?: string;
};

export function AboutLimeStatRibbon({ value, label, className }: AboutLimeStatRibbonProps) {
  return (
    <section
      className={cn(
        "rounded-[1.35rem] bg-brand-500 px-8 py-11 sm:px-10 sm:py-12 md:px-12 md:py-14",
        className,
      )}
      aria-labelledby="about-lime-stat-label"
    >
      <p
        id="about-lime-stat-label"
        className="font-display text-[2.65rem] font-bold leading-none tracking-tight text-black sm:text-5xl md:text-6xl"
        dir="ltr"
      >
        {value}
      </p>
      <p className="mt-4 max-w-md text-pretty text-sm font-semibold leading-relaxed text-black/75 sm:text-[15px]">
        {label}
      </p>
    </section>
  );
}
