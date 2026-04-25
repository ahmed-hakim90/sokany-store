import { cn } from "@/lib/utils";

export type DesktopShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Widen max width beyond default storefront container */
  wide?: boolean;
};

export function DesktopShell({
  children,
  className,
  wide,
}: DesktopShellProps) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-none px-4 sm:px-6 lg:px-8",
        wide ? "max-w-screen-2xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
