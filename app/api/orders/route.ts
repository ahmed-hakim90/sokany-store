import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";
import { listWooOrdersForSession } from "@/lib/list-woo-orders-for-session";
import { ROUTES } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/site";
import { revalidateWooOrderTags } from "@/lib/woocommerce-revalidate-broadcast";
import { forwardOrderCreatedToExternalApi } from "@/features/orders/services/forward-order-to-external-api";
import { applyWooPaymentGatewayEnvToOrderBody } from "@/lib/woo-order-payment-env";

function messageFromWooErrorBody(data: unknown): string {
  if (data && typeof data === "object") {
    const o = data as { message?: unknown; code?: unknown };
    if (typeof o.message === "string" && o.message.trim()) {
      let msg = o.message.trim();
      if (typeof o.code === "string" && o.code.trim()) {
        msg += ` (${o.code})`;
      }
      return msg;
    }
  }
  return "Failed to create order";
}

function enrichWooOrderForStorefront(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }
  const order = data as Record<string, unknown>;
  const id = typeof order.id === "number" ? order.id : Number(order.id);
  if (!Number.isFinite(id)) {
    return data;
  }
  const trackingUrl = toAbsoluteSiteUrl(
    `${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(id))}`,
  );
  return {
    ...order,
    storefront_order_id: id,
    storefront_order_number:
      typeof order.number === "string" && order.number.trim()
        ? order.number.trim()
        : String(id),
    storefront_tracking_url: trackingUrl,
  };
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
    if (body && typeof body === "object" && !Array.isArray(body)) {
      applyWooPaymentGatewayEnvToOrderBody(body as Record<string, unknown>);
    }
    const woo = await createWooClient();
    const response = await woo.post("/orders", body);
    const responseOrder = enrichWooOrderForStorefront(response.data);
    try {
      revalidateWooOrderTags();
    } catch (revalidateError) {
      console.warn(
        "[POST /api/orders] order cache revalidation failed",
        revalidateError instanceof Error
          ? revalidateError.message
          : String(revalidateError),
      );
    }
    void forwardOrderCreatedToExternalApi(responseOrder)
      .then((forwarded) => {
        if (forwarded.status === "failed") {
          console.warn("[order-forwarding] failed to send created order", {
            statusCode: forwarded.statusCode,
            reason: forwarded.reason,
          });
        }
      })
      .catch((forwardError: unknown) => {
        console.warn(
          "[order-forwarding] failed to send created order",
          forwardError instanceof Error ? forwardError.message : String(forwardError),
        );
      });
    return NextResponse.json(responseOrder, { status: 201 });
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
