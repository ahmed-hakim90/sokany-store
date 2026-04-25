import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const TOPIC = "all_customers";

/** يربط token جهاز الويب بموضوع FCM (لإرسالات لوحة التحكم). */
export async function POST(request: NextRequest) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const token =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { token?: unknown }).token === "string"
      ? (body as { token: string }).token.trim()
      : "";
  if (token.length < 10) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  try {
    const app = getFirebaseAdminApp();
    const res = await admin.messaging(app).subscribeToTopic([token], TOPIC);
    if (res.failureCount > 0 && res.errors.length > 0) {
      return NextResponse.json(
        { error: res.errors[0]?.error?.message ?? "Subscribe failed" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, topic: TOPIC });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Subscribe failed" },
      { status: 500 },
    );
  }
}
