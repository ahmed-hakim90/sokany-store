import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import {
  warrantyLandingBodyClass,
  warrantyLandingCtaRowClass,
  warrantyLandingHeroShellClass,
  warrantyLandingMediaFrameClass,
  warrantyLandingOutlineCtaClass,
  warrantyLandingPrimaryCtaClass,
  warrantyLandingSectionTitleClass,
} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { cn } from "@/lib/utils";
import { warrantyLandingFinalCta } from "@/features/warranty/content/warranty-landing-content";

/*
 * دعوة ختامية — عنوان + أزرار منتجات وتواصل + صورة أجهزة.
 */
export function WarrantyLandingFinalCta() {
  const { title, subtitle, primaryCta, secondaryCta, imageSrc, imageAlt } = warrantyLandingFinalCta;

  return (
    <section
      className={cn(
        warrantyLandingHeroShellClass,
        "bg-gradient-to-br from-surface-muted/40 via-white to-brand-50/50 px-6 py-8 sm:px-10 sm:py-10",
      )}
      aria-labelledby="warranty-final-cta-title"
    >
      <div
        className="pointer-events-none absolute -end-16 -top-20 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden
      />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-4">
          <h2 id="warranty-final-cta-title" className={warrantyLandingSectionTitleClass}>
            {title}
          </h2>
          <p className={warrantyLandingBodyClass}>{subtitle}</p>
          <div className={warrantyLandingCtaRowClass}>
            <Link href={primaryCta.href} className={warrantyLandingPrimaryCtaClass}>
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className={warrantyLandingOutlineCtaClass}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
        <div
          className={cn(
            warrantyLandingMediaFrameClass,
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
