import {
  aboutLandingIconTileClass,
  aboutLandingLeadClass,
  aboutLandingPanelClass,
  aboutLandingSectionTitleClass} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingWhyCards } from "@/features/about/content/about-landing-content";
import { cn } from "@/lib/utils";

/*
 * لماذا مؤسسة المغربي — شبكة 3×2 من md؛ عمودان على الجوال.
 */
export function AboutLandingWhyGrid() {
  return (
    <section className="space-y-6" aria-labelledby="about-why-title">
      <div className="space-y-2 text-center md:text-start">
        <h2 id="about-why-title" className={aboutLandingSectionTitleClass}>
          لماذا تختار مؤسسة المغربي؟
        </h2>
        <p className={cn("mx-auto max-w-2xl md:mx-0", aboutLandingLeadClass)}>
          الوكيل الحصري لسوكاني في مصر — ضمان، صيانة، وتوزيع يغطي احتياجك من الشراء حتى ما بعد البيع.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {aboutLandingWhyCards.map(({ title, description, icon: Icon }) => (
          <li key={title}>
            <article className={cn(aboutLandingPanelClass, "flex h-full flex-col gap-3 p-4 sm:p-5")}>
              <span className={cn(aboutLandingIconTileClass, "h-11 w-11")}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-base font-bold text-brand-950">{title}</h3>
              <p className={aboutLandingLeadClass}>{description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
