/** مسار بسيط: الـ cookie/session بتتفضى من جهة العميل؛ هنا تأكيد JSON فقط. */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true });
}
