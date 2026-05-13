/**
 * POST /api/payments/fawry
 * يُنشئ جلسة دفع فوري لطلب Woo موجود ويُعيد رابط إعادة التوجيه.
 *
 * الجسم المتوقع:
 *   orderId       معرف طلب Woo الصحيح
 *   orderTotal    إجمالي الطلب (جنيه مصري)
 *   customerName  اسم العميل
 *   customerPhone  رقم الموبايل
 *   customerEmail  البريد الإلكتروني (أو سلسلة فارغة)
 */
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveFawryConfig } from "@/lib/payment-gateways-store";
import { FawryChargeError, initiateFawryCharge } from "@/lib/payment/fawry";
import { toAbsoluteSiteUrl } from "@/lib/site";

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  orderTotal: z.number().positive(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(6),
  customerEmail: z.string().optional().default(""),
});

function createFawryMerchantRefNum(orderId: number): string {
  return `sokany-${orderId}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
}

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات الطلب غير صحيحة", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const config = await resolveFawryConfig();
  if (!config || !config.enabled) {
    return NextResponse.json(
      { error: "بوابة فوري غير مفعّلة" },
      { status: 503 },
    );
  }

  const { orderId, orderTotal, customerName, customerPhone, customerEmail } =
    parsed.data;

  /*
   * Fawry treats merchantRefNum as a charge reference. Keep the order id
   * extractable, but make each hosted-payment attempt unique for safe retries.
   */
  const merchantRefNum = createFawryMerchantRefNum(orderId);
  const callbackUrl = toAbsoluteSiteUrl(
    `/api/payments/fawry/callback?ref=${encodeURIComponent(merchantRefNum)}`,
  );

  try {
    const result = await initiateFawryCharge(config, {
      merchantRefNum,
      customerName,
      customerMobile: customerPhone,
      customerEmail: customerEmail || `order-${orderId}@sokany-eg.com`,
      chargeItems: [
        {
          itemId: String(orderId),
          description: `طلب رقم ${orderId}`,
          price: orderTotal,
          quantity: 1,
        },
      ],
      returnUrl: callbackUrl,
      ...(config.hostedPaymentMethod ? { paymentMethod: config.hostedPaymentMethod } : {}),
    });

    return NextResponse.json({
      provider: "fawry",
      redirectUrl: result.redirectUrl,
      paymentMethod: result.paymentMethod,
      referenceNumber: result.referenceNumber,
      merchantRefNum: result.merchantRefNum,
      message: "تم إنشاء جلسة الدفع عبر فوري.",
    });
  } catch (e) {
    console.error("[POST /api/payments/fawry]", e);
    if (e instanceof FawryChargeError) {
      return NextResponse.json(
        {
          error: e.userMessage,
          code: e.code,
          fawryStatusCode: e.fawryStatusCode,
          statusDescription: e.statusDescription,
          classification: e.classification,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "تعذر بدء الدفع عبر فوري" },
      { status: 502 },
    );
  }
}
