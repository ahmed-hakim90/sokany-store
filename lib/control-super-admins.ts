/**
 * UIDs يرون تبويب «الصلاحيات» و ‎`GET/PUT/DELETE`‎ إدارة ‎`controlPanelAccess`‎.
 */
export function getControlPanelSuperAdminUids(): Set<string> {
  const raw = process.env.CONTROL_PANEL_SUPER_ADMIN_UIDS?.trim();
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

export function isControlPanelSuperAdminUid(uid: string): boolean {
  return getControlPanelSuperAdminUids().has(uid);
}
