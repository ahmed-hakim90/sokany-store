import {
  CONTROL_TABS_EXCLUDING_ACCESS,
  normalizeLegacyControlTabId,
  type ControlPanelTabId,
} from "@/features/control/lib/control-tabs";
import type { ControlPanelAccessDoc } from "@/schemas/control-panel-access";

/** تسمية عربية لمعرف تبويب اللوحة (لعرض الصلاحيات). */
export const CONTROL_TAB_LABEL_AR: Partial<Record<ControlPanelTabId, string>> = {
  general: "إعدادات عامة",
  branding: "محتوى الواجهة",
  inventory: "المنتجات والمخزون و3D",
  product3d: "المنتجات والمخزون و3D",
  hero: "محتوى الواجهة",
  home: "محتوى الواجهة",
  branches: "الفروع والموزعين",
  retailers: "الفروع والموزعين",
  media: "الوسائط",
  preview: "معاينة الموقع",
  notifications: "إرسال إشعار للعملاء",
  health: "Woo والطلبات وصحة الربط",
  access: "الصلاحيات",
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
      ? "كل أقسام لوحة التحكم"
      : t.length === 0
        ? "الحساب ده لسه ملوش أقسام مسموحة"
        : [
            ...new Set(
              t.map((id) => {
                const n = normalizeLegacyControlTabId(id);
                if (n) return CONTROL_TAB_LABEL_AR[n] ?? n;
                return CONTROL_TAB_LABEL_AR[id as ControlPanelTabId] ?? id;
              }),
            ),
          ].join("، ");
  const mf = doc.mediaSubfolders;
  const mfLine =
    mf == null
      ? "الوسائط: كل المجلدات"
      : mf.length === 0
        ? "الوسائط: مفيش مجلدات مسموحة"
        : `الوسائط: ${mf.join("، ")} فقط`;
  return {
    typeLine: "لوحة تحكم حسب الصلاحيات",
    detailLine: `${tabLine} | ${mfLine}`,
  };
}

export function allTabsDefaultSet(): Set<ControlPanelTabId> {
  return new Set(CONTROL_TABS_EXCLUDING_ACCESS);
}
