import { cn } from "@/lib/utils";

export type CheckoutSectionChipProps = {
  children: React.ReactNode;
  className?: string;
};

export function CheckoutSectionChip({ children, className }: CheckoutSectionChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold leading-none text-brand-900",
        className,
      )}
    >
      {children}
    </span>
  );
}
