import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: { href: string; label: string };
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-950 md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm font-normal leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
