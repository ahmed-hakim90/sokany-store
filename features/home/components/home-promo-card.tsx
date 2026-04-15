import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type HomePromoCardProps = {
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function HomePromoCard({
  title,
  subtitle,
  href,
  ctaLabel,
  imageSrc = "/images/hero-banner.jpg",
  imageAlt = "",
  className,
}: HomePromoCardProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-brand-900/40 bg-brand-950 shadow-md",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10">
        <AppImage src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-l from-brand-950 via-brand-950/92 to-brand-900/85" />
      </div>
      <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
        <div className="max-w-xl">
          <h2 className="font-display text-lg font-bold leading-snug text-white sm:text-2xl">{title}</h2>
          <p className="mt-1.5 text-pretty text-xs text-white/78 sm:mt-2 sm:text-base">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg bg-brand-500 px-6 text-sm font-semibold text-black transition-colors hover:bg-brand-400 sm:h-12 sm:w-auto"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
