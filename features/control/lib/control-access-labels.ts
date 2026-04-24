import { CONTROL_TABS_EXCLUDING_ACCESS, type ControlPanelTabId } from "@/features/control/lib/control-tabs";
import type { ControlPanelAccessDoc } from "@/schemas/control-panel-access";

/** تسمية عربية لمعرف تبويب اللوحة (لعرض الصلاحيات). */
export const CONTROL_TAB_LABEL_AR: Partial<Record<ControlPanelTabId, string>> = {
  general: "عام",
  branding: "هوية الموقع",
  hero: "الهيرو",
  branches: "الفروع",
  banners: "بانرات الأقسام",
  retailers: "الموزعون",
  spotlights: "إعلانات مميزة",
  media: "الوسائط",
  preview: "معاينة",
  notifications: "إشعارات",
  access: "الصلاحيات (مشرف)",
};

export function formatControlAccessSummary(doc: ControlPanelAccessDoc): {
  typeLine: string;
  detailLine: string;
} {
  if (doc.mode === "media") {
    const mf = doc.mediaSubfolders;
    const m =
      mf == null
        ? "كل مجلدات ‎`cms/site-media/‎`"
        : mf.length === 0
          ? "— (لا مجلدات) —"
          : mf.join("، ");
    return {
      typeLine: "وسائط فقط",
      detailLine: m,
    };
  }
  const t = doc.tabIds;
  const tabLine =
    t == null
      ? "كل تبويبات إعدادات المحتوى (غير مُفلترة)"
      : t.length === 0
        ? "لا تبويبات (استثنائي — قد تُقيّد الاستعمال)"
        : t
            .map((id) => CONTROL_TAB_LABEL_AR[id as ControlPanelTabId] ?? id)
            .join("، ");
  const mf = doc.mediaSubfolders;
  const mfLine =
    mf == null
      ? "الوسائط: كل المجلدات (ضمن تبويب الوسائط)"
      : mf.length === 0
        ? "الوسائط: لا مجلدات (استثنائي)"
        : `الوسائط: ${mf.join("، ")} فقط`;
  return {
    typeLine: "لوحة كاملة (مُقيّدة)",
    detailLine: `${tabLine} | ${mfLine}`,
  };
}

export function allTabsDefaultSet(): Set<ControlPanelTabId> {
  return new Set(CONTROL_TABS_EXCLUDING_ACCESS);
}
