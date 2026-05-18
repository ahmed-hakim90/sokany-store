import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { aboutLandingHero } from "@/features/about/content/about-landing-content";
import { cn } from "@/lib/utils";
import {
  aboutLandingAccentTextClass,
  aboutLandingBodyClass,
  aboutLandingCollageGridClass,
  aboutLandingCtaRowClass,
  aboutLandingHeroShellClass,
  aboutLandingMediaFrameClass,
  aboutLandingOutlineCtaClass,
  aboutLandingPrimaryCtaClass,
} from "@/features/about/components/landing/about-landing-surfaces";

/*
 * قسم الهيرو — صفحة من نحن (SEO):
 * — الجوال: عمود واحد — نص ثم صورة؛ أزرار CTA بعرض كامل.
 * — md+: شبكة عمودين — صورة ونص جنباً إلى جنب.
 */
export function AboutLandingHero() {
  const { h1Before, h1Highlight, h1After, subtitle, primaryCta, secondaryCta, collage } =
    aboutLandingHero;

  return (
    <section
      className={aboutLandingHeroShellClass}
      aria-labelledby="about-landing-hero-title"
    >
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2 md:items-center md:gap-10 lg:p-10">
        <div className="order-2 md:order-1">
          <div className={aboutLandingCollageGridClass}>
            {collage.map((tile, index) => (
              <div
                key={tile.src}
                className={cn(
                  aboutLandingMediaFrameClass,
                  "relative aspect-square rounded-xl bg-surface-muted/40",
                )}
              >
                <AppImage
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 768px) 45vw, 240px"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 flex flex-col gap-6 md:order-2">
          <h1
            id="about-landing-hero-title"
            className="text-pretty font-display text-[1.65rem] font-bold leading-[1.15] tracking-tight text-brand-950 sm:text-3xl lg:text-[2.1rem]"
          >
            {h1Before}
            <span className={aboutLandingAccentTextClass}>{h1Highlight}</span>
            {h1After}
          </h1>
          <p className={`max-w-xl ${aboutLandingBodyClass}`}>{subtitle}</p>
          <div className={aboutLandingCtaRowClass}>
            <Link href={primaryCta.href} className={aboutLandingPrimaryCtaClass}>
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className={aboutLandingOutlineCtaClass}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
