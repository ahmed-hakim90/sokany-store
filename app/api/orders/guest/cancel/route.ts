import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import {
  fetchAndVerifyGuestOrder,
  guestOrderActionEligibility,
  GuestOrderAccessError,
} from "@/features/orders/lib/guest-order-server";
import { mockOrders } from "@/features/orders/mock";
import { wpOrderSchema } from "@/schemas/wordpress";

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  orderKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { orderId, orderKey } = parsed.data;

  if (USE_MOCK) {
    const raw = mockOrders.find((o) => o.id === orderId);
    if (!raw || raw.order_key !== orderKey) {
      return NextResponse.json({ error: "تعذر التحقق من الطلب." }, { status: 403 });
    }
    const rawGmt = (raw as { date_created_gmt?: unknown }).date_created_gmt;
    const elig = guestOrderActionEligibility({
      status: raw.status,
      date_created: raw.date_created,
      date_created_gmt: typeof rawGmt === "string" ? rawGmt : undefined,
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
    const order = await fetchAndVerifyGuestOrder(woo, orderId, orderKey);
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
    console.error("[POST /api/orders/guest/cancel]", e);
    return NextResponse.json({ error: "تعذر إلغاء الطلب." }, { status: 500 });
  }
}
