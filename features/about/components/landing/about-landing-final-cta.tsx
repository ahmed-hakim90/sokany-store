import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import {
  aboutLandingBodyClass,
  aboutLandingCtaRowClass,
  aboutLandingHeroShellClass,
  aboutLandingMediaFrameClass,
  aboutLandingOutlineCtaClass,
  aboutLandingPrimaryCtaClass,
  aboutLandingSectionTitleClass,
} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingFinalCta } from "@/features/about/content/about-landing-content";
import { cn } from "@/lib/utils";

/*
 * دعوة ختامية — خلفية فاتحة + صورة أجهزة؛ أزرار منتجات وتواصل.
 */
export function AboutLandingFinalCta() {
  const { title, subtitle, primaryCta, secondaryCta, imageSrc, imageAlt } = aboutLandingFinalCta;

  return (
    <section
      className={cn(
        aboutLandingHeroShellClass,
        "bg-gradient-to-br from-surface-muted/40 via-white to-brand-50/50 px-6 py-8 sm:px-10 sm:py-10",
      )}
      aria-labelledby="about-final-cta-title"
    >
      <div
        className="pointer-events-none absolute -end-16 -top-20 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden
      />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-4">
          <h2 id="about-final-cta-title" className={aboutLandingSectionTitleClass}>
            {title}
          </h2>
          <p className={aboutLandingBodyClass}>{subtitle}</p>
          <div className={aboutLandingCtaRowClass}>
            <Link href={primaryCta.href} className={aboutLandingPrimaryCtaClass}>
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className={aboutLandingOutlineCtaClass}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
        <div
          className={cn(
            aboutLandingMediaFrameClass,
            "relative mx-auto aspect-[16/10] w-full max-w-md bg-white/60 md:mx-0 md:max-w-xs",
          )}
        >
          <AppImage
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 90vw, 320px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
