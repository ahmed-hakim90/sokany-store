"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";
import {
  ControlAdvancedDetails,
  ControlFormSection,
} from "@/features/control/components/control-page-chrome";
import { uploadControlImageToStorage } from "@/features/control/components/control-panel-forms";
import { toAbsoluteCmsFileUrlInBrowser } from "@/lib/cms-file-path";
import { CMS_MEDIA_ROOT_PREFIX } from "@/lib/cms-media-path";
import { cn } from "@/lib/utils";

const FOLDER_PRESET_OPTIONS: { value: string; label: string }[] = [
  { value: "general", label: "عام" },
  { value: "hero", label: "صور الواجهة الرئيسية" },
  { value: "banners", label: "بانرات" },
  { value: "retailers", label: "الموزعون" },
  { value: "spotlights", label: "إعلانات مميزة" },
  { value: "documents", label: "مستندات وملفات" },
];

export type CmsMediaListItem = {
  path: string;
  url: string;
  contentType: string;
  size: number;
  updated: string | null;
};

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const ACCEPT_CMS =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,application/pdf,.pdf";

function shortName(path: string): string {
  const base = path.replace(/^cms\//, "");
  return base.length > 42 ? `${base.slice(0, 20)}…${base.slice(-16)}` : base;
}

function isPdfContentType(contentType: string, path: string): boolean {
  if (contentType === "application/pdf") return true;
  return path.toLowerCase().endsWith(".pdf");
}

function isImageContentType(contentType: string): boolean {
  return contentType.startsWith("image/");
}

function isVideoContentType(contentType: string, path: string): boolean {
  if (contentType.startsWith("video/")) return true;
  return /\.(mp4|webm|mov)$/i.test(path);
}

function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|webm|mov)$/i.test(file.name);
}

async function fetchMediaPage(
  pageToken: string | null,
): Promise<{ items: CmsMediaListItem[]; nextPageToken: string | null }> {
  const q = new URLSearchParams();
  if (pageToken) q.set("pageToken", pageToken);
  q.set("limit", "40");
  const res = await fetch(`/api/control/media?${q.toString()}`);
  const j = (await res.json().catch(() => ({}))) as {
    error?: string;
    items?: CmsMediaListItem[];
    nextPageToken?: string | null;
  };
  if (res.status === 401) {
    throw new Error("انتهت الجلسة");
  }
  if (!res.ok) throw new Error(j.error?.trim() || "تعذر جلب الوسائط");
  return {
    items: Array.isArray(j.items) ? j.items : [],
    nextPageToken: j.nextPageToken ?? null,
  };
}

async function deleteMediaPath(path: string): Promise<void> {
  const res = await fetch("/api/control/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 401) throw new Error("انتهت الجلسة");
  if (!res.ok) throw new Error(j.error?.trim() || "تعذر الحذف");
}

export function ControlMediaTab({
  onRemoteMediaChanged,
  mediaFolderPolicy = "all",
}: {
  onRemoteMediaChanged?: () => void;
  /** ‎`all` = أي مجلد. مصفوفة = فقط المجلدات الظاهرة في اختيار الرفع. */
  mediaFolderPolicy?: "all" | string[];
}) {
  const [items, setItems] = useState<CmsMediaListItem[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lastUploadUrl, setLastUploadUrl] = useState<string | null>(null);
  const [lastUploadPath, setLastUploadPath] = useState<string | null>(null);
  const [lastUploadIsPdf, setLastUploadIsPdf] = useState(false);
  const [lastUploadIsVideo, setLastUploadIsVideo] = useState(false);
  const [uploadLocalPreviewUrl, setUploadLocalPreviewUrl] = useState<string | null>(null);
  const [uploadLocalIsPdf, setUploadLocalIsPdf] = useState(false);
  const [uploadLocalIsVideo, setUploadLocalIsVideo] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [replaceForPath, setReplaceForPath] = useState<string | null>(null);
  const replaceFileRef = useRef<HTMLInputElement | null>(null);
  /** Subfolder for new uploads under `cms/site-media/` (not used for replace). */
  const [uploadFolderMode, setUploadFolderMode] = useState<string>("general");
  const [customFolder, setCustomFolder] = useState("");

  const folderOptions = (() => {
    if (mediaFolderPolicy === "all") {
      return [...FOLDER_PRESET_OPTIONS, { value: "custom", label: "مخصص…" }];
    }
    if (mediaFolderPolicy.length === 0) {
      return [];
    }
    const set = new Set(mediaFolderPolicy);
    const fromPresets = FOLDER_PRESET_OPTIONS.filter((o) => set.has(o.value));
    const hasCustom = mediaFolderPolicy.some(
      (x) => !FOLDER_PRESET_OPTIONS.some((p) => p.value === x),
    );
    if (fromPresets.length === 0 && hasCustom) {
      return [{ value: "custom", label: "مخصص…" }];
    }
    if (set.size === 1 && fromPresets.length === 1) {
      return fromPresets;
    }
    return [...fromPresets, { value: "custom", label: "مخصص…" }];
  })();

  useEffect(() => {
    if (mediaFolderPolicy === "all" || !mediaFolderPolicy) return;
    if (mediaFolderPolicy.length === 1) {
      const only = mediaFolderPolicy[0]!;
      if (FOLDER_PRESET_OPTIONS.some((o) => o.value === only)) {
        setUploadFolderMode(only);
      } else {
        setUploadFolderMode("custom");
        setCustomFolder(only);
      }
    }
  }, [mediaFolderPolicy]);

  const effectiveUploadSubfolder = (() => {
    if (mediaFolderPolicy !== "all" && mediaFolderPolicy.length === 1) {
      const o = mediaFolderPolicy[0]!;
      if (FOLDER_PRESET_OPTIONS.some((p) => p.value === o)) {
        return o;
      }
      return o;
    }
    if (uploadFolderMode === "custom") {
      return customFolder.trim() || "general";
    }
    return uploadFolderMode;
  })();

  const reloadFirstPage = useCallback(async () => {
    setListError(null);
    setListLoading(true);
    try {
      const { items: next, nextPageToken } = await fetchMediaPage(null);
      setItems(next);
      setNextToken(nextPageToken);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "خطأ");
      setItems([]);
      setNextToken(null);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadFirstPage();
  }, [reloadFirstPage]);

  useEffect(() => {
    return () => {
      if (uploadLocalPreviewUrl) URL.revokeObjectURL(uploadLocalPreviewUrl);
    };
  }, [uploadLocalPreviewUrl]);

  async function loadMore() {
    if (!nextToken || loadMoreLoading) return;
    setLoadMoreLoading(true);
    setListError(null);
    try {
      const { items: more, nextPageToken } = await fetchMediaPage(nextToken);
      setItems((prev) => [...prev, ...more]);
      setNextToken(nextPageToken);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر التحميل");
    } finally {
      setLoadMoreLoading(false);
    }
  }

  async function onUploadFile(f: File) {
    setUploading(true);
    setLastUploadUrl(null);
    setLastUploadPath(null);
    setLastUploadIsPdf(false);
    setLastUploadIsVideo(false);
    const localIsPdf = isPdfFile(f);
    const localIsVideo = isVideoFile(f);
    setUploadLocalIsPdf(localIsPdf);
    setUploadLocalIsVideo(localIsVideo);
    setUploadLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    try {
      const { url, path } = await uploadControlImageToStorage(f, {
        storageSubfolder: effectiveUploadSubfolder,
      });
      setLastUploadUrl(url);
      setLastUploadPath(path);
      setLastUploadIsPdf(isPdfFile(f) || path.toLowerCase().endsWith(".pdf"));
      setLastUploadIsVideo(isVideoFile(f) || /\.(mp4|webm|mov)$/i.test(path));
      setUploadLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setUploadLocalIsPdf(false);
      setUploadLocalIsVideo(false);
      toast.success("تم رفع الملف");
      onRemoteMediaChanged?.();
      await reloadFirstPage();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
      setUploadLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setUploadLocalIsPdf(false);
      setUploadLocalIsVideo(false);
    } finally {
      setUploading(false);
    }
  }

  function beginReplace(path: string) {
    setReplaceForPath(path);
    requestAnimationFrame(() => replaceFileRef.current?.click());
  }

  async function onReplacePicked(f: File) {
    const path = replaceForPath;
    setReplaceForPath(null);
    if (!path) return;
    setReplacing(path);
    try {
      const { url } = await uploadControlImageToStorage(f, { replacePath: path });
      if (path === lastUploadPath) {
        setLastUploadUrl(url);
        setLastUploadIsPdf(isPdfFile(f) || path.toLowerCase().endsWith(".pdf"));
        setLastUploadIsVideo(isVideoFile(f) || /\.(mp4|webm|mov)$/i.test(path));
      }
      toast.success("تم استبدال الملف — الرابط العام لموقعك لم يتغيّر");
      onRemoteMediaChanged?.();
      await reloadFirstPage();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الاستبدال");
    } finally {
      setReplacing(null);
    }
  }

  async function onDelete(path: string) {
    if (!window.confirm("حذف هذا الملف من التخزين؟")) return;
    setDeleting(path);
    setListError(null);
    try {
      await deleteMediaPath(path);
      setItems((prev) => prev.filter((x) => x.path !== path));
      if (path === lastUploadPath) {
        setLastUploadUrl(null);
        setLastUploadPath(null);
      }
      toast.success("تم حذف الملف");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setDeleting(null);
    }
  }

  async function copyUrl(url: string) {
    try {
      const absolute = toAbsoluteCmsFileUrlInBrowser(url);
      await navigator.clipboard.writeText(absolute);
      toast.success("تم نسخ الرابط الجاهز للمشاركة");
    } catch {
      toast.error("تعذر النسخ");
    }
  }

  function openUrlTab(url: string) {
    window.open(toAbsoluteCmsFileUrlInBrowser(url), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <ControlFormSection
        title="رفع صورة أو ملف"
        description="ارفع الصورة أو الملف هنا، ثم انسخ الرابط الجاهز واستخدمه في أي جزء داخل لوحة التحكم."
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="cms-media-subfolder">
            مكان حفظ الملف
          </label>
          <ControlFieldHelp>
            اختار القسم المناسب للملف حتى يبقى تنظيم الصور والملفات واضحًا بعد ذلك.
          </ControlFieldHelp>
          <div className="flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center">
            {mediaFolderPolicy !== "all" && mediaFolderPolicy.length === 1 ? (
              <p
                className="min-h-12 w-full rounded-lg border border-border bg-surface-muted/30 px-3 py-2 text-sm"
                dir="ltr"
              >
                {effectiveUploadSubfolder}
              </p>
            ) : (
            <select
              id="cms-media-subfolder"
              className="w-full min-h-12 rounded-lg border border-border bg-white px-3 py-2 text-sm"
              value={uploadFolderMode}
              onChange={(e) => setUploadFolderMode(e.target.value)}
              disabled={uploading}
            >
              {folderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            )}
            {uploadFolderMode === "custom" && folderOptions.some((o) => o.value === "custom") ? (
              <input
                type="text"
                dir="ltr"
                className="w-full min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm"
                placeholder="مثال: promos/2024"
                value={customFolder}
                onChange={(e) => setCustomFolder(e.target.value)}
                disabled={uploading}
                autoComplete="off"
              />
            ) : null}
          </div>
        </div>
        <input
          ref={replaceFileRef}
          type="file"
          accept={ACCEPT_CMS}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          disabled={!!replacing}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onReplacePicked(f);
            e.target.value = "";
          }}
        />
        <input
          type="file"
          accept={ACCEPT_CMS}
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onUploadFile(f);
            e.target.value = "";
          }}
        />
        <ControlFieldHelp>
          اختار صورة أو فيديو أو PDF من جهازك، وهتظهر هنا بعد الرفع مع رابط جاهز للنسخ.
        </ControlFieldHelp>
        {uploading ? (
          <p className="text-sm text-muted-foreground">جاري الرفع…</p>
        ) : null}
        {lastUploadUrl ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-950">آخر رفع ناجح</p>
            {lastUploadIsVideo ? (
              <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-black">
                <video
                  src={lastUploadUrl}
                  controls
                  className="max-h-[min(20rem,60vh)] w-full"
                />
              </div>
            ) : lastUploadIsPdf ? (
              <div className="w-full max-w-2xl space-y-2">
                <div className="overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                  <iframe
                    title="معاينة PDF"
                    src={lastUploadUrl}
                    className="h-[min(20rem,55vh)] w-full border-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => void copyUrl(lastUploadUrl!)}>
                    نسخ الرابط
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => openUrlTab(lastUploadUrl!)}>
                    فتح
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative max-h-[min(20rem,60vh)] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                <AppImage
                  src={lastUploadUrl}
                  alt=""
                  width={800}
                  height={450}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 42rem) 100vw, 42rem"
                />
              </div>
            )}
            <p
              className="break-all rounded-lg bg-surface-muted/50 p-2 font-mono text-xs text-muted-foreground"
              dir="ltr"
            >
              {toAbsoluteCmsFileUrlInBrowser(lastUploadUrl)}
            </p>
          </div>
        ) : null}
        {uploadLocalPreviewUrl && uploading ? (
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface-muted/40">
            {uploadLocalIsVideo ? (
              <video
                src={uploadLocalPreviewUrl}
                controls
                muted
                className="max-h-[min(16rem,50vh)] w-full bg-black"
              />
            ) : uploadLocalIsPdf ? (
              <iframe
                title="جاري رفع PDF"
                src={uploadLocalPreviewUrl}
                className="h-[min(16rem,50vh)] w-full border-0"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview before upload
              <img
                src={uploadLocalPreviewUrl}
                alt=""
                className="h-auto max-h-[min(16rem,50vh)] w-full object-contain"
              />
            )}
          </div>
        ) : null}
        {uploadLocalPreviewUrl && !uploading && !lastUploadUrl ? (
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-amber-200 bg-amber-50/50">
            <p className="p-2 text-sm text-amber-900">فشل الرفع — يمكنك اختيار ملف آخر</p>
            {uploadLocalIsVideo ? (
              <video
                src={uploadLocalPreviewUrl}
                controls
                muted
                className="max-h-[min(14rem,45vh)] w-full bg-black"
              />
            ) : uploadLocalIsPdf ? (
              <iframe
                title="معاينة"
                src={uploadLocalPreviewUrl}
                className="h-[min(14rem,45vh)] w-full border-0"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview after failed upload
              <img
                src={uploadLocalPreviewUrl}
                alt=""
                className="h-auto max-h-[min(14rem,45vh)] w-full object-contain px-2 pb-2"
              />
            )}
          </div>
        ) : null}
        <ControlAdvancedDetails summary="تفاصيل إضافية">
          <p className="text-xs text-slate-600">
            عند استبدال الملف يبقى نفس الرابط كما هو، وهذا مفيد لو استخدمته مسبقًا داخل الموقع.
          </p>
          <p className="font-mono text-xs text-slate-500" dir="ltr">
            {CMS_MEDIA_ROOT_PREFIX}/{"{folder}"}/{"{timestamp}"}-filename
          </p>
          {mediaFolderPolicy !== "all" && mediaFolderPolicy.length > 0 ? (
            <p className="text-xs text-slate-600">
              المجلدات الظاهرة هنا متأثرة بصلاحية الحساب الحالي.
            </p>
          ) : null}
        </ControlAdvancedDetails>
      </ControlFormSection>

      <ControlFormSection
        title="الملفات المرفوعة"
        description="من هنا تراجع كل ما تم رفعه، وتنسخ الرابط أو تفتح الملف أو تستبدله أو تحذفه."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={listLoading}
            onClick={() => void reloadFirstPage()}
          >
            تحديث القائمة
          </Button>
        }
      >

        {listError ? (
          <p className="text-sm text-red-600" role="alert">
            {listError}
          </p>
        ) : null}

        {listLoading ? (
          <p className="text-sm text-muted-foreground">جاري جلب الوسائط…</p>
        ) : items.length === 0 && !listError ? (
          <p className="text-sm text-muted-foreground">لا توجد ملفات في التخزين بعد.</p>
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="قائمة الملفات المرفوعة"
          >
            {items.map((it) => {
              const isImage = isImageContentType(it.contentType);
              const isVideo = isVideoContentType(it.contentType, it.path);
              const isPdf = isPdfContentType(it.contentType, it.path);
              return (
                <li
                  key={it.path}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-muted/20"
                >
                  <div
                    className={cn(
                      "w-full border-b border-border/80 bg-surface-muted/50 p-0",
                      isPdf ? "h-44" : "flex h-40 items-center justify-center p-1",
                    )}
                  >
                    {isImage ? (
                      <AppImage
                        key={`${it.path}-${it.updated ?? ""}`}
                        src={it.url}
                        alt=""
                        width={400}
                        height={300}
                        className="max-h-36 w-auto max-w-full object-contain"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : isVideo ? (
                      <video
                        key={`${it.path}-${it.updated ?? ""}`}
                        src={it.url}
                        controls
                        muted
                        className="max-h-36 w-full bg-black"
                      />
                    ) : isPdf ? (
                      <iframe
                        key={`${it.path}-${it.updated ?? ""}`}
                        title={shortName(it.path)}
                        src={it.url}
                        className="h-full w-full min-h-40 border-0"
                      />
                    ) : (
                      <div className="flex h-full min-h-32 items-center justify-center p-2 text-center text-xs text-muted-foreground">
                        {it.contentType}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                    <p className="break-all font-mono text-xs text-muted-foreground" title={it.path} dir="ltr">
                      {shortName(it.path)}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {formatSize(it.size)}
                      {it.updated ? ` · ${it.updated}` : null}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {isPdf ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                          onClick={() => openUrlTab(it.url)}
                        >
                          فتح
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        disabled={replacing === it.path}
                        onClick={() => beginReplace(it.path)}
                      >
                        {replacing === it.path ? "جاري الاستبدال…" : "استبدال"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        onClick={() => void copyUrl(it.url)}
                      >
                        نسخ الرابط
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0 text-red-700 hover:bg-red-50"
                        disabled={deleting === it.path}
                        onClick={() => void onDelete(it.path)}
                      >
                        {deleting === it.path ? "جاري الحذف…" : "حذف"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {nextToken && !listLoading ? (
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              variant="secondary"
              disabled={loadMoreLoading}
              onClick={() => void loadMore()}
            >
              {loadMoreLoading ? "جاري التحميل…" : "تحميل المزيد"}
            </Button>
          </div>
        ) : null}
      </ControlFormSection>
    </div>
  );
}
