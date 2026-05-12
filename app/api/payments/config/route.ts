/**
 * GET /api/payments/config
 * يُعيد البوابات المفعّلة للواجهة (بدون أسرار).
 */
import { NextResponse } from "next/server";
import { resolveEnabledGateways } from "@/lib/payment-gateways-store";

export async function GET() {
  try {
    const gateways = await resolveEnabledGateways();
    return NextResponse.json(gateways, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ fawry: false, paymob: false });
  }
}
