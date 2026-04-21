import { NextRequest, NextResponse } from "next/server";
import { signSessionToken } from "@/lib/jwt";
import {
  getStorefrontCustomerByUid,
  verifyFirebaseIdToken,
} from "@/lib/firebase-admin";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!isRecord(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const idToken = bodyUnknown.idToken;
  if (typeof idToken !== "string" || idToken.length < 10) {
    return NextResponse.json({ error: "Invalid idToken" }, { status: 400 });
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      {
        error:
          "الخادم غير مُعدّ لتسجيل الدخول عبر Firebase: أضف FIREBASE_SERVICE_ACCOUNT_JSON إلى ملف البيئة (JSON مفتاح الخدمة من Firebase → Project settings → Service accounts → Generate new private key، سطر واحد).",
      },
      { status: 503 },
    );
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    const uid = decoded.uid;
    const profile = await getStorefrontCustomerByUid(uid);

    const email =
      profile?.contactEmail ??
      (typeof decoded.email === "string" && decoded.email.length > 0
        ? decoded.email
        : `firebase-${uid}@phone.local`);

    const displayName = profile
      ? `${profile.contactFirstName} ${profile.contactLastName}`.trim()
      : typeof decoded.name === "string" && decoded.name.length > 0
        ? decoded.name
        : "عميل";

    const nicename =
      profile?.contactEmail?.split("@")[0]?.slice(0, 60) ?? uid.slice(0, 24);

    const sessionToken = await signSessionToken({
      sub: uid,
      email,
      nicename,
      displayName,
      firebaseUid: uid,
    });

    return NextResponse.json({
      token: sessionToken,
      userEmail: email,
      userNicename: nicename,
      userDisplayName: displayName,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (
      msg.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
      msg.includes("must be a JSON object")
    ) {
      return NextResponse.json(
        {
          error:
            "قيمة FIREBASE_SERVICE_ACCOUNT_JSON غير صالحة. يجب أن تكون كائناً JSON كاملاً من ملف مفتاح الخدمة.",
        },
        { status: 503 },
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Firebase login failed" }, { status: 401 });
  }
}
