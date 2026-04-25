import { cn } from "@/lib/utils";

/** Block placeholder for loading states (pulse); pair with TanStack Query `isPending` / `isFetching`. */
export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-muted/90", className)}
      {...props}
    />
  );
}
