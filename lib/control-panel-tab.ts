import type { ControlSessionPayload } from "@/lib/control-session-types";
import { normalizeLegacyControlTabId } from "@/features/control/lib/control-tabs";

export function hasControlPanelTab(
  session: ControlSessionPayload,
  tab: string,
): boolean {
  const canonical = normalizeLegacyControlTabId(tab) ?? tab;
  if (session.scope === "media") {
    return canonical === "media";
  }
  if (session.tabs === "all") {
    return true;
  }
  const list = session.tabs as string[];
  return list.includes(canonical) || list.includes(tab);
}
