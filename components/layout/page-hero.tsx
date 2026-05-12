import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type PageHeroProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Background image URL */
  imageSrc?: string;
  imageAlt?: string;
  /** Darken image for contrast */
  overlay?: boolean;
  cta?: React.ReactNode;
  className?: string;
};

export function PageHero({
  title,
  subtitle,
  imageSrc,
  imageAlt = "",
  overlay,
  cta,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-xl border border-border bg-surface-muted",
        imageSrc && "min-h-[200px] md:min-h-[280px]",
        className,
      )}
    >
      {imageSrc ? (
        <>
          <span className="absolute inset-0 -z-10 block">
            <AppImage
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </span>
          {overlay ? (
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/40 to-black/20"
              aria-hidden
            />
          ) : null}
        </>
      ) : null}
      <div
        className={cn(
          "relative flex flex-col gap-3 px-6 py-10 md:px-10 md:py-14",
          imageSrc && "text-white",
        )}
      >
        <h1
          className={cn(
            "font-display text-3xl font-semibold tracking-tight md:text-4xl",
            !imageSrc && "text-brand-950",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "max-w-2xl text-pretty text-sm md:text-base",
              imageSrc ? "text-white/90" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {cta ? <div className="mt-2 flex flex-wrap gap-3">{cta}</div> : null}
      </div>
    </section>
  );
}
