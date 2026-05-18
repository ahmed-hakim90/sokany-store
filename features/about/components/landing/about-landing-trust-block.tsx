import {
  aboutLandingIconTileClass,
  aboutLandingLeadClass,
  aboutLandingPanelClass,
  aboutLandingSectionStackClass,
  aboutLandingSectionTitleClass,
} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingTrust } from "@/features/about/content/about-landing-content";
import { cn } from "@/lib/utils";

/*
 * كتلة الثقة — 4 بطاقات؛ عمودان على الجوال، صف واحد من lg.
 */
export function AboutLandingTrustBlock() {
  const { title, items } = aboutLandingTrust;

  return (
    <section className={aboutLandingSectionStackClass} aria-labelledby="about-trust-title">
      <h2 id="about-trust-title" className={aboutLandingSectionTitleClass}>
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ title: itemTitle, description, icon: Icon }) => (
          <li key={itemTitle}>
            <article
              className={cn(
                aboutLandingPanelClass,
                "flex h-full flex-col gap-3 border-brand-700/35 bg-gradient-to-b from-white to-brand-50/40 p-4 sm:p-5",
              )}
            >
              <span className={cn(aboutLandingIconTileClass, "h-10 w-10")}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-sm font-bold text-brand-950 sm:text-base">{itemTitle}</h3>
              <p className={aboutLandingLeadClass}>{description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
