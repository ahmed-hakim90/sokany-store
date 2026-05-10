/**
 * تسجيل مستخدم جديد في Woo (REST)
 * بالعامية: بروكسي لإنشاء عميل؛ الأخطاء من Woo بتتمرّر للفرونت.
 *
 * شوف كمان: `@/lib/create-woo-client.ts`
 */
import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";
import { enforceRateLimit } from "@/lib/rate-limit-response";
import type { RegisterPayload } from "@/features/auth/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, {
    routeId: "auth-register",
    max: 12,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const bodyUnknown: unknown = await request.json();
  if (!isRecord(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const email = bodyUnknown.email;
  const username = bodyUnknown.username;
  const password = bodyUnknown.password;
  const firstName = bodyUnknown.firstName;
  const lastName = bodyUnknown.lastName;
  if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string"
  ) {
    return NextResponse.json({ error: "Invalid registration" }, { status: 400 });
  }
  const payload: RegisterPayload = {
    email,
    username,
    password,
    firstName,
    lastName,
  };
  try {
    const woo = await createWooClient();
    const res = await woo.post<{ id: number }>("/customers", {
      email: payload.email,
      username: payload.username,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
    });
    const customerId = typeof res.data?.id === "number" ? res.data.id : undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true as const, customerId }, { status: 201 });
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 400) {
      return NextResponse.json(
        {
          error:
            "قد يكون البريد أو اسم المستخدم مسجّلاً مسبقاً. سجّل الدخول أو استخدم بريداً آخر.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    );
  }
}
