import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { createWooClient } from "@/lib/create-woo-client";
import { GUEST_ORDER_AMEND_ENABLED, USE_MOCK } from "@/lib/constants";
import { mapOrder } from "@/features/orders/adapters";
import {
  fetchAndVerifyGuestOrder,
  guestOrderActionEligibility,
  GuestOrderAccessError,
} from "@/features/orders/lib/guest-order-server";
import { mockOrders } from "@/features/orders/mock";
import { createOrderPayloadSchema, wpOrderSchema } from "@/schemas/wordpress";

const amendBodySchema = createOrderPayloadSchema.and(
  z.object({
    orderId: z.number().int().positive(),
    orderKey: z.string().min(1),
  }),
);

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = amendBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { orderId, orderKey, ...payload } = parsed.data;

  if (!GUEST_ORDER_AMEND_ENABLED) {
    return NextResponse.json(
      { error: "تعديل الطلب غير متاح حالياً." },
      { status: 403 },
    );
  }

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
    if (!elig.canAmend) {
      return NextResponse.json(
        { error: "لا يمكن تعديل هذا الطلب في الوقت الحالي." },
        { status: 409 },
      );
    }
    const updated = wpOrderSchema.parse({
      ...raw,
      ...payload,
      id: orderId,
      line_items: payload.line_items.map((li, i) => ({
        id: li.id ?? i + 1,
        product_id: li.product_id,
        variation_id: li.variation_id ?? 0,
        name: `Product ${li.product_id}`,
        quantity: li.quantity,
        price: "0",
        total: "0",
      })),
    });
    return NextResponse.json({ order: mapOrder(updated) });
  }

  try {
    const woo = await createWooClient();
    const existing = await fetchAndVerifyGuestOrder(woo, orderId, orderKey);
    const elig = guestOrderActionEligibility({
      status: existing.status,
      date_created: existing.date_created,
      date_created_gmt: existing.date_created_gmt,
    });
    if (!elig.canAmend) {
      return NextResponse.json(
        { error: "لا يمكن تعديل هذا الطلب في الوقت الحالي." },
        { status: 409 },
      );
    }

    const wooPayload = {
      billing: payload.billing,
      shipping: payload.shipping,
      line_items: payload.line_items.map((li) => {
        const row: Record<string, unknown> = {
          product_id: li.product_id,
          quantity: li.quantity,
        };
        if (li.id != null) row.id = li.id;
        if (li.variation_id != null && li.variation_id > 0) {
          row.variation_id = li.variation_id;
        }
        return row;
      }),
      shipping_lines: payload.shipping_lines,
      payment_method: payload.payment_method,
      payment_method_title: payload.payment_method_title,
      customer_note: payload.customer_note,
    };

    const res = await woo.put(`/orders/${orderId}`, wooPayload);
    const order = wpOrderSchema.parse(res.data);
    return NextResponse.json({
      order: mapOrder(order),
      canAmend: guestOrderActionEligibility({
        status: order.status,
        date_created: order.date_created,
        date_created_gmt: order.date_created_gmt,
      }).canAmend,
    });
  } catch (e) {
    if (e instanceof GuestOrderAccessError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (axios.isAxiosError(e) && e.response?.data) {
      const msg =
        typeof (e.response.data as { message?: string }).message === "string"
          ? (e.response.data as { message: string }).message
          : "تعذر تحديث الطلب.";
      return NextResponse.json({ error: msg }, { status: e.response.status || 502 });
    }
    console.error("[POST /api/orders/guest/amend]", e);
    return NextResponse.json({ error: "تعذر تحديث الطلب." }, { status: 500 });
  }
}
