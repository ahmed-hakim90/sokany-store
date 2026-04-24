import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { requireNotificationsAccess } from "@/lib/api-control-auth";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireNotificationsAccess(request);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const title = typeof (body as { title?: unknown }).title === "string"
    ? (body as { title: string }).title.trim()
    : "";
  const text = typeof (body as { body?: unknown }).body === "string"
    ? (body as { body: string }).body.trim()
    : "";
  const topic =
    typeof (body as { topic?: unknown }).topic === "string"
      ? (body as { topic: string }).topic.trim()
      : "all_customers";

  if (!title || !text) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  try {
    const app = getFirebaseAdminApp();
    const messaging = admin.messaging(app);
    await messaging.send({
      topic,
      notification: { title, body: text },
      webpush: {
        notification: { title, body: text },
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 500 },
    );
  }
}
