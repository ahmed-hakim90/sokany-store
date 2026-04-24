import type { ControlSessionPayload } from "@/lib/control-session-types";

export function hasControlPanelTab(
  session: ControlSessionPayload,
  tab: string,
): boolean {
  if (session.scope === "media") {
    return tab === "media";
  }
  if (session.tabs === "all") {
    return true;
  }
  return (session.tabs as string[]).includes(tab);
}
