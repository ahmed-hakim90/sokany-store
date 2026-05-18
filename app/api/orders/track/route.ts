/**
 * تتبع طلب (عام أو بكاش)
 * بالعامية: البحث برقم/مفتاح مع دعم mock ووسم كاش للطلبات؛ بيحوّل حالة Woo لخطوات عرض للمتسوق.
 */
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { wcStatusToTracking } from "@/features/order-tracking/wc-status-to-tracking";
import { createWooClient } from "@/lib/create-woo-client";
import { isWooEnvConfigured } from "@/lib/woo-diagnostics";
import { USE_MOCK } from "@/lib/constants";
import { normalizeDigits } from "@/lib/phone-digits";
import { toAbsoluteSiteUrl } from "@/lib/site";
import { parsePrice } from "@/lib/utils";
import { WOO_CACHE_TAG_ORDERS } from "@/lib/woocommerce-cache-tags";
import { enforceOrderTrackingRateLimit } from "@/lib/public-api-rate-limit";
import {
  fetchAndVerifyGuestOrder,
  GuestOrderAccessError,
  type WCOrderParsed,
} from "@/features/orders/lib/guest-order-server";
import {
  trackOrderResponseSchema,
  type TrackOrderResponse,
} from "@/schemas/order-tracking";

const PLACEHOLDER_PATH = "/images/placeholder.png";

function deriveMockStepIndex(raw: string): number {
  const t = raw.trim();
  if (!t) return 0;
  let h = 0;
  for (let i = 0; i < t.length; i += 1) {
    h = (h + t.charCodeAt(i) * (i + 1)) % 10007;
  }
  return h % 5;
}

function mockResponse(q: string): TrackOrderResponse {
  const currentStepIndex = deriveMockStepIndex(q);
  const orderId = 80000 + ((currentStepIndex * 9973 + q.length * 13) % 9999);
  const badges = ["تم الاستلام", "قيد التجهيز", "جاري الشحن", "في الطريق", "تم التوصيل"] as const;
  return {
    found: true,
    orderId,
    orderNumber: `SK-2024-${orderId}`,
    query: q,
    dateCreated: new Date().toISOString(),
    currentStepIndex,
    allCompleted: currentStepIndex === 4,
    terminal: null,
    statusBadge: badges[currentStepIndex] ?? "—",
    paymentMethodTitle: "الدفع عند الاستلام",
    subtotal: 3498,
    shippingTotal: 0,
    total: 3300,
    discount: 198,
    items: [
      {
        productId: 1088,
        name: "Sokany Air Fryer SK-1008",
        quantity: 1,
        price: 2499,
        total: 2499,
        image: toAbsoluteSiteUrl(PLACEHOLDER_PATH),
      },
      {
        productId: 1022,
        name: "Sokany Blender SK-022",
        quantity: 1,
        price: 999,
        total: 999,
        image: toAbsoluteSiteUrl(PLACEHOLDER_PATH),
      },
    ],
    shipping: {
      name: "أحمد محمد",
      phone: "+20 100 123 4567",
      address1: "مدينة نصر، شارع الثورة",
      address2: "عمارة 12، الدور 3",
      city: "القاهرة",
      state: "القاهرة",
      postcode: "11371",
    },
    carrier: {
      name: "Bosta Express",
      trackingNumber: "BOS123456789EG",
      trackingUrl: "https://bosta.co/tracking",
    },
    source: "mock",
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringFromUnknown(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function firstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = stringFromUnknown(record[key]);
    if (value) return value;
  }
  return "";
}

function findMetaValue(
  meta: Array<{ key: string; value: unknown }> | null | undefined,
  keys: string[],
): unknown {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  const entry = meta?.find((item) => wanted.has(item.key.trim().toLowerCase()));
  return entry?.value;
}

function findMetaString(
  meta: Array<{ key: string; value: unknown }> | null | undefined,
  keys: string[],
): string {
  return stringFromUnknown(findMetaValue(meta, keys));
}

function extractCarrier(meta: Array<{ key: string; value: unknown }> | null | undefined) {
  const shipmentItems = findMetaValue(meta, [
    "_wc_shipment_tracking_items",
    "wc_shipment_tracking_items",
    "shipment_tracking_items",
  ]);
  const firstShipment = Array.isArray(shipmentItems) ? asRecord(shipmentItems[0]) : null;

  const name =
    (firstShipment
      ? firstString(firstShipment, [
          "tracking_provider",
          "custom_tracking_provider",
          "provider",
          "carrier",
          "carrier_name",
        ])
      : "") ||
    findMetaString(meta, [
      "carrier_name",
      "shipping_carrier",
      "tracking_provider",
      "bosta_carrier",
      "bosta_provider",
    ]);

  const trackingNumber =
    (firstShipment
      ? firstString(firstShipment, [
          "tracking_number",
          "tracking_id",
          "awb",
          "consignment_number",
        ])
      : "") ||
    findMetaString(meta, [
      "tracking_number",
      "_tracking_number",
      "bosta_tracking_id",
      "bosta_tracking_number",
      "awb",
      "consignment_number",
    ]);

  const trackingUrl =
    (firstShipment
      ? firstString(firstShipment, [
          "custom_tracking_link",
          "tracking_link",
          "tracking_url",
        ])
      : "") ||
    findMetaString(meta, ["tracking_url", "tracking_link", "bosta_tracking_url"]);

  if (!name && !trackingNumber && !trackingUrl) return undefined;

  return {
    name: name || "شركة الشحن",
    trackingNumber,
    trackingUrl,
  };
}

async function trackOrderUncached(
  qRaw: string,
  orderKeyRaw: string,
): Promise<TrackOrderResponse> {
  if (USE_MOCK) {
    return trackOrderResponseSchema.parse(mockResponse(qRaw));
  }

  if (!(await isWooEnvConfigured())) {
    return trackOrderResponseSchema.parse(mockResponse(qRaw));
  }

  const woo = await createWooClient();
  const digits = normalizeDigits(qRaw);
  const orderKey = orderKeyRaw.trim();

  let order: WCOrderParsed | null = null;

  const tryOrderId =
    /^\d+$/.test(digits) &&
    digits.length >= 3 &&
    digits.length <= 9 &&
    !digits.startsWith("0");

  if (tryOrderId && orderKey) {
    try {
      order = await fetchAndVerifyGuestOrder(woo, parseInt(digits, 10), orderKey);
    } catch (e) {
      if (e instanceof GuestOrderAccessError) {
        return trackOrderResponseSchema.parse({ found: false });
      }
      throw e;
    }
  }

  if (!order) {
    return trackOrderResponseSchema.parse({ found: false });
  }

  const t = wcStatusToTracking(order.status);
  const subtotal = parsePrice(order.subtotal);
  const shippingTotal = parsePrice(order.shipping_total);
  const total = parsePrice(order.total);
  const discount = Math.max(0, subtotal + shippingTotal - total);
  const shippingName =
    [order.shipping.first_name, order.shipping.last_name].filter(Boolean).join(" ").trim() ||
    [order.billing.first_name, order.billing.last_name].filter(Boolean).join(" ").trim();

  return trackOrderResponseSchema.parse({
    found: true,
    orderId: order.id,
    orderNumber:
      typeof order.number === "string" && order.number.trim()
        ? order.number.trim()
        : String(order.id),
    query: qRaw,
    dateCreated: order.date_created,
    currentStepIndex: t.currentStepIndex,
    allCompleted: t.allCompleted,
    terminal: t.terminal,
    statusBadge: t.statusBadge,
    paymentMethodTitle: order.payment_method_title,
    subtotal,
    shippingTotal,
    total,
    discount,
    items: order.line_items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      quantity: item.quantity,
      price: parsePrice(item.price),
      total: parsePrice(item.total),
      image: toAbsoluteSiteUrl(item.image?.src ?? PLACEHOLDER_PATH),
    })),
    shipping: {
      name: shippingName,
      phone: order.billing.phone,
      address1: order.shipping.address_1 || order.billing.address_1,
      address2: order.shipping.address_2 || order.billing.address_2,
      city: order.shipping.city || order.billing.city,
      state: order.shipping.state || order.billing.state,
      postcode: order.shipping.postcode || order.billing.postcode,
    },
    carrier: extractCarrier(order.meta_data),
    source: "woocommerce",
  });
}

const trackOrderCached = unstable_cache(
  async (qRaw: string, orderKey: string) => trackOrderUncached(qRaw, orderKey),
  ["woo-order-tracking-v2"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_ORDERS] },
);

export async function GET(request: NextRequest) {
  const limited = enforceOrderTrackingRateLimit(request);
  if (limited) return limited;

  const qRaw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const orderKey = request.nextUrl.searchParams.get("k")?.trim() ?? "";
  if (qRaw.length < 2 || qRaw.length > 80) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const body = await trackOrderCached(qRaw, orderKey);
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Track order failed" },
      { status: 500 },
    );
  }
}
