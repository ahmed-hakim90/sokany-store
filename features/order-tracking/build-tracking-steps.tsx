import type { ReactNode } from "react";
import { Box, CheckCircle, Clock, Truck } from "lucide-react";

export type StepStatus = "completed" | "current" | "pending";

const STEP_DEF = [
  { label: "تم استلام الطلب", Icon: Box },
  { label: "جاري التجهيز", Icon: Clock },
  { label: "تم التسليم لشركة الشحن", Icon: Truck },
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
