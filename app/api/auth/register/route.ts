import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";
import type { RegisterPayload } from "@/features/auth/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
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
    const woo = createWooClient();
    await woo.post("/customers", {
      email: payload.email,
      username: payload.username,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    );
  }
}
