import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardWidgetTone =
  | "brand"
  | "success"
  | "warning"
  | "destructive"
  | "neutral";

const toneSurfaceClasses: Record<DashboardWidgetTone, string> = {
  brand: "border-brand-200/80 bg-brand-50/70 text-brand-950",
  success: "border-success-border/80 bg-success-surface text-success-foreground",
  warning: "border-warning-border/80 bg-warning-surface text-warning-foreground",
  destructive:
    "border-destructive-border/80 bg-destructive-surface text-destructive-foreground",
  neutral: "border-border/80 bg-surface-muted/40 text-foreground",
};

const toneIconShellClasses: Record<DashboardWidgetTone, string> = {
  brand: "bg-brand-500 text-black",
  success: "bg-success text-white",
  warning: "bg-warning text-black",
  destructive: "bg-destructive text-white",
  neutral: "bg-foreground text-background",
};

const toneStatBarClasses: Record<DashboardWidgetTone, string> = {
  brand: "bg-brand-500",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
};

export function StatWidget({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon = Info,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: DashboardWidgetTone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card
      variant="summary"
      className={cn(
        "relative overflow-hidden border p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          toneStatBarClasses[tone],
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-ui-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            toneIconShellClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export function DashboardActionTile({
  title,
  description,
  cta,
  icon: Icon = Info,
  tone = "neutral",
  className,
}: {
  title: string;
  description: string;
  cta: React.ReactNode;
  icon?: LucideIcon;
  tone?: DashboardWidgetTone;
  className?: string;
}) {
  return (
    <Card
      variant="summary"
      className={cn(
        "border p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]",
        tone !== "neutral" && toneSurfaceClasses[tone],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            toneIconShellClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-3">{cta}</div>
        </div>
      </div>
    </Card>
  );
}

export { toneSurfaceClasses, toneIconShellClasses };
