import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";
import type { ServiceCenter } from "@/features/service-centers/types";

const btnPrimary =
  "inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-bold text-black shadow-sm transition-colors hover:bg-brand-400";

const btnSecondary =
  "inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/80";

export type FeaturedServiceCenterCardProps = {
  center: ServiceCenter;
  className?: string;
};

export function FeaturedServiceCenterCard({ center, className }: FeaturedServiceCenterCardProps) {
  const imageSrc = center.imageSrc ?? "/images/placeholder.png";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.1)]",
        className,
      )}
    >
      <div className="space-y-4 p-5 sm:p-6">
        <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-900">
          فرع مميز
        </span>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold leading-snug text-brand-950 sm:text-2xl">
            {center.name}
          </h2>
          {center.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{center.description}</p>
          ) : null}
        </div>
        <div className="flex gap-2 pt-1">
          {center.mapUrl ? (
            <Link
              href={center.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={btnPrimary}
            >
              الاتجاهات
            </Link>
          ) : null}
          <Link
            href={`tel:${center.phone.replace(/\s/g, "")}`}
            className={cn(btnSecondary, !center.mapUrl && "flex-1")}
          >
            اتصال
          </Link>
        </div>
      </div>
      <div className="relative aspect-[16/10]  bg-image-well">
        <AppImage
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover"
        />
      </div>
    </article>
  );
}
