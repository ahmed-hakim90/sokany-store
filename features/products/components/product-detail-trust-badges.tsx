import { cn } from "@/lib/utils";

/** ثلاث إشارات ثقة مضغوطة تحت أزرار الشراء — شحن، دفع عند الاستلام، ضمان. */
export function ProductDetailTrustStrip({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-1.5 sm:gap-2",
        className,
      )}
      aria-label="مزايا الطلب والضمان"
    >
      <li className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border border-border/80 bg-white/90 px-1.5 py-2 text-center shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-brand-900">
          <TruckIcon />
        </span>
        <span className="text-[10px] font-semibold leading-tight text-foreground sm:text-[11px]">
          شحن سريع لجميع المحافظات
        </span>
      </li>
      <li className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border border-border/80 bg-white/90 px-1.5 py-2 text-center shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-brand-900">
          <CashIcon />
        </span>
        <span className="text-[10px] font-semibold leading-tight text-foreground sm:text-[11px]">
          دفع عند الاستلام
        </span>
      </li>
      <li className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border border-border/80 bg-white/90 px-1.5 py-2 text-center shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-brand-900">
          <ShieldIcon />
        </span>
        <span className="text-[10px] font-semibold leading-tight text-foreground sm:text-[11px]">
          ضمان سوكانى أصلي
        </span>
      </li>
    </ul>
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

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 10v4M9.5 12h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
