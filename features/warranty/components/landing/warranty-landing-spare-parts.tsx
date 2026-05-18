import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import {
  warrantyLandingBodyClass,
  warrantyLandingIconTileClass,
  warrantyLandingLeadClass,
  warrantyLandingOutlineCtaClass,
  warrantyLandingPanelClass,
  warrantyLandingSectionTitleClass,
} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingSpareParts } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * قطع الغيار — نص + شارات + شبكة دائرية للفئات؛ تمرير أفقي على الجوال.
 */
export function WarrantyLandingSpareParts() {
  const { title, paragraphs, pillars, categories, cta } = warrantyLandingSpareParts;

  return (
    <section className="space-y-6" aria-labelledby="warranty-parts-title">
      <div className="space-y-4">
        <h2 id="warranty-parts-title" className={warrantyLandingSectionTitleClass}>
          {title}
        </h2>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 20)} className={cn("max-w-3xl", warrantyLandingBodyClass)}>
            {p}
          </p>
        ))}
        <ul className="flex flex-wrap gap-2">
          {pillars.map((pillar) => (
            <li
              key={pillar}
              className="rounded-full border border-brand-700/40 bg-brand-100/80 px-3 py-1 text-xs font-semibold text-brand-950 sm:text-sm"
            >
              {pillar}
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {categories.map(({ title: catTitle, icon: Icon, imageSrc }) => (
          <li key={catTitle} className="w-[9.5rem] shrink-0 sm:w-auto">
            <article className={cn(warrantyLandingPanelClass, "flex flex-col items-center gap-3 p-4 text-center")}>
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-brand-500/50">
                <AppImage src={imageSrc} alt={catTitle} fill sizes="80px" className="object-cover" />
              </div>
              <span className={cn(warrantyLandingIconTileClass, "h-8 w-8")}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="font-display text-sm font-bold text-brand-950">{catTitle}</h3>
            </article>
          </li>
        ))}
      </ul>

      <div className="flex justify-center sm:justify-start">
        <Link href={cta.href} className={warrantyLandingOutlineCtaClass}>
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
