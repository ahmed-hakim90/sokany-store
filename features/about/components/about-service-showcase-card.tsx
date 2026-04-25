import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type AboutServiceShowcaseCardProps = {
  imageSrc: string;
  imageAlt?: string;
  chipHref: string;
  chipLabel: string;
  className?: string;
};

export function AboutServiceShowcaseCard({
  imageSrc,
  imageAlt = "",
  chipHref,
  chipLabel,
  className,
}: AboutServiceShowcaseCardProps) {
  return (
    <div
      className={cn(
        "relative isolate min-h-[260px] overflow-hidden rounded-[1.35rem] border border-black/[0.06] shadow-[0_12px_40px_-22px_rgba(15,23,42,0.2)] sm:min-h-[300px] md:min-h-[320px]",
        className,
      )}
    >
      <AppImage src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" aria-hidden />
      <div className="relative flex min-h-[260px] flex-col justify-end sm:min-h-[300px] md:min-h-[320px]">
        <div className="p-6 sm:p-8 md:p-9">
          <Link
            href={chipHref}
            className="inline-flex w-fit items-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-black shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-950"
          >
            {chipLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
