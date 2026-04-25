import { Link } from "next-view-transitions";
import { CONTACT_EMAIL, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CheckoutSupportFooterProps = {
  className?: string;
};

export function CheckoutSupportFooter({ className }: CheckoutSupportFooterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-white/70 px-3 py-2.5 text-center text-[12px] text-muted-foreground shadow-[0_2px_12px_-8px_rgba(15,23,42,0.1)]">
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-900"
          aria-hidden
        >
          ✓
        </span>
        <span className="text-brand-900/85">تسوق آمن — بياناتك محمية أثناء إتمام الطلب.</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/60 bg-surface-muted/30 px-3 py-2.5 text-center text-[12px] text-muted-foreground">
        <span className="text-brand-900/85">هل تحتاج مساعدة؟</span>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a className="font-semibold text-brand-800 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          <Link href={ROUTES.SERVICE_CENTERS} className="font-semibold text-brand-800 hover:underline">
            مراكز الخدمة
          </Link>
        </div>
      </div>
    </div>
  );
}
