import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type HomePromoCardProps = {
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  /** Small label above the title (e.g. «حصرياً»). */
  eyebrow?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function HomePromoCard({
  title,
  subtitle,
  href,
  ctaLabel,
  eyebrow,
  imageSrc = "/images/hero-banner.jpg",
  imageAlt = "",
  className,
}: HomePromoCardProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-brand-900/50 bg-brand-950 shadow-lg",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 md:hidden">
        <AppImage src={imageSrc} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950 via-brand-950/95 to-brand-950" />
      </div>

      <div className="flex flex-col md:min-h-[15rem] md:flex-row md:items-stretch">
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-2 px-5 py-7 sm:px-8 md:max-w-[52%] md:py-9 lg:px-10">
          {eyebrow ? (
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-400 sm:text-xs">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="font-display text-xl font-bold leading-snug text-white sm:text-2xl md:text-3xl">
            {title}
          </h2>
          <p className="max-w-xl text-pretty text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
            {subtitle}
          </p>
          <Link
            href={href}
            className="mt-1 inline-flex w-fit text-sm font-bold text-brand-400 underline decoration-brand-400 decoration-2 underline-offset-[5px] transition-colors hover:text-brand-300 hover:decoration-brand-300"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="relative hidden min-h-0 flex-1 md:block">
          <AppImage
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1280px) 45vw, 520px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/25 to-transparent" />
        </div>
      </div>
    </section>
  );
}
