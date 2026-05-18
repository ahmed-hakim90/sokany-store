import { warrantyLandingLeadClass, warrantyLandingPanelClass, warrantyLandingSectionTitleClass} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingSteps } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * خطوات الضمان — الجوال: خط زمني عمودي RTL؛ lg+: صف أفقي بخط يربط الدوائر.
 */
export function WarrantyLandingSteps() {
  return (
    <section className="space-y-6" aria-labelledby="warranty-steps-title">
      <h2 id="warranty-steps-title" className={warrantyLandingSectionTitleClass}>
        خطوات الضمان والصيانة
      </h2>

      <ol className="relative flex flex-col gap-0 lg:hidden">
        {warrantyLandingSteps.map((item, index) => (
          <li key={item.step} className="relative flex gap-4 pb-8 last:pb-0">
            {index < warrantyLandingSteps.length - 1 ? (
              <span
                className="absolute end-[1.125rem] top-10 bottom-0 w-0.5 bg-brand-500/50"
                aria-hidden
              />
            ) : null}
            <StepBadge step={item.step} />
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-display text-base font-bold text-brand-950">{item.title}</h3>
              <p className={cn("mt-1", warrantyLandingLeadClass)}>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <ol className="hidden lg:grid lg:grid-cols-6 lg:gap-3">
        {warrantyLandingSteps.map((item, index) => (
          <li key={item.step} className="relative flex flex-col items-center text-center">
            {index < warrantyLandingSteps.length - 1 ? (
              <span
                className="pointer-events-none absolute start-[calc(50%+1.25rem)] top-5 h-0.5 w-[calc(100%-2.5rem)] bg-brand-500/45"
                aria-hidden
              />
            ) : null}
            <StepBadge step={item.step} className="mb-3" />
            <article className={cn(warrantyLandingPanelClass, "w-full p-3")}>
              <h3 className="font-display text-sm font-bold text-brand-950">{item.title}</h3>
              <p className={cn("mt-2 text-xs", warrantyLandingLeadClass)}>{item.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepBadge({ step, className }: { step: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-500 font-display text-sm font-black text-brand-950 shadow-sm",
        className,
      )}
    >
      {step}
    </span>
  );
}
