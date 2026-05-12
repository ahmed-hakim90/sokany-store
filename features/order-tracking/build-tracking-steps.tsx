import type { ReactNode } from "react";
import { Box, CheckCircle, Clock, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "completed" | "current" | "pending";

const STEP_DEF = [
  { label: "تم استلام الطلب", Icon: Box },
  { label: "جاري التجهيز", Icon: Clock },
  { label: "تم الشحن", Icon: Package },
  { label: "في الطريق", Icon: Truck },
  { label: "تم التوصيل", Icon: CheckCircle },
] as const;

export type TrackingStepRow = {
  label: string;
  date: string;
  status: StepStatus;
  icon: ReactNode;
};

export function buildTrackingSteps(params: {
  activeIndex: number;
  allCompleted: boolean;
  baseTimeMs: number;
}): TrackingStepRow[] {
  const { activeIndex, allCompleted, baseTimeMs } = params;
  const now = baseTimeMs;

  return STEP_DEF.map((def, i) => {
    let status: StepStatus;
    if (allCompleted) {
      status = "completed";
    } else if (i < activeIndex) {
      status = "completed";
    } else if (i === activeIndex) {
      status = "current";
    } else {
      status = "pending";
    }

    let dateStr: string;
    if (allCompleted) {
      const d = new Date(now - (STEP_DEF.length - 1 - i) * 5 * 36e5);
      dateStr = d.toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (status === "completed") {
      const d = new Date(now - (activeIndex - i) * 86_400_000);
      dateStr = d.toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (status === "current") {
      dateStr = new Date(now).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      dateStr = "متوقع اليوم";
    }

    const Icon = def.Icon;
    return {
      label: def.label,
      date: dateStr,
      status,
      icon: <Icon className="h-5 w-5 shrink-0" aria-hidden />,
    };
  });
}

export function HorizontalTrackingTimeline({
  steps,
  activeIndex,
  allCompleted,
}: {
  steps: TrackingStepRow[];
  activeIndex: number;
  allCompleted: boolean;
}) {
  return (
    <ol className="grid grid-cols-5 items-start gap-1 sm:gap-2" aria-label="مراحل تتبع الطلب">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const segmentDone = allCompleted || index < activeIndex;
        return (
          <li key={step.label} className="relative flex min-w-0 flex-col items-center text-center">
            {!isLast ? (
              <span
                className={cn(
                  "absolute start-1/2 top-5 h-0.5 w-full",
                  segmentDone ? "bg-emerald-500" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors",
                step.status === "completed" &&
                  "border-emerald-500 bg-emerald-500 text-white shadow-sm",
                step.status === "current" &&
                  "border-emerald-600 bg-white text-emerald-700 shadow-[0_8px_24px_-14px_rgba(16,185,129,0.65)]",
                step.status === "pending" &&
                  "border-border bg-surface-muted text-muted-foreground/55",
              )}
            >
              {step.icon}
            </span>
            <span
              className={cn(
                "mt-2 line-clamp-2 text-[10px] font-bold leading-4 sm:text-xs",
                step.status === "pending" ? "text-muted-foreground/60" : "text-brand-950",
              )}
            >
              {step.label}
            </span>
            <span className="mt-0.5 hidden text-[10px] leading-4 text-muted-foreground sm:block">
              {step.date}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
