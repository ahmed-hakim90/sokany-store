import { CMS_MEDIA_ROOT_PREFIX, isPathUnderCmsMediaRoot } from "@/lib/cms-media-path";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import type { ControlSessionPayload } from "@/lib/control-session-types";

/**
 * المقطع الأول (المجلد الفرعي) تحت ‎`cms/site-media/‎`‎.
 */
function siteMediaSubfolderSegment(path: string): string {
  if (!isPathUnderCmsMediaRoot(path) || path === CMS_MEDIA_ROOT_PREFIX) return "";
  const after = path.slice((CMS_MEDIA_ROOT_PREFIX + "/").length);
  return (after.split("/")[0] || "").toLowerCase();
}

const SUBFOLDER_TO_TABS: Readonly<Record<string, string[]>> = {
  general: ["media"],
  hero: ["hero"],
  banners: ["banners"],
  retailers: ["retailers"],
  spotlights: ["spotlights"],
  documents: ["media"],
  promos: ["media"],
};

function subfolderImpliesTabAllowed(sub: string, session: ControlSessionPayload): boolean {
  if (session.tabs === "all") return true;
  const segs = sub.toLowerCase();
  for (const [k, tlist] of Object.entries(SUBFOLDER_TO_TABS)) {
    if (segs === k || segs.startsWith(`${k}/`)) {
      return tlist.some((t) => (session.tabs as string[]).includes(t));
    }
  }
  return hasControlPanelTab(session, "media");
}

/**
 * رفع/استبدال ملفات تحت ‎`cms/site-media/…‎`‎.
 */
export function canWriteUnderSiteMedia(
  path: string,
  session: ControlSessionPayload,
  newUploadSubfolder?: string,
): boolean {
  if (!isPathUnderCmsMediaRoot(path) || path === CMS_MEDIA_ROOT_PREFIX) {
    return false;
  }
  const rawSeg = newUploadSubfolder ?? siteMediaSubfolderSegment(path);
  const subForSeg = (rawSeg || "").trim().toLowerCase();
  if (subForSeg) {
    if (session.mediaFolders !== "all") {
      if (session.mediaFolders.length === 0) return false;
      const allowed = session.mediaFolders.some(
        (f) => f === subForSeg || subForSeg.startsWith(`${f}/`) || f.startsWith(`${subForSeg}/`),
      );
      if (!allowed) return false;
    }
  } else if (session.mediaFolders !== "all" && session.mediaFolders.length > 0) {
    return false;
  }
  if (session.scope === "media") {
    return true;
  }
  if (session.scope !== "full") {
    return false;
  }
  if (session.tabs === "all" || hasControlPanelTab(session, "media")) {
    return true;
  }
  if (!subForSeg) {
    return false;
  }
  return subfolderImpliesTabAllowed(subForSeg, session);
}

/** ‎`cms/…` بدون ‎`site-media`‎ (مثلاً ‎`cms/173-hero.jpg`‎). */
export function canWriteCmsAdhocPath(session: ControlSessionPayload): boolean {
  if (session.scope !== "full") return false;
  if (session.tabs === "all") return true;
  return (session.tabs as string[]).length > 0;
}

/** ‎`GET/DELETE`‎ مكتبة الوسائط (واجهة الوسائط). */
export function canAccessMediaLibrary(session: ControlSessionPayload): boolean {
  if (session.scope === "media") return true;
  if (session.scope !== "full") return false;
  return hasControlPanelTab(session, "media");
}

export function canDeleteStoragePath(
  path: string,
  session: ControlSessionPayload,
): boolean {
  if (session.scope === "media") {
    return isPathUnderCmsMediaRoot(path) && canWriteUnderSiteMedia(path, session);
  }
  if (session.scope === "full") {
    if (!path.startsWith("cms/") || !path) return false;
    if (isPathUnderCmsMediaRoot(path)) {
      return canWriteUnderSiteMedia(path, session);
    }
    if (path.startsWith(`${CMS_MEDIA_ROOT_PREFIX}/`) === false) {
      return canWriteCmsAdhocPath(session);
    }
    return canWriteUnderSiteMedia(path, session);
  }
  return false;
}
