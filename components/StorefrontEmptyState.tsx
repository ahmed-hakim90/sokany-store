import { surfaceEmptyStateClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

/**
 * حالة فارغة موحّدة للمتجر — نفس غلاف checkout/search الجديد.
 */
export function StorefrontEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(surfaceEmptyStateClass, className)}>
      <h3 className="font-display text-lg font-semibold text-brand-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
