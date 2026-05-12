"use client";

import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";
import {
  CMS_DEFAULT_PRODUCT_LANDING_PAGE,
  cmsProductLandingPageSchema,
  type CmsProductLandingPage,
} from "@/schemas/cms";
import { formatPriceEgp } from "@/lib/format";
import { cn } from "@/lib/utils";

type ControlProductSearchRow = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  permalink: string;
  imageUrl: string;
};

type ControlProductsResponse =
  | { products: ControlProductSearchRow[]; error?: undefined }
  | { error: string; products?: undefined };

type ControlLandingPageTabProps = {
  initial: CmsProductLandingPage;
  disabled: boolean;
  onSave: (doc: CmsProductLandingPage) => void;
};

function isoToDatetimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function datetimeLocalToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function initialSearchValue(initial: CmsProductLandingPage): string {
  return initial.productSlug?.trim() || (initial.productId ? String(initial.productId) : "");
}

export function ControlLandingPageTab({
  initial,
  disabled,
  onSave,
}: ControlLandingPageTabProps) {
  const normalizedInitial = useMemo(() => {
    const parsed = cmsProductLandingPageSchema.safeParse(initial);
    return parsed.success ? parsed.data : CMS_DEFAULT_PRODUCT_LANDING_PAGE;
  }, [initial]);
  const [search, setSearch] = useState(() => initialSearchValue(normalizedInitial));
  const [results, setResults] = useState<ControlProductSearchRow[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ControlProductSearchRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const savedPreviewHref = normalizedInitial.productSlug
    ? `/landing/${normalizedInitial.productSlug}`
    : null;
  const selectedPreviewHref = selectedProduct ? `/landing/${selectedProduct.slug}` : savedPreviewHref;

  async function searchProducts() {
    const q = search.trim();
    if (!q) {
      setSearchError("اكتب اسم المنتج أو ID أو slug الأول.");
      setResults([]);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `/api/control/products?search=${encodeURIComponent(q)}&per_page=8`,
        { credentials: "include" },
      );
      const json = (await res.json()) as ControlProductsResponse;
      if (!res.ok || "error" in json) {
        throw new Error(
          "error" in json && json.error ? json.error : "تعذر البحث عن المنتجات",
        );
      }
      const products = Array.isArray(json.products) ? json.products : [];
      setResults(products);
      setSelectedProduct(products[0] ?? null);
      if (products.length === 0) {
        setSearchError("لا توجد نتائج مطابقة في WooCommerce.");
      }
    } catch (error) {
      setResults([]);
      setSelectedProduct(null);
      setSearchError(error instanceof Error ? error.message : "خطأ شبكة");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const enabled = fd.get("enabled") === "on";
    const rawSearch = search.trim();
    const productSlug = selectedProduct?.slug || (/^\d+$/.test(rawSearch) ? "" : rawSearch);
    const productId = selectedProduct?.id ?? (/^\d+$/.test(rawSearch) ? Number(rawSearch) : undefined);

    if (enabled && !productSlug && !productId) {
      toast.error("اختار المنتج أو اكتب ID/slug قبل تفعيل الصفحة.");
      return;
    }

    const doc: CmsProductLandingPage = {
      enabled,
      productId,
      productSlug: productSlug || undefined,
      flashSale: {
        enabled: fd.get("flashEnabled") === "on",
        endsAt: datetimeLocalToIso(String(fd.get("endsAt") ?? "")),
        headline: String(fd.get("headline") ?? "").trim() || undefined,
        subline: String(fd.get("subline") ?? "").trim() || undefined,
      },
      customTitle: String(fd.get("customTitle") ?? "").trim() || undefined,
      customDescription: String(fd.get("customDescription") ?? "").trim() || undefined,
    };
    const parsed = cmsProductLandingPageSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((issue) => issue.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">صفحة هبوط لمنتج واحد</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            اختار منتج من WooCommerce، اضبط عداد الفلاش، وخد رابط صفحة مركّزة للبيع.
          </p>
        </div>
        {selectedPreviewHref ? (
          <Link
            href={selectedPreviewHref}
            target="_blank"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
          >
            معاينة الصفحة
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={normalizedInitial.enabled}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-950">
              تفعيل صفحة الهبوط
            </span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              عند التفعيل يظهر الرابط `/landing/[slug]` للمنتج المختار فقط.
            </span>
          </span>
        </label>

        <div className="rounded-2xl border border-slate-200 p-4">
          <label className="text-sm font-medium">اختيار المنتج</label>
          <ControlFieldHelp>
            اكتب اسم المنتج أو ID أو slug ثم اضغط بحث. اختيار نتيجة البحث يحفظ ID و slug معاً.
          </ControlFieldHelp>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="مثال: 123 أو اسم المنتج"
              className="min-h-11 flex-1 rounded-lg border border-border px-3 py-2"
              dir="auto"
            />
            <Button
              type="button"
              variant="secondary"
              loading={loading}
              disabled={disabled || loading}
              onClick={() => void searchProducts()}
            >
              <Search className="h-4 w-4" aria-hidden />
              بحث
            </Button>
          </div>
          {searchError ? (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {searchError}
            </p>
          ) : null}
          {results.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors",
                      selectedProduct?.id === product.id
                        ? "border-brand-400 bg-brand-50"
                        : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50",
                    )}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSearch(product.slug);
                    }}
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <AppImage
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-950">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500" dir="ltr">
                        ID {product.id} / {product.slug}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-brand-900">
                      {formatPriceEgp(product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              name="flashEnabled"
              defaultChecked={normalizedInitial.flashSale.enabled}
            />
            <span className="text-sm font-semibold">تفعيل عداد Flash Sale في صفحة الهبوط</span>
          </label>
          <div>
            <label className="text-sm font-medium">نهاية العرض (محلي)</label>
            <input
              type="datetime-local"
              name="endsAt"
              defaultValue={isoToDatetimeLocal(normalizedInitial.flashSale.endsAt)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">عنوان العداد</label>
            <input
              name="headline"
              defaultValue={normalizedInitial.flashSale.headline ?? ""}
              placeholder="عرض فلاش على المنتج"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">نص فرعي للعداد</label>
            <textarea
              name="subline"
              defaultValue={normalizedInitial.flashSale.subline ?? ""}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="خصم لفترة محدودة على المنتج المختار."
            />
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 p-4">
          <div>
            <label className="text-sm font-medium">عنوان مخصص اختياري</label>
            <input
              name="customTitle"
              defaultValue={normalizedInitial.customTitle ?? ""}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="لو فاضي هنستخدم اسم المنتج"
            />
          </div>
          <div>
            <label className="text-sm font-medium">وصف تسويقي اختياري</label>
            <textarea
              name="customDescription"
              defaultValue={normalizedInitial.customDescription ?? ""}
              rows={3}
              maxLength={1000}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="لو فاضي هنستخدم وصف المنتج من Woo"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={disabled}>
            {disabled ? "جاري الحفظ…" : "حفظ صفحة الهبوط"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => onSave(CMS_DEFAULT_PRODUCT_LANDING_PAGE)}
          >
            إيقاف ومسح الإعداد
          </Button>
        </div>
      </form>
    </section>
  );
}
