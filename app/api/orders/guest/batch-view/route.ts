import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import {
  fetchAndVerifyGuestOrder,
  GuestOrderAccessError,
  mapGuestViewResponse,
} from "@/features/orders/lib/guest-order-server";
import { mockOrders } from "@/features/orders/mock";
import { wpOrderSchema } from "@/schemas/wordpress";

const bodySchema = z.object({
  refs: z
    .array(
      z.object({
        orderId: z.number().int().positive(),
        orderKey: z.string().min(1),
      }),
    )
    .min(1)
    .max(20),
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

  if (USE_MOCK) {
    const results = parsed.data.refs.map((ref) => {
      const raw = mockOrders.find((o) => o.id === ref.orderId);
      if (!raw || raw.order_key !== ref.orderKey) {
        return { orderId: ref.orderId, error: "not_found" as const };
      }
      const order = wpOrderSchema.parse(raw);
      return { orderId: ref.orderId, ...mapGuestViewResponse(order) };
    });
    return NextResponse.json({ results });
  }

  try {
    const woo = await createWooClient();
    const results = await Promise.all(
      parsed.data.refs.map(async (ref) => {
        try {
          const order = await fetchAndVerifyGuestOrder(woo, ref.orderId, ref.orderKey);
          return { orderId: ref.orderId, ...mapGuestViewResponse(order) };
        } catch (e) {
          if (e instanceof GuestOrderAccessError) {
            return { orderId: ref.orderId, error: "forbidden" as const };
          }
          if (axios.isAxiosError(e) && e.response?.status === 404) {
            return { orderId: ref.orderId, error: "not_found" as const };
          }
          return { orderId: ref.orderId, error: "not_found" as const };
        }
      }),
    );
    return NextResponse.json({ results });
  } catch (e) {
    console.error("[POST /api/orders/guest/batch-view]", e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
