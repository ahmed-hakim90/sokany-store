import {
  warrantyLandingIconTileClass,
  warrantyLandingLeadClass,
  warrantyLandingPanelClass,
  warrantyLandingSectionTitleClass} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingWhyCards } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * لماذا الضمان الرسمي — 5 بطاقات؛ عمودان sm، 3 أعمدة lg.
 */
export function WarrantyLandingWhyGrid() {
  return (
    <section className="space-y-6" aria-labelledby="warranty-why-title">
      <div className="space-y-2 text-center md:text-start">
        <h2 id="warranty-why-title" className={warrantyLandingSectionTitleClass}>
          لماذا تختار الضمان الرسمي من مؤسسة المغربي؟
        </h2>
        <p className={cn("mx-auto max-w-2xl md:mx-0", warrantyLandingLeadClass)}>
          الوكيل الحصري لسوكاني في مصر — ضمان حقيقي، صيانة معتمدة، وقطع غيار أصلية على مستوى الجمهورية.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {warrantyLandingWhyCards.map(({ title, description, icon: Icon }) => (
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
