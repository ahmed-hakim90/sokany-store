import { AppImage } from "@/components/AppImage";
import {
  aboutLandingBodyClass,
  aboutLandingMediaFrameClass,
  aboutLandingSectionTitleClass, aboutLandingSectionStackClass} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingWhoWeAre } from "@/features/about/content/about-landing-content";
import { cn } from "@/lib/utils";

/*
 * من هي مؤسسة المغربي — عمودان على md؛ شريط زمني أفقي scroll على الجوال.
 */
export function AboutLandingWhoWeAre() {
  const { title, paragraphs, imageSrc, imageAlt, timeline } = aboutLandingWhoWeAre;

  return (
    <section className={aboutLandingSectionStackClass} aria-labelledby="about-who-title">
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-10">
        <div
          className={cn(
            aboutLandingMediaFrameClass,
            "relative aspect-[4/3] bg-white sm:aspect-[5/4]",
          )}
        >
          <AppImage
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h2
            id="about-who-title"
            className={aboutLandingSectionTitleClass}
          >
            {title}
          </h2>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className={aboutLandingBodyClass}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <ol className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {timeline.map(({ label, icon: Icon }, index) => (
          <li
            key={label}
            className={cn(
              "flex min-w-[7.5rem] shrink-0 flex-col items-center gap-2 text-center sm:min-w-0",
              index < timeline.length - 1 &&
                "sm:relative sm:after:absolute sm:after:top-5 sm:after:start-[calc(50%+1.25rem)] sm:after:h-px sm:after:w-[calc(100%-2.5rem)] sm:after:bg-brand-600/55",
            )}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-700/35 bg-brand-500 text-brand-950 shadow-[0_8px_20px_-10px_rgba(218,255,0,0.9)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-xs font-bold text-brand-950 sm:text-sm">{label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
