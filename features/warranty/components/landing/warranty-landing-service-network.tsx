import { Link } from "next-view-transitions";
import { MapPin } from "lucide-react";
import {
  warrantyLandingLeadClass,
  warrantyLandingOutlineCtaClass,
  warrantyLandingOverlayCtaClass,
  warrantyLandingPanelClass,
  warrantyLandingSectionTitleClass} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingServiceNetwork } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * شبكة مراكز الخدمة — خريطة مصر + بطاقات مناطق؛ عمودان من lg.
 */
export function WarrantyLandingServiceNetwork() {
  const { title, subtitle, mapCaption, mapCta, regions } = warrantyLandingServiceNetwork;

  return (
    <section className="space-y-6" aria-labelledby="warranty-service-title">
      <div className="space-y-2">
        <h2 id="warranty-service-title" className={warrantyLandingSectionTitleClass}>
          {title}
        </h2>
        <p className={cn("max-w-2xl", warrantyLandingLeadClass)}>{subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div
          className={cn(
            warrantyLandingPanelClass,
            "relative min-h-[280px] overflow-hidden bg-gradient-to-br from-brand-50/80 via-white to-brand-100/40 p-6 sm:min-h-[320px]",
          )}
        >
          <EgyptMapIllustration />
          <div className="absolute bottom-5 start-5 end-5 max-w-sm rounded-xl bg-brand-950/92 p-4 text-white shadow-lg backdrop-blur-sm sm:bottom-6 sm:start-6">
            <p className="text-sm font-semibold leading-snug">{mapCaption}</p>
            <Link href={mapCta.href} className={warrantyLandingOverlayCtaClass}>
              {mapCta.label}
            </Link>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {regions.map(({ title: regionTitle, stat, description }) => (
            <li key={regionTitle}>
              <article className={cn(warrantyLandingPanelClass, "flex h-full flex-col gap-1 p-4 sm:p-5")}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-brand-950">{regionTitle}</h3>
                  <span className="font-display text-xl font-black text-brand-900">{stat}</span>
                </div>
                <p className={warrantyLandingLeadClass}>{description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <Link href={mapCta.href} className={warrantyLandingOutlineCtaClass}>
          {mapCta.label}
        </Link>
      </div>
    </section>
  );
}

function EgyptMapIllustration() {
  const pins = [
    { top: "18%", left: "42%" },
    { top: "32%", left: "38%" },
    { top: "48%", left: "55%" },
    { top: "62%", left: "35%" },
    { top: "72%", left: "58%" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90" aria-hidden>
      <svg
        viewBox="0 0 200 280"
        className="h-[85%] w-auto max-w-[min(100%,220px)] text-brand-600/40"
        fill="currentColor"
      >
        <path d="M98 12c28 8 42 34 38 58-2 14-12 26-10 42 4 28 32 48 28 78-4 34-38 58-56 82-8 12-18 6-24-4-10-18-6-44-18-62-14-22-42-28-48-52-6-26 14-48 36-58 12-6 22-14 34-18 8-4 18-6 20-6z" />
      </svg>
      {pins.map((pin, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-full text-brand-500 drop-shadow-sm"
          style={{ top: pin.top, left: pin.left }}
        >
          <MapPin className="h-6 w-6 fill-brand-500 stroke-brand-950" strokeWidth={1.2} />
        </span>
      ))}
    </div>
  );
}
