/**
 * جذر الوسائط المُنظّمة: مجلد واحد ‎`site-media`‎ وتحته مجلدات فرعية (هيرو، بانرات، …).
 */
export const CMS_MEDIA_ROOT_PREFIX = "cms/site-media";

const SUBFOLDER_RE =
  /^[a-z0-9]([a-z0-9_-]*[a-z0-9])?(\/[a-z0-9]([a-z0-9_-]*[a-z0-9])?){0,4}$/;

export function isPathUnderCmsMediaRoot(path: string): boolean {
  return path === CMS_MEDIA_ROOT_PREFIX || path.startsWith(`${CMS_MEDIA_ROOT_PREFIX}/`);
}

/**
 * يُرجع مقطعًا نسبيًا بعد ‎`cms/site-media/`‎ (مثلاً ‎`hero`‎ أو ‎`banners/2024`‎).
 * فارغ = استخدام ‎`general`‎.
 */
export function normalizeCmsMediaSubfolder(raw: string | undefined | null): string {
  const t = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
  if (!t) {
    return "general";
  }
  if (t.length > 120) {
    throw new Error("مسار المجلد طويل جدًا");
  }
  if (!SUBFOLDER_RE.test(t)) {
    throw new Error("مسار مجلد غير صالح (أحرف إنجليزية صغيرة، أرقام، -، /، ١–٥ أقسام)");
  }
  return t;
}

export function buildNewUploadPathInMediaRoot(safeFileBase: string, subfolder: string): string {
  const sub = normalizeCmsMediaSubfolder(subfolder);
  return `${CMS_MEDIA_ROOT_PREFIX}/${sub}/${Date.now()}-${safeFileBase}`;
}
