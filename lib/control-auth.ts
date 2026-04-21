/**
 * UIDs allowed to use `/control` — comma-separated Firebase Auth UIDs in env.
 */
export function getControlPanelAllowedUids(): Set<string> {
  const raw = process.env.CONTROL_PANEL_ALLOWED_UIDS?.trim();
  if (!raw) {
    return new Set();
  }
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function isControlPanelUidAllowed(uid: string): boolean {
  return getControlPanelAllowedUids().has(uid);
}
