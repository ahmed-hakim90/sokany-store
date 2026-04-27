import "server-only";

import { isControlPanelTabId } from "@/features/control/lib/control-tabs";
import { CONTROL_PANEL_ACCESS_COLLECTION } from "@/features/control/lib/collections";
import { controlPanelAccessDocSchema, type ControlPanelAccessDoc } from "@/schemas/control-panel-access";
import { getControlAccessForUid, type ControlPanelAccess } from "@/lib/control-auth";
import { getControlPanelSuperAdminUids } from "@/lib/control-super-admins";
import type { ControlSessionPayload } from "@/lib/control-session-types";
import { getAdminFirestore } from "@/lib/firebase-admin";

/**
 * ‎`tabIds` المخزّن في Firestore — يحذر ‎`access`‎.
 */
function sanitizeStoredTabIds(raw: string[] | null | undefined): "all" | string[] {
  if (raw == null) return "all";
  if (raw.length === 0) return [];
  const out = new Set<string>();
  for (const x of raw) {
    if (isControlPanelTabId(x) && x !== "access") {
      out.add(x);
    }
  }
  return out.size === 0 ? [] : [...out];
}

function docToPayload(
  uid: string,
  doc: ControlPanelAccessDoc,
  isSuper: boolean,
): ControlSessionPayload {
  const { mode, tabIds, mediaSubfolders } = doc;
  const tabs: "all" | string[] =
    mode === "media" ? ["media"] : (sanitizeStoredTabIds(tabIds ?? null) as "all" | string[]);
  const mf: "all" | string[] =
    mediaSubfolders == null ? "all" : mediaSubfolders.length === 0 ? [] : mediaSubfolders;
  return { uid, scope: mode, tabs, mediaFolders: mf, superAdmin: isSuper };
}

/**
 * يرتّب ‎`full` + env: كل التبويبات. ‎`media` + env: [media] فقط.
 */
function fromEnvOverride(uid: string, access: ControlPanelAccess, isSuper: boolean): ControlSessionPayload {
  if (access === "media") {
    return {
      uid,
      scope: "media",
      tabs: ["media"],
      mediaFolders: "all",
      superAdmin: isSuper,
    };
  }
  return {
    uid,
    scope: "full",
    tabs: "all",
    mediaFolders: "all",
    superAdmin: isSuper,
  };
}

/**
 * اقرأ وثيقة ‎`controlPanelAccess`‎ + قوائم ‎`env`‎. يعيد ‎`null`‎ عند عدم التصريح.
 */
export async function resolveControlSessionForUid(
  uid: string,
  superAdminUids: Set<string> = getControlPanelSuperAdminUids(),
): Promise<ControlSessionPayload | null> {
  if (!uid.trim()) return null;
  const isSuper = superAdminUids.has(uid);
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    const env = getControlAccessForUid(uid);
    if (env) return fromEnvOverride(uid, env, isSuper);
    return null;
  }
  const db = getAdminFirestore();
  const snap = await db.collection(CONTROL_PANEL_ACCESS_COLLECTION).doc(uid).get();
  if (snap.exists) {
    const data = snap.data();
    const parsed = controlPanelAccessDocSchema.safeParse(data);
    if (parsed.success) {
      return docToPayload(uid, parsed.data, isSuper);
    }
  }
  const env = getControlAccessForUid(uid);
  if (env) return fromEnvOverride(uid, env, isSuper);
  return null;
}

/** للتحقق: هل ‎`uid`‎ مُسموح بالدخول (وثيقة أو env). */
export async function isUidControlPanelAccessAllowed(uid: string): Promise<boolean> {
  if (!uid.trim()) return false;
  if (getControlAccessForUid(uid)) return true;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return false;
  const db = getAdminFirestore();
  const snap = await db.collection(CONTROL_PANEL_ACCESS_COLLECTION).doc(uid).get();
  if (!snap.exists) return false;
  return controlPanelAccessDocSchema.safeParse(snap.data()).success;
}
