import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * فحص بسيط لمراقبة الأجهزة (بدون مصادقة). لا يضرب Woo.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    at: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
