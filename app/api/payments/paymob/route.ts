/**
 * POST /api/payments/paymob
 * ينفذ الخطوات الثلاث لباي موب ويُعيد رابط iframe الدفع.
 *
 * الجسم المتوقع:
 *   orderId       معرف طلب Woo
 *   orderTotal    إجمالي الطلب (جنيه مصري)
 *   customerName  الاسم الكامل
 *   customerPhone رقم الموبايل
 *   customerEmail البريد الإلكتروني
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolvePaymobConfig } from "@/lib/payment-gateways-store";
import { initiatePaymobPayment } from "@/lib/payment/paymob";

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  orderTotal: z.number().positive(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(6),
  customerEmail: z.string().optional().default(""),
  shippingCity: z.string().optional().default(""),
  shippingState: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات الطلب غير صحيحة", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const config = await resolvePaymobConfig();
  if (!config || !config.enabled) {
    return NextResponse.json(
      { error: "بوابة باي موب غير مفعّلة" },
      { status: 503 },
    );
  }

  const {
    orderId,
    orderTotal,
    customerName,
    customerPhone,
    customerEmail,
    shippingCity,
    shippingState,
  } = parsed.data;

  const [firstName, ...rest] = customerName.trim().split(" ");
  const lastName = rest.join(" ") || firstName;

  try {
    const result = await initiatePaymobPayment(config, {
      merchantOrderId: `sokany-${orderId}`,
      amountCents: Math.round(orderTotal * 100),
      billingData: {
        firstName,
        lastName,
        email: customerEmail || `order-${orderId}@sokany-eg.com`,
        phoneNumber: customerPhone,
        city: shippingCity || "NA",
        state: shippingState || "NA",
        country: "EG",
      },
    });

    return NextResponse.json({ iframeUrl: result.iframeUrl });
  } catch (e) {
    console.error("[POST /api/payments/paymob]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "تعذر بدء الدفع عبر باي موب" },
      { status: 502 },
    );
  }
}
