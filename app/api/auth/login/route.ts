import { decodeJwt } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signSessionToken } from "@/lib/jwt";
import { getWordPressJwtTokenUrl } from "@/lib/wp-url";
import type { LoginPayload } from "@/features/auth/types";

type WpJwtSuccess = {
  token?: string;
  user_email?: string;
  user_nicename?: string;
  user_display_name?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stripWpHtml(message: string): string {
  return message.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** رسالة بعد فشل ‎POST‎ إلى نقطة JWT على ووردبريس */
function describeJwtTokenUpstreamFailure(status: number, raw: unknown): string {
  if (isRecord(raw)) {
    const code = typeof raw.code === "string" ? raw.code : "";
    /* REST بدون مسار مطابق — غالباً إضافة JWT غير مفعّلة أو مسار مختلف */
    if (code === "rest_no_route" || code.includes("rest_no_route")) {
      return (
        "لا يوجد مسار JWT على هذا الموقع (rest_no_route). ثبّت وأفعّل إضافة «JWT Authentication for WP REST API» على ووردبريس، " +
        "ثم أعد المحاولة. إذا كانت إضافتك تستخدم مساراً آخر، عيّن WC_JWT_AUTH_TOKEN_PATH في بيئة المتجر إلى ذلك المسار (يبدأ بـ /wp-json/…)."
      );
    }
    if (
      code.includes("invalid_username") ||
      code.includes("incorrect_password") ||
      code.includes("invalid_credentials") ||
      code.includes("jwt_auth_failed") ||
      code.includes("jwt_auth_invalid_credentials")
    ) {
      return "البريد أو كلمة المرور غير صحيحة.";
    }
    if (code.includes("jwt_auth_bad_config")) {
      return "إعدادات JWT على ووردبريس غير مكتملة (المفتاح السري للـ JWT في wp-config أو الإعدادات).";
    }
    const message = raw.message;
    if (typeof message === "string" && message.length > 0) {
      const t = stripWpHtml(message);
      /* نفس خطأ المسار بلغة واجهة ووردبريس */
      if (
        t.includes("لم يتم العثور على مسار") ||
        t.toLowerCase().includes("no route was found")
      ) {
        return describeJwtTokenUpstreamFailure(404, { code: "rest_no_route" });
      }
      if (t.length > 0) {
        return t;
      }
    }
  }
  if (status === 404) {
    return (
      "مسار JWT غير موجود (404). تحقق من تفعيل إضافة JWT على ووردبريس أو من قيمة WC_JWT_AUTH_TOKEN_PATH."
    );
  }
  return "فشل التحقق على موقع المتجر. تأكد أن WC_BASE_URL يشير لموقع ووكومرس الصحيح وأن نقطة JWT متاحة.";
}

export async function POST(request: NextRequest) {
  const bodyUnknown: unknown = await request.json();
  if (!isRecord(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const username = bodyUnknown.username;
  const password = bodyUnknown.password;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const payload: LoginPayload = { username, password };

  try {
    const url = getWordPressJwtTokenUrl();
    const wpRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        username: payload.username.trim(),
        password: payload.password,
      }),
    });

    const wpBodyText = await wpRes.text();
    let raw: unknown;
    try {
      raw = wpBodyText.length ? JSON.parse(wpBodyText) : {};
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[auth/login] JWT endpoint returned non-JSON",
          wpRes.status,
          wpBodyText.slice(0, 200),
        );
      }
      return NextResponse.json(
        {
          error:
            describeJwtTokenUpstreamFailure(wpRes.status, null) +
            " (استجابة غير JSON من الخادم — راجع WC_BASE_URL أو الحماية أمام REST)",
        },
        { status: 401 },
      );
    }

    if (!wpRes.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth/login] JWT URL:", url, "status:", wpRes.status, "body:", raw);
      }
      return NextResponse.json(
        { error: describeJwtTokenUpstreamFailure(wpRes.status, raw) },
        { status: 401 },
      );
    }

    if (!isRecord(raw)) {
      return NextResponse.json(
        { error: "استجابة غير صالحة من خادم تسجيل الدخول." },
        { status: 502 },
      );
    }
    const wp = raw as WpJwtSuccess;
    if (typeof wp.token !== "string" || !wp.token.trim()) {
      return NextResponse.json(
        {
          error:
            "لم يُرجع موقع ووردبريس رمز JWT — تحقق من إضافة JWT Authentication والنسخة والصلاحيات.",
        },
        { status: 502 },
      );
    }
    let email = typeof wp.user_email === "string" ? wp.user_email : "";
    const nicename =
      typeof wp.user_nicename === "string" ? wp.user_nicename : payload.username;
    const displayName =
      typeof wp.user_display_name === "string"
        ? wp.user_display_name
        : payload.username;
    const wpToken = wp.token;
    if (!email && wpToken) {
      try {
        const decoded = decodeJwt(wpToken);
        const decodedEmail = decoded.email;
        if (typeof decodedEmail === "string") {
          email = decodedEmail;
        }
      } catch {
        /* رمز WP قد لا يكون JWT قياسياً — نُكمِل بـ user_email أو البريد الاصطناعي */
      }
    }
    if (!email) {
      email = `${payload.username}@customers.local`;
    }
    const sessionToken = await signSessionToken({
      sub: nicename,
      email,
      nicename,
      displayName,
    });
    return NextResponse.json({
      token: sessionToken,
      userEmail: email,
      userNicename: nicename,
      userDisplayName: displayName,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (process.env.NODE_ENV === "development") {
      console.error("[auth/login]", e);
    }
    let hint =
      "حدث خطأ أثناء الاتصال بموقع المتجر أو توقيع الجلسة.";
    if (msg.includes("JWT_SECRET")) {
      hint =
        "لم يُضبط JWT_SECRET في بيئة الخادم (.env.local) — مطلوب لتوقيع جلسة المتجر بعد نجاح ووردبريس.";
    } else if (msg.includes("WC_BASE_URL")) {
      hint = "أضف WC_BASE_URL في البيئة (رابط موقع ووردبريس/ووكومرس).";
    } else if (msg.includes("WC_JWT_AUTH_TOKEN_PATH")) {
      hint =
        "قيمة WC_JWT_AUTH_TOKEN_PATH غير صالحة — يجب أن تبدأ بـ / (مثل /wp-json/jwt-auth/v1/token).";
    }
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
