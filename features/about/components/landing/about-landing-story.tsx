import { BadgeCheck } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import {
  aboutLandingBodyClass,
  aboutLandingInnerContainerClass,
  aboutLandingLightSectionClass,
  aboutLandingMediaFrameClass,
  aboutLandingSectionTitleClass,
} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingStory } from "@/features/about/content/about-landing-content";

/*
 * قصة سوكاني + المغربي — قسم فاتح bg-white؛ عمودان من md.
 */
export function AboutLandingStory() {
  const { title, paragraphs, imageSrc, imageAlt, badges } = aboutLandingStory;

  return (
    <section className={aboutLandingLightSectionClass} aria-labelledby="about-story-title">
      <div className={`${aboutLandingInnerContainerClass} grid gap-8 md:grid-cols-2 md:items-center md:gap-10`}>
      <div className="space-y-5">
        <h2 id="about-story-title" className={aboutLandingSectionTitleClass}>
          {title}
        </h2>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className={aboutLandingBodyClass}>
            {p}
          </p>
        ))}
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {badges.map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-2 rounded-full border border-brand-800/25 bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-950 sm:text-sm"
            >
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-900" aria-hidden />
              {badge}
            </li>
          ))}
        </ul>
      </div>
      <div
        className={`relative aspect-[4/3] sm:aspect-[5/4] ${aboutLandingMediaFrameClass}`}
      >
        <AppImage
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
        />
      </div>
      </div>
    </section>
  );
}
