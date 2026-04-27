import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import {
  CONTROL_SETTINGS_COLLECTION,
  CONTROL_SETTINGS_DOC_IDS,
} from "@/features/control/lib/collections";
import { requireOrderForwardingAccess } from "@/lib/api-control-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
  orderForwardingSettingsPrivateSchema,
  orderForwardingSettingsPutSchema,
  toPublicOrderForwardingSettings,
} from "@/schemas/order-forwarding";

export const runtime = "nodejs";

function missingFirebaseResponse() {
  return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
}

function getSettingsRef() {
  const db = getAdminFirestore();
  return db
    .collection(CONTROL_SETTINGS_COLLECTION)
    .doc(CONTROL_SETTINGS_DOC_IDS.orderForwarding);
}

export async function GET(request: NextRequest) {
  const auth = await requireOrderForwardingAccess(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return missingFirebaseResponse();
  }

  try {
    const snap = await getSettingsRef().get();
    const parsed = orderForwardingSettingsPrivateSchema.safeParse(
      snap.exists ? snap.data() : {},
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Order forwarding settings are invalid" },
        { status: 500 },
      );
    }
    return NextResponse.json(toPublicOrderForwardingSettings(parsed.data));
  } catch (e) {
    console.error("[control/order-forwarding-settings] read failed", e);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireOrderForwardingAccess(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return missingFirebaseResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyParsed = orderForwardingSettingsPutSchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.flatten() }, { status: 400 });
  }

  try {
    const ref = getSettingsRef();
    const snap = await ref.get();
    const existingParsed = orderForwardingSettingsPrivateSchema.safeParse(
      snap.exists ? snap.data() : {},
    );
    const existing = existingParsed.success ? existingParsed.data : undefined;
    const incoming = bodyParsed.data;
    const secret = incoming.clearSecret ? undefined : incoming.secret ?? existing?.secret;
    const next = {
      enabled: incoming.enabled,
      apiUrl: incoming.apiUrl,
      secretHeaderName:
        incoming.secretHeaderName || DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
      secret,
    };

    if (next.enabled && (!next.apiUrl || !next.secret?.trim())) {
      return NextResponse.json(
        { error: "يجب إدخال API URL و secret قبل تشغيل إرسال الطلبات." },
        { status: 400 },
      );
    }

    const stored: Record<string, unknown> = {
      enabled: next.enabled,
      secretHeaderName: next.secretHeaderName,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (next.apiUrl) stored.apiUrl = next.apiUrl;
    if (next.secret) stored.secret = next.secret;

    await ref.set(stored, { merge: false });
    return NextResponse.json(toPublicOrderForwardingSettings(next));
  } catch (e) {
    console.error("[control/order-forwarding-settings] write failed", e);
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }
}
