import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { requireSuperAdminSession } from "@/lib/api-control-auth";
import { CONTROL_PANEL_ACCESS_COLLECTION } from "@/features/control/lib/collections";
import { isControlPanelTabId } from "@/features/control/lib/control-tabs";
import { controlPanelAccessDocSchema, controlPanelAccessPutBodySchema } from "@/schemas/control-panel-access";
import { getAdminFirestore, getFirebaseAdminApp } from "@/lib/firebase-admin";
import { normalizeCmsMediaSubfolder } from "@/lib/cms-media-path";

export const runtime = "nodejs";

function adminAuth() {
  return admin.auth(getFirebaseAdminApp());
}

/**
 * ‎`GET`‎: قائمة صلاحيات + بريد المستخدم.
 */
export async function GET(request: NextRequest) {
  const auth = await requireSuperAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection(CONTROL_PANEL_ACCESS_COLLECTION).get();
    const out: { uid: string; email: string | null; doc: unknown }[] = [];
    for (const d of snap.docs) {
      let email: string | null = null;
      try {
        const u = await adminAuth().getUser(d.id);
        email = u.email ?? null;
      } catch {
        email = null;
      }
      out.push({ uid: d.id, email, doc: d.data() });
    }
    return NextResponse.json({ items: out });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

function sanitizeTabIds(
  mode: "full" | "media",
  tabIds: string[] | null | undefined,
): string[] | null {
  if (mode === "media") {
    return null;
  }
  if (tabIds == null) {
    return null;
  }
  const s = new Set<string>();
  for (const t of tabIds) {
    if (isControlPanelTabId(t) && t !== "access") {
      s.add(t);
    }
  }
  return s.size === 0 ? [] : [...s];
}

function normalizeMediaSubfolders(
  mode: "full" | "media",
  raw: string[] | null | undefined,
): string[] | null {
  if (raw == null) {
    return null;
  }
  if (raw.length === 0) {
    return [];
  }
  const out: string[] = [];
  for (const r of raw) {
    try {
      out.push(normalizeCmsMediaSubfolder(r));
    } catch {
      return null;
    }
  }
  return out;
}

/**
 * ‎`PUT`‎: إنشاء/تحديث ‎`controlPanelAccess/{uid}`‎.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireSuperAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = controlPanelAccessPutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors?.join(" — ") || "بيانات غير صالحة" },
      { status: 400 },
    );
  }
  const b = parsed.data;
  let targetUid: string;
  if (b.uid?.trim()) {
    targetUid = b.uid.trim();
  } else if (b.email?.trim()) {
    try {
      const u = await adminAuth().getUserByEmail(b.email.trim());
      targetUid = u.uid;
    } catch {
      return NextResponse.json(
        { error: "لا يوجد مستخدم بهذا البريد في Firebase Auth" },
        { status: 404 },
      );
    }
  } else {
    return NextResponse.json({ error: "مطلوب email أو uid" }, { status: 400 });
  }
  if (targetUid === auth.uid) {
    // يُسمح؛ المشرف يضبط نفسه — بدون رفض.
  }
  const tabIds = sanitizeTabIds(b.mode, b.tabIds);
  const mediaSubfolders = normalizeMediaSubfolders(b.mode, b.mediaSubfolders);
  if (mediaSubfolders === null && b.mediaSubfolders != null && b.mediaSubfolders.length > 0) {
    return NextResponse.json({ error: "مسار مجلد وسائط غير صالح" }, { status: 400 });
  }
  const core = {
    mode: b.mode,
    tabIds: tabIds === null ? null : tabIds,
    mediaSubfolders: mediaSubfolders === null ? null : mediaSubfolders,
  };
  const v = controlPanelAccessDocSchema.safeParse(core);
  if (!v.success) {
    return NextResponse.json({ error: "وثيقة غير صالحة" }, { status: 400 });
  }
  try {
    const db = getAdminFirestore();
    await db
      .collection(CONTROL_PANEL_ACCESS_COLLECTION)
      .doc(targetUid)
      .set(
        {
          ...v.data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    return NextResponse.json({ ok: true, uid: targetUid });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSuperAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid")?.trim();
  if (!uid) {
    return NextResponse.json({ error: "مطلوب ?uid=" }, { status: 400 });
  }
  try {
    const db = getAdminFirestore();
    await db.collection(CONTROL_PANEL_ACCESS_COLLECTION).doc(uid).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
