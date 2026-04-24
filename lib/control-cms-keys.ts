import type { ControlPanelTabId } from "@/features/control/lib/control-tabs";

const CMS_KEY_TO_TABS: Record<string, ControlPanelTabId[]> = {
  site_config: ["general", "branding"],
  home_hero: ["hero"],
  section_banners: ["banners"],
  branches: ["branches"],
  retailers: ["retailers"],
  spotlights: ["spotlights"],
} as const;

export type CmsDocumentPutKey = keyof typeof CMS_KEY_TO_TABS;

const PUT_KEYS = Object.keys(CMS_KEY_TO_TABS) as CmsDocumentPutKey[];
const KEY_SET = new Set(PUT_KEYS);

export function parseCmsDocumentPutKey(k: string): CmsDocumentPutKey | null {
  if (!KEY_SET.has(k as CmsDocumentPutKey)) return null;
  return k as CmsDocumentPutKey;
}

export function cmsPutKeyAllowedForTabIds(
  key: CmsDocumentPutKey,
  tabs: "all" | string[],
): boolean {
  if (tabs === "all") return true;
  const need = CMS_KEY_TO_TABS[key];
  return need.some((t) => tabs.includes(t));
}

/**
 * ‎`full` + تبويبات: يُسمح بـ ‎`seed`‎ عندما يتضمّن أحدهما ‎`branches`‎ أو ‎`retailers`‎.
 */
export function canRunSeed(tabs: "all" | string[]): boolean {
  if (tabs === "all") return true;
  return tabs.includes("branches") || tabs.includes("retailers");
}

export { PUT_KEYS as CMS_DOCUMENT_PUT_KEYS };
