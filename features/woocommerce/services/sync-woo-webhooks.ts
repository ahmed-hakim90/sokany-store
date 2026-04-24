import "server-only";

import { isAxiosError } from "axios";
import { z } from "zod";
import { createWooClient } from "@/lib/create-woo-client";
import { resolveWooCommerceWebhookUrl } from "@/lib/storefront-origin";
import { SOKANY_WOO_WEBHOOK_RECIPES } from "@/features/woocommerce/woo-webhook-topics";

const wooWebhookRowSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  topic: z.string(),
  status: z.string().optional(),
  delivery_url: z.string().min(1),
});

const wooWebhooksListSchema = z.array(wooWebhookRowSchema);

function normalizeUrl(u: string): string {
  return u.replace(/\/$/, "").toLowerCase();
}

export type WooWebhookRow = z.infer<typeof wooWebhookRowSchema>;

export type SyncWooWebhooksResult = {
  deliveryUrl: string;
  created: { topic: string; id: number }[];
  skipped: { topic: string; reason: string }[];
  failed: { topic: string; message: string }[];
};

/**
 * ينشئ Webhooks مفقودة لعنوان التوصيل الحالي ويعيد تفعيل المُعلّقة.
 */
export async function syncSokanyWebhooksToWoo(): Promise<SyncWooWebhooksResult> {
  const deliveryUrl = await resolveWooCommerceWebhookUrl();
  const secret = process.env.WC_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("أضف WC_WEBHOOK_SECRET في البيئة (نفس السر في Woo).");
  }

  const woo = await createWooClient();
  const res = await woo.get("/webhooks", { params: { per_page: 100 } });
  const listParsed = wooWebhooksListSchema.safeParse(res.data);
  const existing: WooWebhookRow[] = listParsed.success ? listParsed.data : [];
  const target = normalizeUrl(deliveryUrl);

  const created: SyncWooWebhooksResult["created"] = [];
  const skipped: SyncWooWebhooksResult["skipped"] = [];
  const failed: SyncWooWebhooksResult["failed"] = [];

  for (const recipe of SOKANY_WOO_WEBHOOK_RECIPES) {
    const sameDelivery = (w: WooWebhookRow) =>
      normalizeUrl(w.delivery_url) === target;
    const match = existing.find(
      (w) => w.topic === recipe.topic && sameDelivery(w),
    );

    if (match) {
      if (match.status === "paused" || match.status === "disabled") {
        try {
          await woo.put(`/webhooks/${match.id}`, { status: "active" });
          skipped.push({ topic: recipe.topic, reason: "تفعيل Webhook موجود" });
        } catch (e) {
          const msg = axiosErrorMessage(e);
          failed.push({ topic: recipe.topic, message: msg });
        }
        continue;
      }
      skipped.push({ topic: recipe.topic, reason: "موجود بالفعل" });
      continue;
    }

    try {
      const createRes = await woo.post("/webhooks", {
        name: recipe.name,
        topic: recipe.topic,
        delivery_url: deliveryUrl,
        secret,
        status: "active",
      });
      const data = createRes.data as { id?: unknown };
      const id = typeof data.id === "number" ? data.id : Number(data.id);
      if (Number.isFinite(id)) {
        created.push({ topic: recipe.topic, id: id as number });
      } else {
        failed.push({ topic: recipe.topic, message: "رد ووردبريس بلا id صالح" });
      }
    } catch (e) {
      failed.push({ topic: recipe.topic, message: axiosErrorMessage(e) });
    }
  }

  return { deliveryUrl, created, skipped, failed };
}

function axiosErrorMessage(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (d != null && typeof d === "object" && "message" in d) {
      return String((d as { message: unknown }).message);
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "خطأ غير معروف";
}

export type ListSokanyWebhooksResult = {
  deliveryUrl: string;
  sokanyWebhooks: WooWebhookRow[];
  allCount: number;
};

/**
 * يرجع الـ webhooks الموجهة لنفس ‎`deliveryUrl`‎ الحالي (للعرض في اللوحة).
 */
export async function listSokanyWooWebhooksOnStore(): Promise<ListSokanyWebhooksResult> {
  const deliveryUrl = await resolveWooCommerceWebhookUrl();
  const target = normalizeUrl(deliveryUrl);
  const woo = await createWooClient();
  const res = await woo.get("/webhooks", { params: { per_page: 100 } });
  const listParsed = wooWebhooksListSchema.safeParse(res.data);
  const all = listParsed.success ? listParsed.data : [];
  const sokanyWebhooks = all.filter(
    (w) => normalizeUrl(w.delivery_url) === target,
  );
  return { deliveryUrl, sokanyWebhooks, allCount: all.length };
}
