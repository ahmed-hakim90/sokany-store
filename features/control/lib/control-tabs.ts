/**
 * تبويبات لوحة /control (معرف `?tab=`) + مجموعات لعرض التنقّل.
 * يُستورد من واجهة المستخدم ومن تحقق الصلاحيات في الخادم.
 */
export const CONTROL_TAB_ORDER = [
  "general",
  "branding",
  "hero",
  "home",
  "branches",
  "banners",
  "retailers",
  "spotlights",
  "media",
  "preview",
  "notifications",
  "orderForwarding",
  "access",
] as const;

export type ControlPanelTabId = (typeof CONTROL_TAB_ORDER)[number];

export const CONTROL_TABS_EXCLUDING_ACCESS: ControlPanelTabId[] = [
  "general",
  "branding",
  "hero",
  "home",
  "branches",
  "banners",
  "retailers",
  "spotlights",
  "media",
  "preview",
  "notifications",
  "orderForwarding",
];

export type ControlTabGroup = {
  label: string;
  ids: ControlPanelTabId[];
};

export const CONTROL_TAB_GROUPS: ControlTabGroup[] = [
  { label: "المتجر", ids: ["general", "branding"] },
  { label: "الصفحة والمحتوى", ids: ["hero", "home", "branches", "banners", "retailers", "spotlights"] },
  { label: "الوسائط والنشر", ids: ["media", "preview", "notifications", "orderForwarding"] },
  { label: "الإدارة", ids: ["access"] },
];

const TAB_SET: ReadonlySet<ControlPanelTabId> = new Set(CONTROL_TAB_ORDER);

export function isControlPanelTabId(s: string | null | undefined): s is ControlPanelTabId {
  return s != null && s !== "" && TAB_SET.has(s as ControlPanelTabId);
}
