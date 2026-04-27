import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";
import { listWooOrdersForSession } from "@/lib/list-woo-orders-for-session";
import { forwardOrderCreatedToExternalApi } from "@/features/orders/services/forward-order-to-external-api";

function messageFromWooErrorBody(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "Failed to create order";
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const woo = await createWooClient();
    const params = Object.fromEntries(searchParams.entries());
    const data = await listWooOrdersForSession(woo, session, params);
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(data.length),
        "X-WP-TotalPages": "1",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const woo = await createWooClient();
    const response = await woo.post("/orders", body);
    try {
      const forwarded = await forwardOrderCreatedToExternalApi(response.data);
      if (forwarded.status === "failed") {
        console.warn("[order-forwarding] failed to send created order", {
          statusCode: forwarded.statusCode,
          reason: forwarded.reason,
        });
      }
    } catch (forwardError) {
      console.warn(
        "[order-forwarding] failed to send created order",
        forwardError instanceof Error ? forwardError.message : String(forwardError),
      );
    }
    return NextResponse.json(response.data, { status: 201 });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response) {
        const msg = messageFromWooErrorBody(e.response.data);
        const status = e.response.status;
        return NextResponse.json(
          { error: msg },
          { status: status >= 400 && status < 600 ? status : 502 },
        );
      }
      console.error("[POST /api/orders] no response", e.message);
      return NextResponse.json(
        { error: "تعذر الاتصال بمتجر ووكومرس." },
        { status: 503 },
      );
    }
    if (e instanceof Error && e.message.includes("WooCommerce server environment")) {
      console.error("[POST /api/orders]", e);
      return NextResponse.json(
        {
          error:
            "خادم المتجر غير مُعدّ لإنشاء الطلبات. راجع ‎WC_BASE_URL‎ ومفاتيح ‎WC_CONSUMER_KEY / WC_CONSUMER_SECRET‎.",
        },
        { status: 500 },
      );
    }
    console.error("[POST /api/orders]", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
