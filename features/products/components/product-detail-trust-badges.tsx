import { cn } from "@/lib/utils";

export function ProductDetailTrustBadges({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <div className="flex gap-3 rounded-2xl border border-border bg-white/90 px-3.5 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand-900">
          <TruckIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">توصيل سريع</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">خلال 24–48 ساعة داخل القاهرة والجيزة</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-2xl border border-border bg-white/90 px-3.5 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand-900">
          <ShieldIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">ضمان سوكانى</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">ضمان شامل لمدة سنتين على عيوب التصنيع</p>
        </div>
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M14 18V6H4v12h2m8 0h2m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 9h4l3 3v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
