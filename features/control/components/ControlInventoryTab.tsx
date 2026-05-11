"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArchiveX,
  CheckCircle2,
  ExternalLink,
  PackageSearch,
  RotateCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ControlAsyncState,
  ControlStatCard,
} from "@/features/control/components/control-page-chrome";
import { cn } from "@/lib/utils";

type InventoryFilter = "all" | "noQuantity" | "outofstock" | "instock";

type InventoryProductRow = {
  id: number;
  name: string;
  sku: string;
  permalink: string;
  status: string;
  catalogVisibility: string;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  stockQuantity: number | null;
  manageStock: boolean;
  price: string;
  categories: { id: number; name: string; slug: string }[];
  needsAttention: boolean;
  attentionReason: "outofstock" | "zeroQuantity" | "missingQuantity" | null;
};

type InventoryResponse = {
  products: InventoryProductRow[];
  summary: {
    visible: number;
    instock: number;
    noQuantity: number;
    outofstock: number;
  };
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  filter: InventoryFilter;
  search: string;
  truncated: boolean;
};

type InventoryErrorResponse = {
  error: string;
};

const FILTERS: { id: InventoryFilter; label: string; description: string }[] = [
  { id: "all", label: "الكل", description: "كل المنتجات الظاهرة" },
  { id: "noQuantity", label: "بدون كمية", description: "كمية صفر أو غير مسجلة" },
  { id: "outofstock", label: "غير متوفر", description: "مخفي عملياً من البيع" },
  { id: "instock", label: "متوفر", description: "متاح وكمّيته سليمة" },
];

const STOCK_STATUS_LABELS: Record<InventoryProductRow["stockStatus"], string> = {
  instock: "متوفر",
  outofstock: "غير متوفر",
  onbackorder: "طلب مسبق",
};

const ATTENTION_REASON_LABELS: Record<NonNullable<InventoryProductRow["attentionReason"]>, string> = {
  outofstock: "غير متوفر",
  zeroQuantity: "كمية صفر",
  missingQuantity: "كمية غير مسجلة",
};

function formatQuantity(row: InventoryProductRow): string {
  if (!row.manageStock) return "غير متتبع";
  if (row.stockQuantity == null) return "غير مسجلة";
  return String(row.stockQuantity);
}

function formatCategories(row: InventoryProductRow): string {
  if (row.categories.length === 0) return "بدون تصنيف";
  return row.categories.slice(0, 2).map((category) => category.name).join("، ");
}

function getRowTone(row: InventoryProductRow): "emerald" | "amber" | "rose" | "slate" {
  if (row.stockStatus === "outofstock") return "rose";
  if (row.needsAttention || row.stockStatus === "onbackorder") return "amber";
  if (row.stockStatus === "instock") return "emerald";
  return "slate";
}

function statusPillClass(row: InventoryProductRow): string {
  switch (getRowTone(row)) {
    case "emerald":
      return "border-success-border bg-success-surface text-success-foreground";
    case "rose":
      return "border-destructive-border bg-destructive-surface text-destructive-foreground";
    case "amber":
      return "border-warning-border bg-warning-surface text-warning-foreground";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

async function fetchInventory({
  page,
  filter,
  search,
}: {
  page: number;
  filter: InventoryFilter;
  search: string;
}): Promise<InventoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: "50",
    filter,
  });
  if (search.trim()) params.set("search", search.trim());

  const response = await fetch(`/api/control/products/inventory?${params.toString()}`, {
    credentials: "include",
  });
  const payload = (await response.json()) as InventoryResponse | InventoryErrorResponse;
  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "تعذر جلب أرصدة المنتجات.");
  }
  return payload;
}

export function ControlInventoryTab() {
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["control", "products", "inventory", { page, filter, search }],
    queryFn: () => fetchInventory({ page, filter, search }),
  });

  const products = query.data?.products ?? [];
  const pagination = query.data?.pagination;
  const summaryCards = useMemo(
    () => [
      {
        label: "منتجات ظاهرة",
        value: String(query.data?.summary.visible ?? 0),
        hint: "منشورة وليست مخفية من كتالوج WooCommerce.",
        tone: "brand" as const,
        icon: PackageSearch,
      },
      {
        label: "متوفر",
        value: String(query.data?.summary.instock ?? 0),
        hint: "حالة المخزون متوفر ولا تحتاج متابعة كمية.",
        tone: "emerald" as const,
        icon: CheckCircle2,
      },
      {
        label: "بدون كمية",
        value: String(query.data?.summary.noQuantity ?? 0),
        hint: "كمية صفر أو غير مسجلة مع تفعيل تتبع المخزون.",
        tone: "amber" as const,
        icon: AlertTriangle,
      },
      {
        label: "غير متوفر",
        value: String(query.data?.summary.outofstock ?? 0),
        hint: "حالة WooCommerce تساوي outofstock.",
        tone: "rose" as const,
        icon: ArchiveX,
      },
    ],
    [query.data],
  );

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <ControlStatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone}
            icon={item.icon}
          />
        ))}
      </div>

      <Card variant="summary" className="space-y-4 border-slate-200/90 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <form
            className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-sm font-medium text-slate-800">
                بحث بالاسم أو SKU
              </span>
              <span className="relative block">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  placeholder="مثال: سخان أو SKU"
                />
              </span>
            </label>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="dark" className="h-11">
                بحث
              </Button>
              {search ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  مسح
                </Button>
              ) : null}
            </div>
          </form>

          <Button
            type="button"
            variant="secondary"
            className="h-11 border-slate-200 bg-white"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RotateCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "rounded-2xl border px-3 py-3 text-start transition-colors",
                filter === item.id
                  ? "border-brand-300 bg-brand-50 text-slate-950 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
              onClick={() => {
                setFilter(item.id);
                setPage(1);
              }}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
            </button>
          ))}
        </div>
      </Card>

      {query.data?.truncated ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm leading-6 text-amber-950">
          تم عرض أول دفعات من WooCommerce فقط لأن عدد صفحات المنتجات كبير. استخدم البحث
          لتضييق النتائج لو منتج معين غير ظاهر هنا.
        </div>
      ) : null}

      <ControlAsyncState
        loading={query.isLoading}
        error={query.error instanceof Error ? query.error.message : null}
        empty={!query.isLoading && products.length === 0}
        emptyLabel="لا توجد منتجات مطابقة لهذه الفلاتر."
        onRetry={() => void query.refetch()}
      >
        <InventoryProductsList products={products} />
      </ControlAsyncState>

      {pagination ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            صفحة {pagination.page} من {pagination.totalPages} — إجمالي النتائج{" "}
            {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              السابق
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InventoryProductsList({ products }: { products: InventoryProductRow[] }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:hidden">
        {products.map((product) => (
          <InventoryProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">المنتج</th>
                <th className="px-4 py-3 text-start font-semibold">SKU</th>
                <th className="px-4 py-3 text-start font-semibold">التصنيف</th>
                <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold">الكمية</th>
                <th className="px-4 py-3 text-start font-semibold">السعر</th>
                <th className="px-4 py-3 text-start font-semibold">فتح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <InventoryProductTableRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryProductCard({ product }: { product: InventoryProductRow }) {
  return (
    <Card variant="summary" className="space-y-3 border-slate-200/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-slate-950">{product.name}</h3>
          <p className="mt-1 text-xs text-slate-500">
            SKU: {product.sku || "غير مسجل"} · {formatCategories(product)}
          </p>
        </div>
        <StatusPill product={product} />
      </div>
      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
        <InfoTile label="الكمية" value={formatQuantity(product)} />
        <InfoTile label="السعر" value={product.price || "غير مسجل"} />
        <InfoTile
          label="المتابعة"
          value={
            product.attentionReason
              ? ATTENTION_REASON_LABELS[product.attentionReason]
              : "سليم"
          }
        />
      </div>
      <ProductLink product={product} />
    </Card>
  );
}

function InventoryProductTableRow({ product }: { product: InventoryProductRow }) {
  return (
    <tr className="align-top text-slate-700">
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-950">{product.name}</div>
        <div className="mt-1 text-xs text-slate-500">
          #{product.id} · ظهور: {product.catalogVisibility}
        </div>
      </td>
      <td className="px-4 py-3">{product.sku || "غير مسجل"}</td>
      <td className="px-4 py-3">{formatCategories(product)}</td>
      <td className="px-4 py-3">
        <StatusPill product={product} />
      </td>
      <td className="px-4 py-3">{formatQuantity(product)}</td>
      <td className="px-4 py-3">{product.price || "غير مسجل"}</td>
      <td className="px-4 py-3">
        <ProductLink product={product} compact />
      </td>
    </tr>
  );
}

function StatusPill({ product }: { product: InventoryProductRow }) {
  const note = product.attentionReason
    ? ATTENTION_REASON_LABELS[product.attentionReason]
    : STOCK_STATUS_LABELS[product.stockStatus];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusPillClass(product),
      )}
    >
      {note}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ProductLink({
  product,
  compact = false,
}: {
  product: InventoryProductRow;
  compact?: boolean;
}) {
  if (!product.permalink) {
    return <span className="text-xs text-slate-400">لا يوجد رابط</span>;
  }
  return (
    <a
      href={product.permalink}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50",
        compact && "px-2.5 py-1.5 text-xs",
      )}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      فتح المنتج
    </a>
  );
}
