import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CheckoutLegalNoteProps = {
  className?: string;
};

export function CheckoutLegalNote({ className }: CheckoutLegalNoteProps) {
  return (
    <Card
      variant="surface"
      className={cn(
        "rounded-2xl border-border/70 bg-white/80 p-4 text-center shadow-[0_6px_22px_-14px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        بمتابعة الطلب فإنك توافق على الشروط وسياسة الخصوصية المعمول بها في المتجر. الدفع بالبطاقة وضع تجريبي ولا
        يتم خصم أي مبلغ.
      </p>
    </Card>
  );
}
