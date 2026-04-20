import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { wcStatusToTracking } from "@/features/order-tracking/wc-status-to-tracking";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import { normalizeDigits } from "@/lib/phone-digits";
import {
  trackOrderResponseSchema,
  type TrackOrderResponse,
} from "@/schemas/order-tracking";
import { wpOrderSchema, wpOrdersSchema } from "@/schemas/wordpress";

function deriveMockStepIndex(raw: string): number {
  const t = raw.trim();
  if (!t) return 0;
  let h = 0;
  for (let i = 0; i < t.length; i += 1) {
    h = (h + t.charCodeAt(i) * (i + 1)) % 10007;
  }
  return h % 4;
}

function mockResponse(q: string): TrackOrderResponse {
  const currentStepIndex = deriveMockStepIndex(q);
  const orderId = 80000 + ((currentStepIndex * 9973 + q.length * 13) % 9999);
  const badges = ["تم الاستلام", "قيد التجهيز", "جاري الشحن", "قيد التوصيل"] as const;
  return {
    found: true,
    orderId,
    query: q,
    dateCreated: new Date().toISOString(),
    currentStepIndex,
    allCompleted: false,
    terminal: null,
    statusBadge: badges[currentStepIndex] ?? "—",
    source: "mock",
  };
}

function isWooConfigured(): boolean {
  return Boolean(
    process.env.WC_BASE_URL &&
      process.env.WC_CONSUMER_KEY &&
      process.env.WC_CONSUMER_SECRET,
  );
}

async function fetchOrderById(
  woo: ReturnType<typeof createWooClient>,
  id: number,
) {
  try {
    const res = await woo.get(`/orders/${id}`);
    return wpOrderSchema.parse(res.data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

function phonesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const tail = (x: string, n: number) => x.slice(-Math.min(n, x.length));
  if (a.length >= 9 && b.length >= 9 && tail(a, 9) === tail(b, 9)) return true;
  if (a.length >= 10 && b.length >= 10 && tail(a, 10) === tail(b, 10))
    return true;
  return false;
}

async function findOrderByPhone(
  woo: ReturnType<typeof createWooClient>,
  digits: string,
) {
  if (digits.length < 8) return null;
  const searches = [digits, digits.slice(-10), digits.slice(-9)].filter(
    (s, i, arr) => s.length >= 4 && arr.indexOf(s) === i,
  );

  for (const search of searches) {
    const res = await woo.get("/orders", {
      params: {
        search,
        per_page: 50,
        orderby: "date",
        order: "desc",
      },
    });
    const parsed = wpOrdersSchema.safeParse(res.data);
    if (!parsed.success) continue;
    for (const order of parsed.data) {
      const phone = normalizeDigits(order.billing.phone ?? "");
      if (phonesMatch(phone, digits)) {
        return order;
      }
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const qRaw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (qRaw.length < 2 || qRaw.length > 80) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  if (USE_MOCK || !isWooConfigured()) {
    const body = trackOrderResponseSchema.parse(mockResponse(qRaw));
    return NextResponse.json(body);
  }

  try {
    const woo = createWooClient();
    const digits = normalizeDigits(qRaw);

    let order: Awaited<ReturnType<typeof fetchOrderById>> = null;

    const tryOrderId =
      /^\d+$/.test(digits) &&
      digits.length >= 3 &&
      digits.length <= 9 &&
      !digits.startsWith("0");

    if (tryOrderId) {
      order = await fetchOrderById(woo, parseInt(digits, 10));
    }

    if (!order && digits.length >= 8) {
      order = await findOrderByPhone(woo, digits);
    }

    if (!order) {
      const body = trackOrderResponseSchema.parse({ found: false });
      return NextResponse.json(body);
    }

    const t = wcStatusToTracking(order.status);
    const body = trackOrderResponseSchema.parse({
      found: true,
      orderId: order.id,
      query: qRaw,
      dateCreated: order.date_created,
      currentStepIndex: t.currentStepIndex,
      allCompleted: t.allCompleted,
      terminal: t.terminal,
      statusBadge: t.statusBadge,
      source: "woocommerce",
    });
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Track order failed" },
      { status: 500 },
    );
  }
}
