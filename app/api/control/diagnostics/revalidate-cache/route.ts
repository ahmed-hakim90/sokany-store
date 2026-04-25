import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { ROUTES } from "@/lib/constants";
import {
  revalidateAfterExternalDataWebhook,
} from "@/lib/woocommerce-revalidate-broadcast";

/**
 * ‎POST: إبطال وسمي ‎Woo + مسارات كتالوج — نفس مبدأ الـ webhooks.
 */
export async function POST(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  revalidateAfterExternalDataWebhook();
  revalidatePath("/");
  revalidatePath(ROUTES.ORDER_TRACKING);
  revalidatePath(ROUTES.MY_ORDERS);
  revalidatePath(ROUTES.ACCOUNT);

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
