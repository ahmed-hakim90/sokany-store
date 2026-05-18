import {
  warrantyLandingIconTileClass,
  warrantyLandingLeadClass,
  warrantyLandingPanelClass,
  warrantyLandingSectionTitleClass} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingCoverage } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * تغطية الضمان — 4 بطاقات بأيقونات؛ عمودان على الجوال، 4 أعمدة من lg.
 */
export function WarrantyLandingCoverage() {
  return (
    <section className="space-y-6" aria-labelledby="warranty-coverage-title">
      <h2 id="warranty-coverage-title" className={warrantyLandingSectionTitleClass}>
        ماذا يشمل ضمان سوكاني؟
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {warrantyLandingCoverage.map(({ title, description, icon: Icon }) => (
          <li key={title}>
            <article className={cn(warrantyLandingPanelClass, "flex h-full flex-col gap-3 p-4 sm:p-5")}>
              <span className={cn(warrantyLandingIconTileClass, "h-11 w-11")}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-base font-bold text-brand-950">{title}</h3>
              <p className={warrantyLandingLeadClass}>{description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
