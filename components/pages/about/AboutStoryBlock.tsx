import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AboutStoryBlockProps = {
  title: string;
  paragraphs: readonly string[];
  /** Optional hero-style image beside copy on large screens. */
  mediaSrc?: string;
  mediaAlt?: string;
  className?: string;
};

/*
 * قصة/نص طويل في بطاقة: على الجوال عمود واحد (نص فوق صورة إن وُجدت).
 * من lg مع وجود media: شبكة عمودين — النص في أحد الجانبين والصورة في الآخر بارتفاع أدنى للصورة.
 */
export function AboutStoryBlock({
  title,
  paragraphs,
  mediaSrc,
  mediaAlt = "",
  className,
}: AboutStoryBlockProps) {
  const media = mediaSrc ? (
    <div className="relative aspect-[16/11] min-w-0 max-w-none overflow-hidden rounded-xl border border-border bg-image-well lg:aspect-auto lg:min-h-[280px]">
      <AppImage
        src={mediaSrc}
        alt={mediaAlt}
        fill
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="object-cover"
      />
    </div>
  ) : null;

  return (
    <Card variant="feature" className={cn(className)}>
      <div className={cn("grid gap-8", media ? "lg:grid-cols-2 lg:items-center" : "")}>
        <div>
          <h2 className="font-display text-xl font-semibold text-brand-950 md:text-2xl">
            {title}
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        {media}
      </div>
    </Card>
  );
}
