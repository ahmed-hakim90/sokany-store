import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type AboutStoryboardFrame = {
  imageSrc: string;
  imageAlt: string;
  caption: string;
};

export type AboutStoryboardSectionProps = {
  title: string;
  intro?: string;
  frames: readonly AboutStoryboardFrame[];
  className?: string;
};

/**
 * شريط «ستوري بورد»: على الجوال تمرير أفقي مع snap؛ من md شبكة ثابتة.
 */
export function AboutStoryboardSection({ title, intro, frames, className }: AboutStoryboardSectionProps) {
  if (frames.length === 0) return null;

  return (
    <section className={cn("space-y-6 sm:space-y-8", className)} aria-labelledby="about-storyboard-heading">
      <header className="max-w-prose space-y-3">
        <h2
          id="about-storyboard-heading"
          className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl"
        >
          {title}
        </h2>
        {intro ? (
          <p className="text-pretty text-sm leading-[1.85] text-muted-foreground sm:text-[15px]">{intro}</p>
        ) : null}
      </header>

      <div
        className={cn(
          "-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin] md:mx-0 md:grid md:snap-none md:overflow-visible md:pb-0",
          frames.length >= 4
            ? "md:grid-cols-2 lg:grid-cols-4"
            : frames.length === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2",
        )}
      >
        {frames.map((frame, i) => (
          <figure
            key={`${frame.imageSrc}-${i}`}
            className="relative w-[min(100%,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_16px_-6px_rgba(15,23,42,0.08)] sm:w-[min(100%,320px)] md:w-auto md:shrink-none"
          >
            <div className="relative aspect-[4/3] w-full">
              <AppImage src={frame.imageSrc} alt={frame.imageAlt} fill sizes="(max-width:768px) 85vw, 25vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-pretty text-sm font-bold leading-snug text-white drop-shadow-sm sm:text-[15px]">
                {frame.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
