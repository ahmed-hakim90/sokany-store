import { NextRequest, NextResponse } from "next/server";
import { isUidControlPanelAccessAllowed, resolveControlSessionForUid } from "@/lib/control-access-resolve";
import { requireControlSession } from "@/lib/api-control-auth";
import {
  CONTROL_SESSION_COOKIE_NAME,
  signControlSessionPayload,
} from "@/lib/control-session";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({
    ok: true,
    scope: auth.scope,
    tabs: auth.tabs,
    mediaFolders: auth.mediaFolders,
    superAdmin: auth.superAdmin,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("idToken" in body) ||
    typeof (body as { idToken?: unknown }).idToken !== "string"
  ) {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }
  const idToken = (body as { idToken: string }).idToken;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      { error: "Server Firebase Admin not configured" },
      { status: 503 },
    );
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    if (!(await isUidControlPanelAccessAllowed(decoded.uid))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const payload = await resolveControlSessionForUid(decoded.uid);
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const session = await signControlSessionPayload(payload);
    const res = NextResponse.json({
      ok: true,
      scope: payload.scope,
      tabs: payload.tabs,
      mediaFolders: payload.mediaFolders,
      superAdmin: payload.superAdmin,
    });
    res.cookies.set(CONTROL_SESSION_COOKIE_NAME, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("FIREBASE_SERVICE_ACCOUNT_JSON")) {
      return NextResponse.json(
        { error: "إعداد الخادم: مفتاح الخدمة غير صالح. راجع FIREBASE_SERVICE_ACCOUNT_JSON في .env" },
        { status: 503 },
      );
    }
    if (
      msg.includes("JWT_SECRET_OR_CONTROL_SESSION_JWT_SECRET") ||
      msg.includes("JWT_SECRET")
    ) {
      return NextResponse.json(
        {
          error:
            "أضف JWT_SECRET (أو CONTROL_SESSION_JWT_SECRET) في ملف .env ثم أعد تشغيل السيرفر — مطلوب لتوقيع جلسة لوحة التحكم.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(CONTROL_SESSION_COOKIE_NAME);
  return res;
}
