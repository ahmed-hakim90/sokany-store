import { cn } from "@/lib/utils";

export type CheckoutReassuranceNoteProps = {
  className?: string;
};

export function CheckoutReassuranceNote({ className }: CheckoutReassuranceNoteProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-border/70 bg-white/70 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground shadow-[0_2px_12px_-8px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      <span
        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/25 text-[10px] font-bold text-brand-900"
        aria-hidden
      >
        i
      </span>
      <p className="min-w-0 text-[12px] text-brand-900/85">
        بياناتك تُستخدم لمعالجة الطلب فقط. راجع الملخص قبل التأكيد — يمكنك تعديل السلة قبل الإرسال.
      </p>
    </div>
  );
}
