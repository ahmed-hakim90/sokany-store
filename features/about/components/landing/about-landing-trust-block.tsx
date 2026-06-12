import {
  aboutLandingDarkCardClass,
  aboutLandingDarkHeadingClass,
  aboutLandingDarkIconTileClass,
  aboutLandingDarkLeadClass,
  aboutLandingDarkSectionClass,
  aboutLandingInnerContainerClass,
} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingTrust } from "@/features/about/content/about-landing-content";

/*
 * كتلة الثقة — قسم داكن zinc-950؛ 4 بطاقات من lg.
 */
export function AboutLandingTrustBlock() {
  const { title, items } = aboutLandingTrust;

  return (
    <section className={aboutLandingDarkSectionClass} aria-labelledby="about-trust-title">
      <div className={aboutLandingInnerContainerClass}>
        <h2 id="about-trust-title" className={`mb-10 text-center ${aboutLandingDarkHeadingClass}`}>
          {title}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title: itemTitle, description, icon: Icon }) => (
            <li key={itemTitle}>
              <article className={`flex h-full flex-col gap-4 ${aboutLandingDarkCardClass}`}>
                <span className={aboutLandingDarkIconTileClass}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="text-sm font-bold text-white sm:text-base">{itemTitle}</h3>
                <p className={aboutLandingDarkLeadClass}>{description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
