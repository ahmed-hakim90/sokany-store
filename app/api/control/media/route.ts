import { NextRequest, NextResponse } from "next/server";
import { requireControlSession } from "@/lib/api-control-auth";
import { getControlMediaListPrefixes } from "@/lib/control-media-list-prefixes";
import { isSafeCmsObjectPath, publicCmsFilePathFromStoragePath } from "@/lib/cms-file-path";
import { isPathUnderCmsMediaRoot } from "@/lib/cms-media-path";
import { canAccessMediaLibrary, canDeleteStoragePath } from "@/lib/control-storage-guard";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import type { File } from "@google-cloud/storage";

export const runtime = "nodejs";

const MAX_LIST = 80;

export async function GET(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;
  if (!canAccessMediaLibrary(auth)) {
    return NextResponse.json(
      { error: "لا تملك صلاحية عرض مكتبة الوسائط" },
      { status: 403 },
    );
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get("pageToken")?.trim() || undefined;
  const maxResults = Math.min(
    MAX_LIST,
    Math.max(10, Number.parseInt(searchParams.get("limit") || "40", 10) || 40),
  );

  const prefixes = getControlMediaListPrefixes(auth);
  if (prefixes === null) {
    return NextResponse.json(
      { error: "لا تملك صلاحية عرض الوسائط" },
      { status: 403 },
    );
  }
  if (prefixes.length === 0) {
    return NextResponse.json({ items: [], nextPageToken: null });
  }

  const listPrefix = prefixes[0]!;
  if (prefixes.length > 1) {
    return await getFilesMerged({
      bucket: getAdminStorageBucket(),
      prefixes,
      maxResults,
      pageToken,
    });
  }

  try {
    const bucket = getAdminStorageBucket();
    const [files, nextQ] = await bucket.getFiles({
      prefix: listPrefix,
      maxResults,
      pageToken,
    });
    return await filesToJsonResponse(files, nextQ);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "فشل جلب الوسائط" }, { status: 500 });
  }
}

async function getFilesMerged(args: {
  bucket: ReturnType<typeof getAdminStorageBucket>;
  prefixes: string[];
  maxResults: number;
  pageToken?: string;
}): Promise<NextResponse> {
  const { bucket, prefixes, maxResults, pageToken } = args;
  const per = Math.max(5, Math.ceil(maxResults / prefixes.length));
  try {
    const all: File[] = [];
    for (const prefix of prefixes) {
      const [files] = await bucket.getFiles({
        prefix,
        maxResults: per,
        pageToken: pageToken && prefixes[0] === prefix ? pageToken : undefined,
      });
      all.push(...files);
    }
    return await filesToJsonResponse(
      all,
      { pageToken: undefined } as { pageToken?: string },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "فشل جلب الوسائط" }, { status: 500 });
  }
}

async function filesToJsonResponse(
  files: File[],
  nextQ: { pageToken?: string } | undefined,
) {
  const nonFolder = files.filter((f) => f.name && !f.name.endsWith("/"));
  const items = await Promise.all(
    nonFolder.map(async (f) => {
      await f.getMetadata();
      const m = f.metadata;
      const url = publicCmsFilePathFromStoragePath(f.name);
      return {
        path: f.name,
        url: url ?? "",
        contentType: m.contentType ?? "application/octet-stream",
        size: Number(m.size) || 0,
        updated: m.updated ? String(m.updated) : null,
      };
    }),
  );
  items.sort((a, b) => (b.path > a.path ? 1 : b.path < a.path ? -1 : 0));
  return NextResponse.json({
    items,
    nextPageToken: (nextQ as { pageToken?: string } | undefined)?.pageToken ?? null,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;
  if (!canAccessMediaLibrary(auth)) {
    return NextResponse.json(
      { error: "لا تملك صلاحية حذف الوسائط" },
      { status: 403 },
    );
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let path: string;
  try {
    const j = (await request.json()) as { path?: unknown };
    path = typeof j.path === "string" ? j.path : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!isSafeCmsObjectPath(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (auth.scope === "media" && !isPathUnderCmsMediaRoot(path)) {
    return NextResponse.json(
      { error: "لا تُحذف إلا ملفات داخل مجلد الوسائط المشترك" },
      { status: 403 },
    );
  }
  if (!canDeleteStoragePath(path, auth)) {
    return NextResponse.json(
      { error: "ليس لديك صلاحية حذف هذا المسار" },
      { status: 403 },
    );
  }

  try {
    const bucket = getAdminStorageBucket();
    await bucket.file(path).delete({ ignoreNotFound: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
