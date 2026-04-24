import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { createWooClient } from "@/lib/create-woo-client";
import { isWooEnvConfigured } from "@/lib/woo-diagnostics";
import { zodIssuesToJsonString } from "@/lib/zod-issues-compact";
import { wpProductSchema } from "@/schemas/wordpress";

/**
 * ‎GET: جلب حتى ‎100 منتج واختيار عيّنة عشوائية للتحقق من ‎`wpProductSchema`‎.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  if (!(await isWooEnvConfigured())) {
    return NextResponse.json(
      { error: "إعدادات Woo (الأصل/المفاتيح) غير مكتملة" },
      { status: 400 },
    );
  }

  let woo: Awaited<ReturnType<typeof createWooClient>>;
  try {
    woo = await createWooClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "client failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const t0 = Date.now();
  try {
    const res = await woo.get("/products", { params: { per_page: 100, status: "publish" } });
    const list = Array.isArray(res.data) ? res.data : [];
    if (list.length === 0) {
      return NextResponse.json(
        { error: "لا توجد منتجات منشورة", latencyMs: Date.now() - t0 },
        { status: 404 },
      );
    }
    const pick = list[Math.floor(Math.random() * list.length)] as unknown;
    const parsed = wpProductSchema.safeParse(pick);
    return NextResponse.json({
      ok: true,
      latencyMs: Date.now() - t0,
      productId: typeof (pick as { id?: unknown }).id === "number" ? (pick as { id: number }).id : null,
      schemaOk: parsed.success,
      zodErrors: parsed.success ? null : zodIssuesToJsonString(parsed.error),
      sample: parsed.success
        ? { id: parsed.data.id, name: parsed.data.name, slug: parsed.data.slug }
        : null,
    });
  } catch (e) {
    if (isAxiosError(e)) {
      return NextResponse.json(
        {
          error: e.message,
          httpStatus: e.response?.status ?? null,
          latencyMs: Date.now() - t0,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "عيّنة فشلت" },
      { status: 500 },
    );
  }
}
