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

/**
 * UIDs تُسمح لهم **فقط** بتبويب الوسائط (رفع/قائمة/حذف تحت ‎`cms/site-media/…`‎) دون باقي إعدادات CMS.
 */
export function getControlPanelMediaOnlyUids(): Set<string> {
  const raw = process.env.CONTROL_PANEL_MEDIA_ONLY_UIDS?.trim();
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

export type ControlPanelAccess = "full" | "media";

/**
 * ‎`full`‎ لمن في ‎`CONTROL_PANEL_ALLOWED_UIDS`‎ (الأولوية)، وإلا ‎`media`‎ لمن في ‎`CONTROL_PANEL_MEDIA_ONLY_UIDS`‎.
 */
export function getControlAccessForUid(uid: string): ControlPanelAccess | null {
  if (getControlPanelAllowedUids().has(uid)) {
    return "full";
  }
  if (getControlPanelMediaOnlyUids().has(uid)) {
    return "media";
  }
  return null;
}

export function isControlPanelUidAllowed(uid: string): boolean {
  return getControlAccessForUid(uid) !== null;
}
