import {
  aboutLandingDarkCardClass,
  aboutLandingDarkHeadingClass,
  aboutLandingDarkIconTileClass,
  aboutLandingDarkLeadClass,
  aboutLandingDarkSectionClass,
  aboutLandingInnerContainerClass,
} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingWhyCards } from "@/features/about/content/about-landing-content";

/*
 * لماذا مؤسسة المغربي — قسم داكن zinc-950؛ شبكة 3×2 من lg.
 */
export function AboutLandingWhyGrid() {
  return (
    <section className={aboutLandingDarkSectionClass} aria-labelledby="about-why-title">
      <div className={aboutLandingInnerContainerClass}>
        <div className="mb-12 text-center">
          <h2 id="about-why-title" className={aboutLandingDarkHeadingClass}>
            لماذا تختار مؤسسة المغربي؟
          </h2>
          <p className={`mt-3 mx-auto max-w-xl ${aboutLandingDarkLeadClass}`}>
            الوكيل الحصري لسوكاني في مصر — ضمان، صيانة، وتوزيع يغطي احتياجك من الشراء حتى ما بعد البيع.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutLandingWhyCards.map(({ title, description, icon: Icon }) => (
            <li key={title}>
              <article className={`flex h-full flex-col gap-4 ${aboutLandingDarkCardClass}`}>
                <span className={aboutLandingDarkIconTileClass}>
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className={aboutLandingDarkLeadClass}>{description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
