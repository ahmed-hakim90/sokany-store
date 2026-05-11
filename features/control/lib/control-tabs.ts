/**
 * تبويبات لوحة /control (معرف `?tab=`) + مجموعات لعرض التنقّل.
 * يُستورد من واجهة المستخدم ومن تحقق الصلاحيات في الخادم.
 *
 * تبويبات أُزيلت من الواجهة لكن ما زالت تُعاد توجيهها: `banners`→`home`، `wooApi`/`orderForwarding`→`health`.
 */
export const CONTROL_TAB_ORDER = [
  "general",
  "branding",
  "inventory",
  "product3d",
  "hero",
  "home",
  "branches",
  "retailers",
  "media",
  "preview",
  "notifications",
  "health",
  "access",
] as const;

export type ControlPanelTabId = (typeof CONTROL_TAB_ORDER)[number];

/** معرفات قديمة في روابط أو وثائق صلاحيات — تُحوَّل للمعرّف الحالي. */
export const LEGACY_CONTROL_TAB_ALIASES: Record<string, ControlPanelTabId> = {
  banners: "home",
  spotlights: "home",
  wooApi: "health",
  orderForwarding: "health",
};

export const CONTROL_TABS_EXCLUDING_ACCESS: ControlPanelTabId[] = [
  "general",
  "branding",
  "inventory",
  "product3d",
  "hero",
  "home",
  "branches",
  "retailers",
  "media",
  "preview",
  "notifications",
  "health",
];

export type ControlTabGroup = {
  label: string;
  ids: ControlPanelTabId[];
};

export const CONTROL_TAB_GROUPS: ControlTabGroup[] = [
  { label: "تشغيل سريع", ids: ["general"] },
  { label: "محتوى الموقع", ids: ["home", "branches", "media"] },
  { label: "المنتجات", ids: ["inventory"] },
  { label: "الربط والصحة", ids: ["health"] },
  { label: "الإدارة والحماية", ids: ["notifications", "access"] },
];

const TAB_SET: ReadonlySet<ControlPanelTabId> = new Set(CONTROL_TAB_ORDER);

export function isControlPanelTabId(s: string | null | undefined): s is ControlPanelTabId {
  return s != null && s !== "" && TAB_SET.has(s as ControlPanelTabId);
}

/** يحوّل معرّف قديم أو حالي إلى معرّف تبويب صالح، أو null. */
export function normalizeLegacyControlTabId(tab: string | null | undefined): ControlPanelTabId | null {
  if (tab == null || tab === "") return null;
  const mapped = LEGACY_CONTROL_TAB_ALIASES[tab] ?? tab;
  return isControlPanelTabId(mapped) ? mapped : null;
}

/** تطبيع قائمة تبويبات (جلسة، Firestore) مع إزالة التكرار. */
export function normalizeControlSessionTabList(tabs: string[]): ControlPanelTabId[] {
  const out = new Set<ControlPanelTabId>();
  for (const x of tabs) {
    const n = normalizeLegacyControlTabId(x);
    if (n && n !== "access") out.add(n);
  }
  return [...out];
}
