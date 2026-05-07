import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { getMaskedWooCredentialHints } from "@/lib/mask-woo-credential";

/**
 * إخفاء قيم WC المسرّبة قبل إرسالها للعميل (لوحة الصحة).
 * استبدل قراءة الـenv المباشرة من /control/dev بعد دمج الصفحة في تبويب.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(getMaskedWooCredentialHints());
}
