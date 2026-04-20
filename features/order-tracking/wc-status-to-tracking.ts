export type WcTrackingTerminal = "cancelled" | "refunded" | "failed";

export type WcTrackingResult = {
  currentStepIndex: number;
  allCompleted: boolean;
  terminal: WcTrackingTerminal | null;
  statusBadge: string;
};

/**
 * يحوّل حالة WooCommerce القياسية (وما يشابهها من حالات مخصصة) إلى مرحلة في شريط التتبع (0–3).
 * حالات الشحن التفصيلية تتطلب غالباً حالات مخصصة في لوحة التحكم.
 */
export function wcStatusToTracking(wcStatus: string): WcTrackingResult {
  const s = wcStatus.trim().toLowerCase();

  if (s === "completed") {
    return {
      currentStepIndex: 3,
      allCompleted: true,
      terminal: null,
      statusBadge: "تم التوصيل",
    };
  }
  if (s === "cancelled") {
    return {
      currentStepIndex: 0,
      allCompleted: false,
      terminal: "cancelled",
      statusBadge: "ملغى",
    };
  }
  if (s === "refunded") {
    return {
      currentStepIndex: 0,
      allCompleted: false,
      terminal: "refunded",
      statusBadge: "مسترد",
    };
  }
  if (s === "failed") {
    return {
      currentStepIndex: 0,
      allCompleted: false,
      terminal: "failed",
      statusBadge: "فشل الدفع",
    };
  }
  if (s === "pending") {
    return {
      currentStepIndex: 0,
      allCompleted: false,
      terminal: null,
      statusBadge: "تم الاستلام",
    };
  }
  if (s === "processing" || s === "on-hold") {
    return {
      currentStepIndex: 1,
      allCompleted: false,
      terminal: null,
      statusBadge: s === "on-hold" ? "معلّق" : "قيد التجهيز",
    };
  }

  if (
    s.includes("ship") ||
    s.includes("carrier") ||
    s.includes("fulfil") ||
    s.includes("fulfill")
  ) {
    return {
      currentStepIndex: 2,
      allCompleted: false,
      terminal: null,
      statusBadge: "جاري الشحن",
    };
  }
  if (
    s.includes("deliver") ||
    s.includes("transit") ||
    s.includes("out-for") ||
    s.includes("driver")
  ) {
    return {
      currentStepIndex: 3,
      allCompleted: false,
      terminal: null,
      statusBadge: "قيد التوصيل",
    };
  }

  return {
    currentStepIndex: 1,
    allCompleted: false,
    terminal: null,
    statusBadge: "قيد المعالجة",
  };
}
