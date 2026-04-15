import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type AboutEditorialHeroProps = {
  headline: string;
  imageSrc: string;
  imageAlt?: string;
  className?: string;
};

export function AboutEditorialHero({
  headline,
  imageSrc,
  imageAlt = "",
  className,
}: AboutEditorialHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate min-h-[272px] overflow-hidden rounded-[1.35rem] border border-black/[0.06] shadow-[0_12px_40px_-20px_rgba(15,23,42,0.18)] sm:min-h-[300px] md:min-h-[340px]",
        className,
      )}
    >
      <AppImage src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-cover" priority />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/48 to-black/22"
        aria-hidden
      />
      <div className="relative flex min-h-[272px] flex-col justify-end sm:min-h-[300px] md:min-h-[340px]">
        <div className="px-7 pb-9 pt-16 sm:px-9 sm:pb-10 md:px-11 md:pb-11">
          <h1 className="max-w-[18ch] text-pretty font-display text-[1.7rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[1.85rem] md:text-4xl">
            {headline}
          </h1>
        </div>
      </div>
    </section>
  );
}
