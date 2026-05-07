"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ControlAsyncState } from "@/features/control/components/control-page-chrome";
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

type DetailItem = {
  id: string;
  receivedAt: string;
  status: "processed" | "failed";
  topic: string | null;
  eventType: string | null;
  error: string | null;
  payloadExcerpt: string | null;
  zodValidationError: string | null;
  processingTimeMs: number | null;
  bodyBytes: number;
  bodySha256: string;
};

function shortHash(hex: string) {
  if (hex.length <= 12) return hex;
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}

function formatDeliveryTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("ar-EG", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatJsonish(s: string) {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
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
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);

  const openDetail = useCallback(async (id: string) => {
    setDetailError(null);
    setDetailLoadingId(id);
    try {
      const res = await fetch(
        `/api/control/woocommerce/webhook-deliveries?id=${encodeURIComponent(id)}`,
        { credentials: "include" },
      );
      const j = (await res.json()) as {
        ok?: boolean;
        item?: DetailItem;
        error?: string;
      };
      if (res.ok && j.item) {
        setDetail(j.item);
      } else {
        setDetailError(j.error ?? "تعذر فتح التفاصيل");
      }
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setDetailLoadingId(null);
    }
  }, []);

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

  if (loading || err || !data) {
    return (
      <ControlAsyncState
        loading={loading}
        error={err}
        loadingLabel="جاري جلب سجل الـ webhooks…"
        onRetry={() => void loadFirst()}
      />
    );
  }

  if (data.enabled === false) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          سجل آخر التحديثات
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {data.message ?? "حفظ السجل غير مفعل حاليًا، لذلك لن تظهر التحديثات الواردة هنا."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            سجل آخر التحديثات
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            هنا نرى آخر ما وصل من Woo إلى الموقع، وهل تم التعامل معه بنجاح أم حدثت مشكلة.
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
        <div className="p-5 text-sm text-slate-600">لا توجد تحديثات مسجلة بعد.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-600">
                <th className="px-3 py-2.5 font-medium sm:px-4">وقت الوصول</th>
                <th className="px-3 py-2.5 font-medium sm:px-4">نوع التحديث</th>
                <th className="px-3 py-2.5 font-medium sm:px-4">العنصر</th>
                <th className="px-3 py-2.5 font-medium sm:px-4">الحالة</th>
                <th className="hidden px-3 py-2.5 font-medium sm:table-cell sm:px-4" dir="ltr">
                  مرجع فني
                </th>
                <th className="px-3 py-2.5 font-medium sm:px-4">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 align-top font-mono text-[11px] text-slate-700 sm:px-4">
                    {formatDeliveryTime(row.receivedAt)}
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
                      <div className="text-[10px] text-slate-500" title="Webhook ID">
                        رقم الربط: {row.wcWebhookId}
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
                  <td className="px-3 py-2.5 align-top sm:px-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="border-slate-200 bg-white text-xs"
                      disabled={detailLoadingId === row.id}
                      onClick={() => void openDetail(row.id)}
                    >
                      {detailLoadingId === row.id ? "…" : "تفاصيل"}
                    </Button>
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
      {detailError ? (
        <div className="border-t border-rose-100 bg-rose-50/40 px-5 py-3 text-xs text-rose-900">
          {detailError}
        </div>
      ) : null}
      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200/80 bg-white px-5 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">تفاصيل الحدث</h2>
                <p className="text-xs text-slate-500" dir="ltr">
                  {detail.receivedAt} · {detail.id}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setDetail(null)}
                className="shrink-0"
              >
                إغلاق
              </Button>
            </div>
            <div className="max-h-[55vh] space-y-3 overflow-y-auto px-5 py-4" dir="rtl">
              {detail.error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-sm text-rose-900">
                  {detail.error}
                </div>
              ) : null}
              {detail.zodValidationError ? (
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase text-amber-800">Zod</p>
                  <pre
                    className="max-h-40 overflow-auto rounded-lg border border-amber-200/80 bg-amber-50/40 p-2 font-mono text-xs text-amber-950"
                    dir="ltr"
                  >
                    {formatJsonish(detail.zodValidationError)}
                  </pre>
                </div>
              ) : null}
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase text-slate-500">JSON (مقصوص في المخزن)</p>
                <pre
                  className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900"
                  dir="ltr"
                >
                  {detail.payloadExcerpt
                    ? formatJsonish(detail.payloadExcerpt)
                    : "—"}
                </pre>
              </div>
              <p className="text-xs text-slate-500" dir="ltr">
                {detail.bodyBytes} B · {detail.bodySha256.slice(0, 20)}…
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
