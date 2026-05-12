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
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveFawryConfig } from "@/lib/payment-gateways-store";
import { initiateFawryCharge } from "@/lib/payment/fawry";
import { toAbsoluteSiteUrl } from "@/lib/site";

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  orderTotal: z.number().positive(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(6),
  customerEmail: z.string().optional().default(""),
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

  const config = await resolveFawryConfig();
  if (!config || !config.enabled) {
    return NextResponse.json(
      { error: "بوابة فوري غير مفعّلة" },
      { status: 503 },
    );
  }

  const { orderId, orderTotal, customerName, customerPhone, customerEmail } =
    parsed.data;

  const merchantRefNum = `sokany-${orderId}-${Date.now()}`;
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
    });

    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (e) {
    console.error("[POST /api/payments/fawry]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "تعذر بدء الدفع عبر فوري" },
      { status: 502 },
    );
  }
}
