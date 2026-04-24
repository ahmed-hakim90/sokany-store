import { NextRequest, NextResponse } from "next/server";
import { requireControlSession } from "@/lib/api-control-auth";
import { isSafeCmsObjectPath, publicCmsFilePathFromStoragePath } from "@/lib/cms-file-path";
import {
  buildNewUploadPathInMediaRoot,
  isPathUnderCmsMediaRoot,
  normalizeCmsMediaSubfolder,
} from "@/lib/cms-media-path";
import {
  canWriteCmsAdhocPath,
  canWriteUnderSiteMedia,
} from "@/lib/control-storage-guard";
import type { ControlSessionPayload } from "@/lib/control-session-types";
import { getAdminStorageBucket } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
]);

function allowUploadToPath(
  path: string,
  auth: ControlSessionPayload,
  newUploadSubfolder: string | undefined,
  isReplace: boolean,
): boolean {
  if (isPathUnderCmsMediaRoot(path) && path !== "cms/site-media") {
    return canWriteUnderSiteMedia(
      path,
      auth,
      isReplace ? undefined : newUploadSubfolder,
    );
  }
  return canWriteCmsAdhocPath(auth);
}

export async function POST(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size < 1) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }
  const rawName = typeof form.get("filename") === "string" ? String(form.get("filename")) : "upload";
  const safeLower = rawName.toLowerCase();
  let type = file.type || "application/octet-stream";
  if (type === "application/octet-stream" && safeLower.endsWith(".pdf")) {
    type = "application/pdf";
  }
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  const safeBase = rawName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "upload";
  const buf = Buffer.from(await file.arrayBuffer());

  const replaceRaw = form.get("replacePath");
  const replacePath = typeof replaceRaw === "string" ? replaceRaw.trim() : "";
  let path: string;

  if (replacePath) {
    if (!isSafeCmsObjectPath(replacePath)) {
      return NextResponse.json({ error: "Invalid replacePath" }, { status: 400 });
    }
    if (auth.scope === "media" && !isPathUnderCmsMediaRoot(replacePath)) {
      return NextResponse.json(
        { error: "لا يُسمح إلا بملفات داخل مجلد الوسائط المشترك" },
        { status: 403 },
      );
    }
    let subNorm: string | undefined;
    try {
      if (isPathUnderCmsMediaRoot(replacePath)) {
        const after = replacePath.slice("cms/site-media/".length);
        const seg = (after.split("/")[0] || "").trim();
        if (seg) {
          subNorm = normalizeCmsMediaSubfolder(seg);
        }
      }
    } catch {
      subNorm = undefined;
    }
    if (!allowUploadToPath(replacePath, auth, subNorm, true)) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية استبدال الملف في هذا المسار" },
        { status: 403 },
      );
    }
    path = replacePath;
  } else if (auth.scope === "media") {
    let sub: string;
    try {
      sub = normalizeCmsMediaSubfolder(String(form.get("subfolder") ?? ""));
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "مجلد غير صالح" },
        { status: 400 },
      );
    }
    path = buildNewUploadPathInMediaRoot(safeBase, sub);
    if (!canWriteUnderSiteMedia(path, auth, sub)) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الرفع في هذا المجلد" },
        { status: 403 },
      );
    }
  } else {
    const subIn = form.get("subfolder");
    if (typeof subIn === "string" && subIn.trim().length > 0) {
      try {
        const subN = normalizeCmsMediaSubfolder(subIn);
        path = buildNewUploadPathInMediaRoot(safeBase, subN);
        if (!canWriteUnderSiteMedia(path, auth, subN)) {
          return NextResponse.json(
            { error: "ليس لديك صلاحية الرفع في هذا المجلد" },
            { status: 403 },
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "مجلد غير صالح" },
          { status: 400 },
        );
      }
    } else {
      path = `cms/${Date.now()}-${safeBase}`;
      if (!canWriteCmsAdhocPath(auth)) {
        return NextResponse.json(
          { error: "لا تملك صلاحية رفع الملفات إلى مسار ‎`cms/…` العام" },
          { status: 403 },
        );
      }
    }
  }

  if (!isSafeCmsObjectPath(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const publicPath = publicCmsFilePathFromStoragePath(path);
  if (!publicPath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 500 });
  }

  try {
    const bucket = getAdminStorageBucket();
    const ref = bucket.file(path);
    await ref.save(buf, {
      metadata: { contentType: type, cacheControl: "public,max-age=31536000" },
    });
    return NextResponse.json({ url: publicPath, path });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
