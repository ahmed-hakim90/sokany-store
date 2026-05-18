import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import {
  warrantyLandingBodyClass,
  warrantyLandingCollageGridClass,
  warrantyLandingCtaRowClass,
  warrantyLandingHeroShellClass,
  warrantyLandingIconTileClass,
  warrantyLandingMediaFrameClass,
  warrantyLandingMiniCardsGridClass,
  warrantyLandingOutlineCtaClass,
  warrantyLandingPanelClass,
  warrantyLandingPrimaryCtaClass,
} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingHero } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * هيرو صفحة الضمان — H1 + بطاقات ثقة + CTA:
 * — الجوال: نص ثم شبكة صور 2×2 ثم بطاقات ميزات؛ أزرار بعرض كامل.
 * — md+: عمودان — صور | نص وبطاقات.
 */
export function WarrantyLandingHero() {
  const { h1, subtitle, primaryCta, secondaryCta, collage, featureCards } = warrantyLandingHero;

  return (
    <section
      className={warrantyLandingHeroShellClass}
      aria-labelledby="warranty-landing-hero-title"
    >
      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2 md:items-center md:gap-10 lg:p-10">
        <div className="order-2 md:order-1">
          <div className={warrantyLandingCollageGridClass}>
            {collage.map((tile, index) => (
              <div
                key={tile.src}
                className={cn(
                  warrantyLandingMediaFrameClass,
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
            id="warranty-landing-hero-title"
            className="text-pretty font-display text-[1.65rem] font-bold leading-[1.15] tracking-tight text-brand-950 sm:text-3xl lg:text-[2.1rem]"
          >
            {h1}
          </h1>
          <p className={cn("max-w-xl", warrantyLandingBodyClass)}>{subtitle}</p>

          <ul className={warrantyLandingMiniCardsGridClass}>
            {featureCards.map(({ title, description, icon: Icon }) => (
              <li key={title}>
                <article
                  className={cn(
                    warrantyLandingPanelClass,
                    "flex h-full flex-col gap-2.5 p-4 sm:gap-3 sm:p-4",
                  )}
                >
                  <span className={cn(warrantyLandingIconTileClass, "h-9 w-9")}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="font-display text-sm font-bold text-brand-950">{title}</h3>
                  <p className="text-xs leading-relaxed text-brand-950/80">{description}</p>
                </article>
              </li>
            ))}
          </ul>

          <div className={warrantyLandingCtaRowClass}>
            <Link href={primaryCta.href} className={warrantyLandingPrimaryCtaClass}>
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className={warrantyLandingOutlineCtaClass}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
