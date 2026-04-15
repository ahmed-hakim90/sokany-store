import { cn } from "@/lib/utils";

export type CheckoutFooterMetaProps = {
  className?: string;
};

export function CheckoutFooterMeta({ className }: CheckoutFooterMetaProps) {
  return (
    <p
      className={cn(
        "text-center text-[11px] leading-relaxed text-muted-foreground/90",
        className,
      )}
    >
      © {new Date().getFullYear()} — تجربة شراء آمنة. قد تختلف الأسعار حسب العروض.
    </p>
  );
}
