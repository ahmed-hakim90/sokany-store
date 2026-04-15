import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type HomeHeroBannerProps = {
  title: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Tighter vertical rhythm on small screens (home reference). */
  compact?: boolean;
  className?: string;
};

export function HomeHeroBanner({
  title,
  subtitle,
  imageSrc = "/images/hero-banner.jpg",
  imageAlt = "",
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  compact,
  className,
}: HomeHeroBannerProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-brand-950 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full",
          compact
            ? "min-h-[138px] sm:min-h-[168px] md:min-h-[210px]"
            : "min-h-[180px] sm:min-h-[200px] md:min-h-[220px]",
        )}
      >
        <AppImage
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/78 via-black/5 to-black/20" />
        <div
          className={cn(
            "relative flex flex-col justify-center",
            compact
              ? "min-h-[138px] px-4 py-5 sm:min-h-[168px] sm:px-7 sm:py-6 md:min-h-[210px] md:px-10"
              : "min-h-[180px] px-5 py-8 sm:min-h-[200px] sm:px-8 md:min-h-[220px] md:px-10",
          )}
        >
          <h1
            className={cn(
              "max-w-[16rem] font-display font-bold leading-[1.15] tracking-tight text-white sm:max-w-lg",
              compact ? "text-[1.35rem] sm:text-2xl md:text-3xl" : "text-2xl sm:text-3xl md:text-4xl",
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "mt-1.5 max-w-md text-pretty text-white/88 sm:mt-2",
              compact ? "text-xs sm:text-sm" : "text-sm sm:text-base",
            )}
          >
            {subtitle}
          </p>
          <div className={cn("flex flex-wrap gap-2.5", compact ? "mt-4 sm:mt-5" : "mt-5")}>
            <Link
              href={primaryHref}
              className={cn(
                "inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-black shadow-md transition-colors hover:bg-brand-400",
                compact ? "h-9 sm:h-10 sm:px-5" : "h-10 sm:h-12 sm:px-6 sm:text-base",
              )}
            >
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex h-10 items-center justify-center rounded-md border border-white/40 bg-white/95 px-5 text-sm font-medium text-brand-950 transition-colors hover:bg-white sm:h-12 sm:px-6 sm:text-base"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
