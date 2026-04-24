"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  receivedAt: string;
  status: "processed" | "failed";
  error: string | null;
  topic: string | null;
  resourceId: string | null;
  wcWebhookId: string | null;
  wcWebhookResource: string | null;
  bodySha256: string;
  bodyBytes: number;
};

type GetRes = {
  ok: boolean;
  enabled?: boolean;
  message?: string;
  items: Item[];
  nextCursor: string | null;
  error?: string;
};

function shortHash(hex: string) {
  if (hex.length <= 12) return hex;
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}

/**
 * سجل تسليمات ‎Woo (موقّعة) كما تُسجّل في ‎Firestore من الخادم.
 */
export function WooWebhookDeliveriesPanel() {
  const [data, setData] = useState<GetRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<Item[]>([]);

  const loadFirst = useCallback(async () => {
    setErr(null);
    setLoading(true);
    setCursor(null);
    setAllItems([]);
    try {
      const res = await fetch("/api/control/woocommerce/webhook-deliveries?limit=25", {
        credentials: "include",
      });
      const j = (await res.json()) as GetRes;
      if (!res.ok) {
        setErr(j.error ?? "تعذر التحميل");
        setData(null);
        return;
      }
      setData(j);
      setAllItems(j.items ?? []);
      setCursor(j.nextCursor ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطأ شبكة");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor) return;
    setMoreLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/control/woocommerce/webhook-deliveries?limit=25&cursor=${encodeURIComponent(cursor)}`,
        { credentials: "include" },
      );
      const j = (await res.json()) as GetRes;
      if (!res.ok) {
        setErr(j.error ?? "تعذر التحميل");
        return;
      }
      setData(j);
      setAllItems((prev) => [...prev, ...(j.items ?? [])]);
      setCursor(j.nextCursor ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطأ شبكة");
    } finally {
      setMoreLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    void loadFirst();
  }, [loadFirst]);

  if (loading) {
    return (
      <p className="text-sm text-slate-500">جاري جلب سجل الـ webhooks…</p>
    );
  }

  if (err) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950">
        {err}
        <div className="mt-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void loadFirst()}
            className="border-slate-200 bg-white text-xs"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (data.enabled === false) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          سجل التسليمات (Woo)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {data.message ?? "التسجيل في قاعدة البيانات غير مفعّل."} أضف ‎
          <code className="rounded bg-slate-100 px-1" dir="ltr">FIREBASE_SERVICE_ACCOUNT_JSON</code>{" "}
          ليظهر سجل آخر التسليمات الموقّعة هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            سجل التسليمات
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            آخر أحداث وصلت إلى ‎<span dir="ltr" className="font-mono text-[11px]">POST /api/webhooks/woocommerce</span>{" "}
            بعد التحقق من التوقيع. الحالة <strong>تمت المعالجة</strong> تعني إن إعادة توليد الكاش اكتملت
            دون خطأ.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 border-slate-200 bg-white text-sm shadow-sm"
          onClick={() => void loadFirst()}
        >
          تحديث
        </Button>
      </div>
      {allItems.length === 0 ? (
        <div className="p-5 text-sm text-slate-600">لا تسليمات مسجّلة بعد.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-600">
                <th className="px-3 py-2.5 font-medium sm:px-4">الوقت (UTC)</th>
                <th className="px-3 py-2.5 font-medium sm:px-4">الموضوع</th>
                <th className="px-3 py-2.5 font-medium sm:px-4">مورد</th>
                <th className="px-3 py-2.5 font-medium sm:px-4">الحالة</th>
                <th className="hidden px-3 py-2.5 font-medium sm:table-cell sm:px-4" dir="ltr">
                  body SHA-256
                </th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 align-top font-mono text-[11px] text-slate-700 sm:px-4">
                    {row.receivedAt}
                  </td>
                  <td
                    className="max-w-[10rem] truncate px-3 py-2.5 align-top font-mono text-xs text-slate-800 ltr:font-mono sm:max-w-none"
                    title={row.topic ?? ""}
                    dir="ltr"
                  >
                    {row.topic ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs text-slate-700 sm:px-4">
                    <div dir="ltr" className="font-mono">
                      {row.resourceId ?? "—"}
                    </div>
                    {row.wcWebhookId ? (
                      <div className="text-[10px] text-slate-500" title="X-WC-Webhook-ID">
                        wh #{row.wcWebhookId}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 align-top sm:px-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        row.status === "processed"
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/15"
                          : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-600/15",
                      )}
                    >
                      {row.status === "processed" ? "تمت" : "فشل"}
                    </span>
                    {row.error ? (
                      <p className="mt-1 max-w-[12rem] text-[11px] text-rose-800 sm:max-w-xs" title={row.error}>
                        {row.error}
                      </p>
                    ) : null}
                  </td>
                  <td
                    className="hidden max-w-[8rem] truncate px-3 py-2.5 align-top font-mono text-[10px] text-slate-500 sm:table-cell sm:px-4"
                    title={row.bodySha256}
                    dir="ltr"
                  >
                    {row.bodySha256 ? shortHash(row.bodySha256) : "—"}
                    <div className="text-slate-400">{row.bodyBytes} B</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {cursor ? (
        <div className="border-t border-slate-100 p-3 text-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="border-slate-200 bg-white"
            disabled={moreLoading}
            onClick={() => void loadMore()}
          >
            {moreLoading ? "…" : "تحميل أقدم"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
