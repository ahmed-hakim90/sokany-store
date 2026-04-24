import { CMS_MEDIA_ROOT_PREFIX } from "@/lib/cms-media-path";
import { canAccessMediaLibrary } from "@/lib/control-storage-guard";
import type { ControlSessionPayload } from "@/lib/control-session-types";

/**
 * بادئات ‎`getFiles`‎ لقائمة الوسائط. ‎`null`‎ = لا يُسمح. مصفوفة فارغة = لا شيء.
 */
export function getControlMediaListPrefixes(
  session: ControlSessionPayload,
): string[] | null {
  if (!canAccessMediaLibrary(session)) {
    return null;
  }
  if (session.scope === "media") {
    if (session.mediaFolders === "all") {
      return [`${CMS_MEDIA_ROOT_PREFIX}/`];
    }
    if (session.mediaFolders.length === 0) {
      return [];
    }
    return session.mediaFolders.map((f) => `${CMS_MEDIA_ROOT_PREFIX}/${f.replace(/^\/+|\/+$/g, "")}/`);
  }
  if (session.scope === "full") {
    if (session.mediaFolders === "all") {
      return ["cms/"];
    }
    if (session.mediaFolders.length === 0) {
      return [];
    }
    return session.mediaFolders.map((f) => `${CMS_MEDIA_ROOT_PREFIX}/${f.replace(/^\/+|\/+$/g, "")}/`);
  }
  return null;
}
