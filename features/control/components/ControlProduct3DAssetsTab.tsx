"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PackageSearch,
  RotateCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product3DButton } from "@/features/products/components/Product3DButton";
import { ControlAsyncState, ControlStatCard } from "@/features/control/components/control-page-chrome";
import { normalizeProductSku } from "@/lib/product-3d-map";
import { cn } from "@/lib/utils";

type Control3DProductRow = {
  id: number;
  name: string;
  sku: string;
  permalink: string;
  price: string;
  stockStatus: "instock" | "outofstock" | "onbackorder";
};

type Product3DAsset = {
  sku: string;
  productId?: string | number;
  productName?: string;
  modelUrl: string;
  storagePath: string;
  posterUrl?: string;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

type AssetsResponse = { assets: Product3DAsset[] } | { error: string };
type InventoryResponse =
  | { products: Control3DProductRow[] }
  | { error: string };

const ASSETS_QUERY_KEY = ["control", "products", "3d-assets"] as const;
const ACCEPT_3D = ".glb,.gltf,model/gltf-binary,model/gltf+json";
const WARN_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isAllowed3DFile(file: File): boolean {
  return /\.(glb|gltf)$/i.test(file.name);
}

async function fetchAssets(): Promise<Product3DAsset[]> {
  const response = await fetch("/api/control/products/3d-assets", {
    credentials: "include",
  });
  const payload = (await response.json()) as AssetsResponse;
  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "تعذر جلب نماذج 3D");
  }
  return payload.assets;
}

async function fetchProducts(search: string): Promise<Control3DProductRow[]> {
  const params = new URLSearchParams({
    page: "1",
    per_page: "20",
    filter: "all",
    search,
  });
  const response = await fetch(`/api/control/products/inventory?${params.toString()}`, {
    credentials: "include",
  });
  const payload = (await response.json()) as InventoryResponse;
  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "تعذر البحث في المنتجات");
  }
  return payload.products;
}

function uploadProduct3DAsset({
  file,
  sku,
  product,
  posterUrl,
  enabled,
  onProgress,
}: {
  file: File;
  sku: string;
  product: Control3DProductRow | null;
  posterUrl: string;
  enabled: boolean;
  onProgress: (value: number) => void;
}): Promise<Product3DAsset> {
  const contentType =
    file.type ||
    (file.name.toLowerCase().endsWith(".glb") ? "model/gltf-binary" : "model/gltf+json");

  return fetch("/api/control/products/3d-assets/upload-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sku,
      filename: file.name,
      contentType,
    }),
  })
    .then(async (response) => {
      const payload = (await response.json()) as {
        uploadUrl?: string;
        storagePath?: string;
        contentType?: string;
        error?: string;
      };
      if (!response.ok || !payload.uploadUrl || !payload.storagePath || !payload.contentType) {
        throw new Error(payload.error ?? "تعذر تجهيز رابط رفع نموذج 3D");
      }
      return payload as {
        uploadUrl: string;
        storagePath: string;
        contentType: string;
      };
    })
    .then(
      (prepared) =>
        new Promise<typeof prepared>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", prepared.uploadUrl);
          xhr.setRequestHeader("Content-Type", prepared.contentType);
          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            onProgress(Math.round((event.loaded / event.total) * 92));
          };
          xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300) {
              reject(
                new Error(
                  xhr.status === 0
                    ? "تعذر الرفع المباشر إلى Firebase. راجع إعداد CORS للـ Storage bucket."
                    : `فشل الرفع المباشر (${xhr.status})`,
                ),
              );
              return;
            }
            onProgress(94);
            resolve(prepared);
          };
          xhr.onerror = () =>
            reject(
              new Error(
                "تعذر الرفع المباشر إلى Firebase. غالباً يحتاج Storage CORS يسمح بـ PUT من نطاق لوحة التحكم.",
              ),
            );
          xhr.send(file);
        }),
    )
    .then(async (prepared) => {
      const response = await fetch("/api/control/products/3d-assets/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          filename: file.name,
          storagePath: prepared.storagePath,
          productId: product?.id,
          productName: product?.name,
          posterUrl: posterUrl.trim() || undefined,
          enabled,
        }),
      });
      const payload = (await response.json()) as { asset?: Product3DAsset; error?: string };
      if (!response.ok || !payload.asset) {
        throw new Error(payload.error ?? "تم الرفع لكن تعذر حفظ بيانات نموذج 3D");
      }
      onProgress(100);
      return payload.asset;
    });
}

async function updateAssetEnabled(sku: string, enabled: boolean): Promise<Product3DAsset> {
  const response = await fetch(
    `/api/control/products/3d-assets/${encodeURIComponent(sku)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    },
  );
  const payload = (await response.json()) as { asset?: Product3DAsset; error?: string };
  if (!response.ok || !payload.asset) {
    throw new Error(payload.error ?? "تعذر تحديث حالة نموذج 3D");
  }
  return payload.asset;
}

async function deleteAsset(sku: string): Promise<void> {
  const response = await fetch(
    `/api/control/products/3d-assets/${encodeURIComponent(sku)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "تعذر حذف نموذج 3D");
  }
}

export function ControlProduct3DAssetsTab() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Control3DProductRow | null>(null);
  const [skuInput, setSkuInput] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [lastUploaded, setLastUploaded] = useState<Product3DAsset | null>(null);

  const assetsQuery = useQuery({
    queryKey: ASSETS_QUERY_KEY,
    queryFn: fetchAssets,
  });

  const productQuery = useQuery({
    queryKey: ["control", "products", "3d-search", search],
    queryFn: () => fetchProducts(search),
    enabled: search.trim().length > 0,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const normalizedSku = normalizeProductSku(skuInput || selectedProduct?.sku);
      if (!normalizedSku) {
        throw new Error("اكتب SKU أو اختر منتجاً من البحث");
      }
      if (!file) {
        throw new Error(editingSku ? "اختر ملفاً جديداً لاستبدال النموذج" : "اختر ملف GLB أو GLTF");
      }
      if (!isAllowed3DFile(file)) {
        throw new Error("يسمح فقط بملفات .glb أو .gltf");
      }
      return uploadProduct3DAsset({
        file,
        sku: normalizedSku,
        product: selectedProduct,
        posterUrl,
        enabled,
        onProgress: setUploadProgress,
      });
    },
    onMutate: () => {
      setUploadProgress(0);
    },
    onSuccess: async (asset) => {
      setLastUploaded(asset);
      setFile(null);
      setEditingSku(null);
      setUploadProgress(100);
      toast.success("تم حفظ نموذج 3D وربطه بالـ SKU");
      await queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "فشل حفظ نموذج 3D");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ sku, next }: { sku: string; next: boolean }) =>
      updateAssetEnabled(sku, next),
    onSuccess: async () => {
      toast.success("تم تحديث حالة النموذج");
      await queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث الحالة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: async () => {
      toast.success("تم حذف نموذج 3D");
      await queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "تعذر الحذف");
    },
  });

  const assets = useMemo(() => assetsQuery.data ?? [], [assetsQuery.data]);
  const stats = useMemo(
    () => [
      {
        label: "نماذج مسجلة",
        value: String(assets.length),
        hint: "إجمالي ملفات 3D المرتبطة بمنتجات.",
        tone: "brand" as const,
        icon: PackageSearch,
      },
      {
        label: "مفعّلة",
        value: String(assets.filter((asset) => asset.enabled).length),
        hint: "هذه فقط تظهر كزر 360° في صفحة المنتج.",
        tone: "emerald" as const,
        icon: PackageSearch,
      },
      {
        label: "معطّلة",
        value: String(assets.filter((asset) => !asset.enabled).length),
        hint: "محفوظة في اللوحة لكنها مخفية عن واجهة المتجر.",
        tone: "amber" as const,
        icon: PackageSearch,
      },
    ],
    [assets],
  );
  const fileWarning =
    file && file.size > WARN_BYTES
      ? `تنبيه: حجم الملف ${formatBytes(file.size)}. الأفضل إبقاء نماذج 3D أقل من 5MB للموبايل.`
      : null;

  function selectProduct(product: Control3DProductRow) {
    setSelectedProduct(product);
    setSkuInput(product.sku);
    setSearchInput(product.name);
  }

  function startReplace(asset: Product3DAsset) {
    setEditingSku(asset.sku);
    setSkuInput(asset.sku);
    setPosterUrl(asset.posterUrl ?? "");
    setEnabled(asset.enabled);
    setSelectedProduct(
      asset.productName || asset.productId
        ? {
            id: Number(asset.productId ?? 0),
            name: asset.productName ?? asset.sku,
            sku: asset.sku,
            permalink: "",
            price: "",
            stockStatus: "instock",
          }
        : null,
    );
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="space-y-6" dir="rtl">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-300">
            3D Asset Studio
          </p>
          <h2 className="mt-1 font-display text-xl font-black">
            {editingSku ? `استبدال نموذج SKU: ${editingSku}` : "ربط نموذج 3D بمنتج"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-white/70">
            ابحث عن المنتج أو اكتب SKU يدوياً، ثم ارفع ملف GLB/GLTF. الواجهة لا تحمل النموذج إلا بعد فتح المعاينة.
          </p>
        </div>

        <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:p-5">
          <div className="space-y-4">
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                setSelectedProduct(null);
                setSearch(searchInput.trim());
              }}
            >
              <label className="min-w-0 flex-1">
                <span className="mb-1 block text-sm font-bold text-slate-800">
                  بحث بالاسم أو SKU
                </span>
                <span className="relative block">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pe-3 ps-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="مثال: sk-1008 أو اسم المنتج"
                    dir="auto"
                  />
                </span>
              </label>
              <Button type="submit" variant="dark" className="h-12">
                بحث
              </Button>
            </form>

            {search ? (
              <ControlAsyncState
                loading={productQuery.isLoading}
                error={productQuery.error instanceof Error ? productQuery.error.message : null}
                empty={!productQuery.isLoading && (productQuery.data?.length ?? 0) === 0}
                emptyLabel="لا توجد منتجات مطابقة. يمكنك استخدام SKU اليدوي."
                onRetry={() => void productQuery.refetch()}
              >
                <ul className="grid gap-2">
                  {(productQuery.data ?? []).map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-2xl border p-3 text-start transition-colors",
                          selectedProduct?.id === product.id
                            ? "border-brand-300 bg-brand-50"
                            : "border-slate-200 bg-slate-50/60 hover:bg-white",
                        )}
                        onClick={() => selectProduct(product)}
                      >
                        <span className="block font-display text-sm font-black text-slate-950">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500" dir="ltr">
                          SKU: {product.sku || "غير مسجل"} · #{product.id}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </ControlAsyncState>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-sm font-bold text-slate-800">
                  SKU يدوي أو من المنتج المختار
                </span>
                <input
                  value={skuInput}
                  onChange={(event) => {
                    setSkuInput(event.target.value);
                    setSelectedProduct(null);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-3 font-mono text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  placeholder="sk-1008"
                  dir="ltr"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold text-slate-800">
                  Poster URL اختياري
                </span>
                <input
                  value={posterUrl}
                  onChange={(event) => setPosterUrl(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  placeholder="https://..."
                  dir="ltr"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-bold text-slate-950">
                  تفعيل زر 360° على صفحة المنتج بعد الحفظ
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  عند إلغاء التفعيل يبقى الملف محفوظاً لكن زر 3D لا يظهر للعميل.
                </span>
              </span>
            </label>

            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center transition hover:bg-slate-50">
              <Upload className="mx-auto h-9 w-9 text-slate-400" />
              <span className="mt-3 block text-sm font-black text-slate-950">
                اختر ملف GLB أو GLTF
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                تحذير فوق 5MB للأداء، بدون منع حجم من اللوحة.
              </span>
              <input
                type="file"
                accept={ACCEPT_3D}
                className="sr-only"
                disabled={uploadMutation.isPending}
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  if (nextFile && !isAllowed3DFile(nextFile)) {
                    toast.error("يسمح فقط بملفات .glb أو .gltf");
                    event.target.value = "";
                    return;
                  }
                  setFile(nextFile);
                }}
              />
            </label>

            {file ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
                <p className="font-semibold text-slate-950">{file.name}</p>
                <p className="mt-1 text-xs text-slate-500" dir="ltr">
                  {formatBytes(file.size)}
                </p>
                {fileWarning ? (
                  <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
                    {fileWarning}
                  </p>
                ) : null}
              </div>
            ) : null}

            {uploadMutation.isPending ? (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-3">
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-[width]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-brand-950">
                  {uploadProgress >= 100
                    ? "تم إرسال الملف، جاري الحفظ في Firebase…"
                    : `جاري الرفع ${uploadProgress}%`}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
              >
                {uploadMutation.isPending
                  ? "جاري الحفظ…"
                  : editingSku
                    ? "استبدال النموذج"
                    : "رفع وحفظ النموذج"}
              </Button>
              {editingSku ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploadMutation.isPending}
                  onClick={() => {
                    setEditingSku(null);
                    setSelectedProduct(null);
                    setSkuInput("");
                    setPosterUrl("");
                    setFile(null);
                    setEnabled(true);
                  }}
                >
                  إلغاء الاستبدال
                </Button>
              ) : null}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <h3 className="font-display text-base font-black text-slate-950">
              معاينة بعد الرفع
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              يظهر زر المعاينة هنا بعد حفظ الملف. النموذج نفسه لا يتم تحميله إلا عند فتح النافذة.
            </p>
            {lastUploaded ? (
              <div className="mt-4 space-y-3">
                <Product3DButton
                  modelSrc={lastUploaded.modelUrl}
                  productName={lastUploaded.productName ?? lastUploaded.sku}
                  posterSrc={lastUploaded.posterUrl}
                  className="w-full justify-start"
                />
                <p className="break-all rounded-2xl bg-white p-3 font-mono text-xs text-slate-500" dir="ltr">
                  {lastUploaded.storagePath}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                لا يوجد رفع جديد في هذه الجلسة بعد.
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-black text-slate-950">
              النماذج الحالية
            </h2>
            <p className="text-sm text-slate-500">
              إدارة الإظهار، المعاينة، الاستبدال، أو الحذف لكل SKU.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={assetsQuery.isFetching}
            onClick={() => void assetsQuery.refetch()}
          >
            <RotateCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>

        <ControlAsyncState
          loading={assetsQuery.isLoading}
          error={assetsQuery.error instanceof Error ? assetsQuery.error.message : null}
          empty={!assetsQuery.isLoading && assets.length === 0}
          emptyLabel="لا توجد نماذج 3D محفوظة بعد."
          onRetry={() => void assetsQuery.refetch()}
        >
          <ul className="grid gap-4 lg:grid-cols-2">
            {assets.map((asset) => (
              <li
                key={asset.sku}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-black text-slate-950">
                      {asset.productName ?? "منتج بدون اسم"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500" dir="ltr">
                      SKU: {asset.sku}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black",
                      asset.enabled
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-900",
                    )}
                  >
                    {asset.enabled ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <p className="break-all rounded-2xl bg-slate-50 p-3 font-mono text-xs text-slate-500" dir="ltr">
                    {asset.storagePath}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Product3DButton
                      modelSrc={asset.modelUrl}
                      productName={asset.productName ?? asset.sku}
                      posterSrc={asset.posterUrl}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={toggleMutation.isPending}
                      onClick={() =>
                        toggleMutation.mutate({
                          sku: asset.sku,
                          next: !asset.enabled,
                        })
                      }
                    >
                      {asset.enabled ? "تعطيل" : "تفعيل"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startReplace(asset)}
                    >
                      استبدال
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-red-700 hover:bg-red-50"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm("حذف هذا النموذج وبياناته؟")) {
                          deleteMutation.mutate(asset.sku);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ControlAsyncState>
      </section>
    </section>
  );
}
