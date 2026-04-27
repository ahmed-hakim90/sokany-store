import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth-request";
import { createWooClient } from "@/lib/create-woo-client";
import { assertOrderAccessibleBySession } from "@/lib/verify-order-for-session";
import { USE_MOCK } from "@/lib/constants";
import {
  guestOrderActionEligibility,
  GuestOrderAccessError,
} from "@/features/orders/lib/guest-order-server";
import { mockOrderTimestampsForEligibility } from "@/features/orders/lib/mock-order-timestamps-for-eligibility";
import { mockOrders } from "@/features/orders/mock";
import { wpOrderSchema } from "@/schemas/wordpress";

const bodySchema = z.object({
  orderId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "غير مخوّل." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير كافية." }, { status: 400 });
  }

  const { orderId } = parsed.data;

  if (USE_MOCK) {
    const raw = mockOrders.find((o) => o.id === orderId);
    if (!raw) {
      return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    }
    const email = (raw as { billing?: { email?: string } }).billing?.email?.trim();
    if (email && email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "تعذر التحقق من الطلب." }, { status: 403 });
    }
    const t = mockOrderTimestampsForEligibility();
    const elig = guestOrderActionEligibility({
      status: raw.status,
      date_created: t.date_created,
      date_created_gmt: t.date_created_gmt,
    });
    if (!elig.canCancel) {
      return NextResponse.json(
        { error: "لا يمكن إلغاء هذا الطلب في الوقت الحالي." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, orderId, status: "cancelled" });
  }

  try {
    const woo = await createWooClient();
    const res = await woo.get(`/orders/${orderId}`);
    const order = wpOrderSchema.parse(res.data);
    await assertOrderAccessibleBySession(woo, session, order);
    const elig = guestOrderActionEligibility({
      status: order.status,
      date_created: order.date_created,
      date_created_gmt: order.date_created_gmt,
    });
    if (!elig.canCancel) {
      return NextResponse.json(
        { error: "لا يمكن إلغاء هذا الطلب في الوقت الحالي." },
        { status: 409 },
      );
    }
    await woo.put(`/orders/${orderId}`, { status: "cancelled" });
    return NextResponse.json({ ok: true, orderId, status: "cancelled" });
  } catch (e) {
    if (e instanceof GuestOrderAccessError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    }
    console.error("[POST /api/orders/cancel]", e);
    return NextResponse.json({ error: "تعذر إلغاء الطلب." }, { status: 500 });
  }
}
