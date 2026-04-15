import type { ReactNode } from "react";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AboutStoryBlockProps = {
  title: string;
  paragraphs: string[];
  /** Optional image or custom block shown beside or below copy. */
  media?: ReactNode;
  /** When set without `media`, renders a hero image from this URL. */
  mediaSrc?: string;
  mediaAlt?: string;
  className?: string;
};

export function AboutStoryBlock({
  title,
  paragraphs,
  media,
  mediaSrc,
  mediaAlt = "",
  className,
}: AboutStoryBlockProps) {
  const resolvedMedia =
    media ??
    (mediaSrc ? (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-image-well">
        <AppImage src={mediaSrc} alt={mediaAlt} fill sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    ) : null);

  return (
    <Card variant="feature" className={cn(className)}>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold text-brand-950 sm:text-3xl">
            {title}
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        {resolvedMedia ? <div className="min-w-0">{resolvedMedia}</div> : null}
      </div>
    </Card>
  );
}
