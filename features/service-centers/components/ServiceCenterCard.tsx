import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import type { ServiceCenter } from "@/features/service-centers/types";

export type ServiceCenterCardProps = {
  center: ServiceCenter;
  className?: string;
};

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

export function ServiceCenterCard({ center, className }: ServiceCenterCardProps) {
  const mapHref = center.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(center.address)}`;
  const summary = center.description ?? center.address;

  return (
    <article
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">{center.city}</p>
        <Link
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`موقع ${center.name} على الخريطة`}
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/80",
            "[&_svg]:h-4 [&_svg]:w-4",
          )}
        >
          <MapPinIcon />
        </Link>
      </div>
      <h3 className="mt-2 font-display text-base font-bold text-brand-950">{center.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>
      <div className="mt-3 border-t border-border/60 pt-3">
        <Link
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-800 hover:underline"
        >
          الاتجاهات
        </Link>
      </div>
    </article>
  );
}
