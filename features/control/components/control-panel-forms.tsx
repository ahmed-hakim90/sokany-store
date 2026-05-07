"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";
import { CATEGORY_ICON_SLUGS, type CategoryIconSlug } from "@/lib/category-icon-slugs";
import { ROUTES } from "@/lib/constants";
import { HEADER_NAV_ROUTE_CHOICES, HEADER_NAV_ROUTE_CUSTOM } from "@/lib/header-nav-route-choices";
import { SOCIAL_ICON_PRESETS, isKnownSocialIconKey } from "@/lib/social-icon-presets";
import { SOCIAL_LINKS, type SocialLink } from "@/lib/social-links";
import type {
  CmsHeaderCategoryStrip,
  CmsHomeCategoryScroller,
  CmsHomeHeroDoc,
  CmsHomeSpotlightPlacement,
  CmsRetailersDoc,
  CmsSectionBannersDoc,
  CmsSpotlightsDoc,
  CmsTopAnnouncementBar,
} from "@/schemas/cms";
import {
  CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT,
  cmsHeaderCategoryStripSchema,
  cmsHomeCategoryScrollerSchema,
  cmsRetailersDocSchema,
  cmsSectionBannersDocSchema,
  cmsSocialLinkSchema,
  cmsSpotlightsDocSchema,
  cmsTopAnnouncementBarSchema,
} from "@/schemas/cms";
import { z } from "zod";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

export async function uploadControlImageToStorage(
  file: File,
  options?: { replacePath?: string; storageSubfolder?: string },
  onProgress?: (percent: number) => void,
): Promise<{ url: string; path: string }> {
  const form = new FormData();
  form.set("file", file);
  form.set("filename", file.name);
  const r = options?.replacePath?.trim();
  if (r) {
    form.set("replacePath", r);
  }
  const sub = options?.storageSubfolder?.trim();
  if (sub) {
    form.set("subfolder", sub);
  }

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/control/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100))));
    };

    xhr.onerror = () => reject(new Error("فشل الرفع"));
    xhr.onabort = () => reject(new Error("تم إلغاء الرفع"));
    xhr.onload = () => {
      let payload: { url?: string; path?: string; error?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText || "{}") as {
          url?: string;
          path?: string;
          error?: string;
        };
      } catch {
        payload = {};
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(payload.error ?? "رفع فاشل"));
        return;
      }
      if (!payload.url?.trim()) {
        reject(new Error("لم يُرجع الخادم رابطًا للصورة"));
        return;
      }
      onProgress?.(100);
      resolve({
        url: payload.url.trim(),
        path: (payload.path ?? "").trim() || "cms/unknown",
      });
    };

    xhr.send(form);
  });
}

export async function uploadControlImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { url } = await uploadControlImageToStorage(file, undefined, onProgress);
  return url;
}

function UploadProgressBar({
  progress,
  label = "جاري الرفع",
}: {
  progress: number;
  label?: string;
}) {
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ManagedImageUploadField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  helper,
  hiddenName,
  buttonLabel = "رفع صورة",
  previewClassName = "max-h-36 max-w-md",
  previewImageClassName = "mx-auto h-auto max-h-32 w-full object-contain",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  helper?: React.ReactNode;
  hiddenName?: string;
  buttonLabel?: string;
  previewClassName?: string;
  previewImageClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const url = await uploadControlImage(file, setProgress);
      onChange(url);
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const trimmed = value.trim();
  const previewSrc = localPreviewUrl ?? (trimmed.length > 0 ? trimmed : null);

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {helper ? <ControlFieldHelp>{helper}</ControlFieldHelp> : null}
      {hiddenName ? <input type="hidden" name={hiddenName} value={value} /> : null}
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm"
        />
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT_IMAGES}
          className="sr-only"
          tabIndex={-1}
          disabled={disabled || uploading}
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "جاري الرفع…" : buttonLabel}
        </Button>
      </div>
      {uploading ? <UploadProgressBar progress={progress} /> : null}
      {previewSrc ? (
        <div
          className={`mt-2 overflow-hidden rounded-lg border border-border bg-surface-muted/40 p-1 ${previewClassName}`}
        >
          <AppImage
            src={previewSrc}
            alt=""
            width={400}
            height={160}
            className={previewImageClassName}
            sizes="(max-width: 28rem) 100vw, 28rem"
          />
        </div>
      ) : null}
    </div>
  );
}

/** حقل رابط صورة لنماذج `FormData`: نص + رفع يملأ القيمة + `hidden` بنفس `name` للإرسال. */
export function ControlImageUrlField({
  name,
  label,
  defaultValue = "",
  placeholder,
  helper,
  disabled,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  helper?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className={className}>
      <ManagedImageUploadField
        label={label}
        value={value}
        onChange={setValue}
        disabled={disabled}
        placeholder={placeholder}
        helper={helper}
        hiddenName={name}
        buttonLabel="اختيار صورة"
      />
    </div>
  );
}

type AnnRow = { text: string; href: string };

export function AnnouncementBarForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsTopAnnouncementBar;
  disabled: boolean;
  onSave: (bar: CmsTopAnnouncementBar) => void;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [mode, setMode] = useState<CmsTopAnnouncementBar["mode"]>(initial.mode);
  const [carouselIntervalSec, setCarouselIntervalSec] = useState(
    initial.carouselIntervalSec ?? 8,
  );
  const [rows, setRows] = useState<AnnRow[]>(() =>
    initial.items.length > 0
      ? initial.items.map((i) => ({ text: i.text, href: i.href ?? "" }))
      : [{ text: "", href: "" }],
  );

  function updateRow(i: number, patch: Partial<AnnRow>) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function addRow() {
    setRows((r) => [...r, { text: "", href: "" }]);
  }

  function removeRow(i: number) {
    setRows((r) => (r.length <= 1 ? [{ text: "", href: "" }] : r.filter((_, j) => j !== i)));
  }

  function handleSave() {
    const items = rows
      .map((r) => ({
        text: r.text.trim(),
        href: r.href.trim() || undefined,
      }))
      .filter((r) => r.text.length > 0);
    const parsed = cmsTopAnnouncementBarSchema.safeParse({
      enabled,
      mode,
      carouselIntervalSec,
      items,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((x) => x.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">شريط الإعلانات فوق الهيدر</h2>
      <p className="text-sm text-muted-foreground">
        هذا الشريط يظهر أعلى الموقع لتنبيه سريع أو عرض مهم. لو أوقفته، يختفي بالكامل.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>تفعيل الشريط</span>
        </label>
        <div>
          <label className="text-sm font-medium">الوضع</label>
          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value === "carousel" ? "carousel" : "marquee")
            }
            className="mt-1 block w-full max-w-xs rounded-lg border border-border px-3 py-2"
          >
            <option value="marquee">شريط متحرك</option>
            <option value="carousel">كاروسيل</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">ثوانٍ بين الرسائل (كاروسيل)</label>
          <input
            type="number"
            min={3}
            max={120}
            value={carouselIntervalSec}
            onChange={(e) => setCarouselIntervalSec(Number(e.target.value))}
            className="mt-1 w-full max-w-[8rem] rounded-lg border border-border px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">رسائل الشريط</span>
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            + سطر
          </Button>
        </div>
        <ul className="space-y-3">
          {rows.map((row, i) => (
            <li
              key={i}
              className="grid gap-2 rounded-xl border border-border/80 bg-surface-muted/20 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <label className="text-xs text-muted-foreground">النص</label>
                <ControlFieldHelp>الجملة القصيرة اللي هتظهر فوق الموقع.</ControlFieldHelp>
                <input
                  value={row.text}
                  onChange={(e) => updateRow(i, { text: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="نص الإعلان"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">رابط (اختياري)</label>
                <ControlFieldHelp>لو حد ضغط على الرسالة، يروح لفين؟</ControlFieldHelp>
                <input
                  value={row.href}
                  onChange={(e) => updateRow(i, { href: e.target.value })}
                  dir="ltr"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                  placeholder="/categories/..."
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => removeRow(i)}
                >
                  حذف
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Button type="button" disabled={disabled} onClick={handleSave}>
        {disabled ? "جاري الحفظ…" : "حفظ شريط الإعلانات"}
      </Button>
    </section>
  );
}

const socialLinksArraySchema = z.array(cmsSocialLinkSchema).max(12);

export function SocialLinksForm({
  initialFromCms,
  disabled,
  onSave,
  onResetDefaults,
}: {
  initialFromCms: SocialLink[] | undefined;
  disabled: boolean;
  onSave: (links: SocialLink[]) => void;
  onResetDefaults: () => void;
}) {
  const [rows, setRows] = useState<SocialLink[]>(() =>
    initialFromCms && initialFromCms.length > 0
      ? initialFromCms.map((s) => ({ ...s }))
      : SOCIAL_LINKS.map((s) => ({ ...s })),
  );

  function updateRow(i: number, field: keyof SocialLink, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addRow() {
    setRows((r) => [...r, { key: "", href: "https://", label: "" }]);
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, j) => j !== i));
  }

  function handleSave() {
    const parsed = socialLinksArraySchema.safeParse(rows);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((x) => x.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">روابط السوشيال (الفوتر و SEO)</h2>
      <p className="text-sm text-muted-foreground">
        اختر نوع الأيقونة من القائمة — تُعرض في الفوتر وقائمة التصنيفات والإجراءات السريعة على الجوال. الرابط يجب أن يكون
        URL كاملًا يبدأ بـ https://
      </p>
      <ul className="space-y-3">
        {rows.map((row, i) => {
          const iconSelectValue =
            row.key === ""
              ? ""
              : isKnownSocialIconKey(row.key)
                ? row.key.trim().toLowerCase()
                : row.key;
          return (
          <li
            key={i}
            className="grid gap-2 rounded-xl border border-border/80 p-3 sm:grid-cols-3 sm:gap-3"
          >
            <div>
              <label className="text-xs text-muted-foreground">الأيقونة</label>
              <ControlFieldHelp>اختار شكل الأيقونة المناسب للرابط.</ControlFieldHelp>
              <select
                value={iconSelectValue}
                onChange={(e) => updateRow(i, "key", e.target.value)}
                dir="ltr"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="">— اختر الأيقونة —</option>
                {SOCIAL_ICON_PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.labelAr}
                  </option>
                ))}
                {row.key && !isKnownSocialIconKey(row.key) ? (
                  <option value={row.key}>{row.key} (مفتاح محفوظ)</option>
                ) : null}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">العنوان الظاهر</label>
              <ControlFieldHelp>الاسم اللي المستخدم هيقرأه للرابط ده.</ControlFieldHelp>
              <input
                value={row.label}
                onChange={(e) => updateRow(i, "label", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 sm:col-span-1">
              <div className="min-w-0 flex-1">
                <label className="text-xs text-muted-foreground">الرابط</label>
                <ControlFieldHelp>الصق رابط الصفحة أو الحساب كاملًا.</ControlFieldHelp>
                <input
                  value={row.href}
                  onChange={(e) => updateRow(i, "href", e.target.value)}
                  dir="ltr"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600"
                  onClick={() => removeRow(i)}
                >
                  حذف
                </Button>
              </div>
            </div>
          </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          + رابط
        </Button>
        <Button type="button" disabled={disabled} onClick={handleSave}>
          {disabled ? "جاري الحفظ…" : "حفظ روابط السوشيال"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={onResetDefaults}
        >
          إعادة الافتراضي (مسح من CMS)
        </Button>
      </div>
    </section>
  );
}

export function SectionBannersForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsSectionBannersDoc;
  disabled: boolean;
  onSave: (doc: CmsSectionBannersDoc) => void;
}) {
  const [items, setItems] = useState(() =>
    initial.items.length > 0
      ? initial.items.map((x) => ({ imageUrl: x.imageUrl, href: x.href ?? "" }))
      : [{ imageUrl: "", href: "" }],
  );

  function updateRow(i: number, field: "imageUrl" | "href", value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addRow() {
    setItems((s) => [...s, { imageUrl: "", href: "" }]);
  }

  function removeRow(i: number) {
    setItems((s) => (s.length <= 1 ? [{ imageUrl: "", href: "" }] : s.filter((_, j) => j !== i)));
  }

  function handleSave() {
    const doc: CmsSectionBannersDoc = {
      items: items.map((it) => ({
        imageUrl: it.imageUrl.trim(),
        href: it.href.trim() || undefined,
      })),
    };
    const parsed = cmsSectionBannersDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((x) => x.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">بانرات أقسام الصفحة الرئيسية</h2>
          <p className="text-sm text-muted-foreground">
            الترتيب يطابق ترتيب أقسام الأب على الصفحة الرئيسية.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          + بانر
        </Button>
      </div>

      <ul className="space-y-6">
        {items.map((it, i) => (
          <li key={i} className="rounded-xl border border-border/80 bg-surface-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-brand-950">بانر {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => removeRow(i)}
              >
                حذف
              </Button>
            </div>
            <div className="grid gap-3">
              <div>
                <ManagedImageUploadField
                  label="صورة البانر"
                  value={it.imageUrl}
                  onChange={(value) => updateRow(i, "imageUrl", value)}
                  disabled={disabled}
                  placeholder="https://..."
                  helper="ارفع الصورة اللي هتظهر كبانر داخل الصفحة الرئيسية."
                  buttonLabel="رفع صورة"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  رابط عند النقر (اختياري)
                </label>
                <ControlFieldHelp>لو العميل ضغط على البانر، افتحله أي صفحة أو قسم من هنا.</ControlFieldHelp>
                <input
                  value={it.href}
                  onChange={(e) => updateRow(i, "href", e.target.value)}
                  dir="ltr"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="/categories/..."
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" disabled={disabled} onClick={handleSave}>
        {disabled ? "جاري الحفظ…" : "حفظ البانرات"}
      </Button>
    </section>
  );
}

export function RetailersForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsRetailersDoc;
  disabled: boolean;
  onSave: (doc: CmsRetailersDoc) => void;
}) {
  const [mapHeroSrc, setMapHeroSrc] = useState(initial.mapHeroSrc);
  const [retailers, setRetailers] = useState(initial.retailers);

  useEffect(() => {
    setMapHeroSrc(initial.mapHeroSrc);
    setRetailers(initial.retailers);
  }, [initial]);

  function addRetailer() {
    setRetailers((r) => [
      ...r,
      {
        name: "",
        location: "",
        governorate: "",
        imageSrc: "",
        phone: "",
        googleMapsUrl: "",
      },
    ]);
  }

  function handleSave() {
    const doc: CmsRetailersDoc = {
      mapHeroSrc: mapHeroSrc.trim(),
      retailers: retailers.map((x) => ({
        name: x.name.trim(),
        location: x.location.trim(),
        governorate: x.governorate.trim(),
        imageSrc: x.imageSrc.trim(),
        phone: x.phone.trim(),
        googleMapsUrl: x.googleMapsUrl?.trim()
          ? x.googleMapsUrl.trim()
          : undefined,
      })),
    };
    const parsed = cmsRetailersDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((x) => x.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold">صورة خريطة الموزعين (أعلى الصفحة)</h2>
        <p className="mt-1 text-sm text-muted-foreground">مطلوبة — رابط الصورة الكامل.</p>
        <div className="mt-3">
          <ManagedImageUploadField
            label="صورة الخريطة"
            value={mapHeroSrc}
            onChange={setMapHeroSrc}
            disabled={disabled}
            helper="دي الصورة اللي بتظهر أعلى صفحة الموزعين."
            buttonLabel="رفع صورة"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold">قائمة الموزعين</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addRetailer}>
            + موزع
          </Button>
        </div>
        <ul className="space-y-4">
          {retailers.map((row, i) => (
            <li key={i} className="rounded-xl border border-amber-100 bg-amber-50/30 p-4">
              <div className="mb-2 flex justify-between gap-2">
                <span className="text-sm font-semibold">موزع {i + 1}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600"
                  onClick={() => setRetailers((r) => r.filter((_, j) => j !== i))}
                >
                  حذف
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="الاسم"
                  value={row.name}
                  onChange={(e) =>
                    setRetailers((r) =>
                      r.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                    )
                  }
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <ControlFieldHelp>اسم الموزع أو اسم المعرض.</ControlFieldHelp>
                <input
                  placeholder="المحافظة"
                  value={row.governorate}
                  onChange={(e) =>
                    setRetailers((r) =>
                      r.map((x, j) => (j === i ? { ...x, governorate: e.target.value } : x)),
                    )
                  }
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <ControlFieldHelp>اسم المحافظة اللي الموزع موجود فيها.</ControlFieldHelp>
                <input
                  placeholder="الموقع / المنطقة"
                  value={row.location}
                  onChange={(e) =>
                    setRetailers((r) =>
                      r.map((x, j) => (j === i ? { ...x, location: e.target.value } : x)),
                    )
                  }
                  className="sm:col-span-2 rounded-lg border border-border px-3 py-2 text-sm"
                />
                <ControlFieldHelp>اكتب المنطقة أو العنوان المختصر للموزع.</ControlFieldHelp>
                <input
                  placeholder="الهاتف"
                  value={row.phone}
                  onChange={(e) =>
                    setRetailers((r) =>
                      r.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)),
                    )
                  }
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <ControlFieldHelp>رقم التواصل اللي العميل يقدر يكلم عليه.</ControlFieldHelp>
                <input
                  placeholder="رابط خرائط Google (اختياري)"
                  value={row.googleMapsUrl ?? ""}
                  onChange={(e) =>
                    setRetailers((r) =>
                      r.map((x, j) =>
                        j === i ? { ...x, googleMapsUrl: e.target.value } : x,
                      ),
                    )
                  }
                  dir="ltr"
                  className="rounded-lg border border-border px-3 py-2 font-mono text-sm"
                />
                <ControlFieldHelp>لو عندك موقع الموزع على الخريطة، الصق الرابط هنا.</ControlFieldHelp>
                <div className="sm:col-span-2">
                  <ManagedImageUploadField
                    label="صورة الموزع"
                    value={row.imageSrc}
                    onChange={(value) =>
                      setRetailers((r) =>
                        r.map((x, j) => (j === i ? { ...x, imageSrc: value } : x)),
                      )
                    }
                    disabled={disabled}
                    helper="صورة المعرض أو الشعار الخاص بالموزع."
                    buttonLabel="رفع صورة"
                    previewClassName="max-h-28 max-w-[260px]"
                    previewImageClassName="h-[84px] w-full object-cover"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" disabled={disabled} onClick={handleSave}>
        {disabled ? "جاري الحفظ…" : "حفظ الموزعين"}
      </Button>
    </div>
  );
}

type SpotlightRow = {
  type: "branch" | "product";
  branchId: string;
  productId: string;
  imageUrl: string;
  href: string;
  active: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string;
  homePlacement: CmsHomeSpotlightPlacement;
};

function spotlightToRow(item: CmsSpotlightsDoc["items"][number]): SpotlightRow {
  return {
    type: item.type,
    branchId: item.branchId ?? "",
    productId: item.productId != null ? String(item.productId) : "",
    imageUrl: item.imageUrl ?? "",
    href: item.href ?? "",
    active: item.active,
    title: item.title ?? "",
    subtitle: item.subtitle ?? "",
    ctaLabel: item.ctaLabel ?? "",
    homePlacement: item.homePlacement ?? CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT,
  };
}

export function SpotlightsForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsSpotlightsDoc;
  disabled: boolean;
  onSave: (doc: CmsSpotlightsDoc) => void;
}) {
  const [items, setItems] = useState<SpotlightRow[]>(() =>
    initial.items.length > 0
      ? initial.items.map(spotlightToRow)
      : [
          {
            type: "product",
            branchId: "",
            productId: "",
            imageUrl: "",
            href: "",
            active: true,
            title: "",
            subtitle: "",
            ctaLabel: "",
            homePlacement: CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT,
          },
        ],
  );

  function updateRow(i: number, patch: Partial<SpotlightRow>) {
    setItems((prev) => prev.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setItems((s) => [
      ...s,
      {
        type: "product",
        branchId: "",
        productId: "",
        imageUrl: "",
        href: "",
        active: false,
        title: "",
        subtitle: "",
        ctaLabel: "",
        homePlacement: CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT,
      },
    ]);
  }

  function removeRow(i: number) {
    setItems((s) => (s.length <= 1 ? s : s.filter((_, j) => j !== i)));
  }

  function handleSave() {
    const doc: CmsSpotlightsDoc = {
      items: items.map((row) => {
        const productId = row.productId.trim();
        const branchId = row.branchId.trim();
        return {
          type: row.type,
          active: row.active,
          branchId: branchId || undefined,
          productId:
            productId && !Number.isNaN(Number(productId))
              ? Number(productId)
              : undefined,
          imageUrl: row.imageUrl.trim() || undefined,
          href: row.href.trim() || undefined,
          title: row.title.trim() || undefined,
          subtitle: row.subtitle.trim() || undefined,
          ctaLabel: row.ctaLabel.trim() || undefined,
          homePlacement: row.homePlacement,
        };
      }),
    };
    const parsed = cmsSpotlightsDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((x) => x.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">إعلان مميز في الصفحة الرئيسية</h2>
          <p className="text-sm text-muted-foreground">
            يُعرَض أول عنصر عليه «نشط». اختر موضع البطاقة في الهوم، واملأ الصورة والعناوين لظهور أفضل.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          + عنصر
        </Button>
      </div>

      <ul className="space-y-6">
        {items.map((row, i) => (
          <li key={i} className="rounded-xl border border-violet-100 bg-violet-50/30 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold">عنصر {i + 1}</span>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => updateRow(i, { active: e.target.checked })}
                  />
                  نشط
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => removeRow(i)}
                >
                  حذف
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground">النوع</label>
                <ControlFieldHelp>حدد الإعلان ده لمنتج ولا لفرع.</ControlFieldHelp>
                <select
                  value={row.type}
                  onChange={(e) =>
                    updateRow(i, {
                      type: e.target.value === "branch" ? "branch" : "product",
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="product">منتج</option>
                  <option value="branch">فرع</option>
                </select>
              </div>
              {row.type === "branch" ? (
                <div>
                  <label className="text-xs text-muted-foreground">معرّف الفرع (اختياري)</label>
                  <ControlFieldHelp>لو الإعلان لفرع معيّن، اكتب معرفه هنا لو عندك.</ControlFieldHelp>
                  <input
                    value={row.branchId}
                    onChange={(e) => updateRow(i, { branchId: e.target.value })}
                    dir="ltr"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-muted-foreground">رقم المنتج (Woo)</label>
                  <ControlFieldHelp>لو الإعلان لمنتج معيّن، اكتب رقم المنتج.</ControlFieldHelp>
                  <input
                    value={row.productId}
                    onChange={(e) => updateRow(i, { productId: e.target.value })}
                    dir="ltr"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <ManagedImageUploadField
                  label="صورة الإعلان"
                  value={row.imageUrl}
                  onChange={(value) => updateRow(i, { imageUrl: value })}
                  disabled={disabled}
                  helper="الصورة الأساسية اللي هتظهر في الإعلان ده."
                  buttonLabel="رفع صورة"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">موضع العرض في الهوم</label>
                <ControlFieldHelp>
                  أين تظهر بطاقة الإعلان في الصفحة الرئيسية بالنسبة للهيرو والعروض والأقسام.
                </ControlFieldHelp>
                <select
                  value={row.homePlacement}
                  onChange={(e) =>
                    updateRow(i, {
                      homePlacement: e.target.value as CmsHomeSpotlightPlacement,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <option value="top">بداية الصفحة قبل الهيرو</option>
                  <option value="afterHero">بعد الهيرو مباشرة</option>
                  <option value="afterFlashSales">بعد قسم العروض السريعة</option>
                  <option value="afterServices">بعد كبسولة الخدمات (الافتراضي السابق)</option>
                  <option value="afterBestsellers">بعد قسم الأكثر مبيعاً</option>
                  <option value="afterNewArrivals">بعد قسم وصل حديثاً</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">رابط مخصص (اختياري)</label>
                <ControlFieldHelp>لو عايز الإعلان يفتح صفحة محددة، حط الرابط هنا.</ControlFieldHelp>
                <input
                  value={row.href}
                  onChange={(e) => updateRow(i, { href: e.target.value })}
                  dir="ltr"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">عنوان</label>
                <ControlFieldHelp>العنوان الرئيسي للإعلان.</ControlFieldHelp>
                <input
                  value={row.title}
                  onChange={(e) => updateRow(i, { title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">نص فرعي</label>
                <ControlFieldHelp>سطر صغير يشرح الإعلان أو العرض.</ControlFieldHelp>
                <input
                  value={row.subtitle}
                  onChange={(e) => updateRow(i, { subtitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">نص الزر</label>
                <ControlFieldHelp>الكلمة اللي هتظهر على زرار الإعلان.</ControlFieldHelp>
                <input
                  value={row.ctaLabel}
                  onChange={(e) => updateRow(i, { ctaLabel: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="اكتشف الآن"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" disabled={disabled} onClick={handleSave}>
        {disabled ? "جاري الحفظ…" : "حفظ الإعلانات المميزة"}
      </Button>
    </section>
  );
}

export function HeroSlidesForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsHomeHeroDoc;
  disabled: boolean;
  onSave: (doc: CmsHomeHeroDoc) => void;
}) {
  const [slides, setSlides] = useState(initial.slides);
  const [useFileFallbackWhenEmpty, setUseFileFallbackWhenEmpty] = useState(
    initial.useFileFallbackWhenEmpty !== false,
  );

  useEffect(() => {
    setSlides(initial.slides);
    setUseFileFallbackWhenEmpty(initial.useFileFallbackWhenEmpty !== false);
  }, [initial]);

  function addSlide() {
    setSlides((s) => [...s, { imageUrl: "", alt: "", href: "" }]);
  }

  function removeSlide(i: number) {
    setSlides((s) => s.filter((_, j) => j !== i));
  }

  function updateSlide(
    i: number,
    field: "imageUrl" | "alt" | "href",
    value: string,
  ) {
    setSlides((s) => {
      const next = [...s];
      const row = { ...next[i], [field]: value };
      next[i] = row;
      return next;
    });
  }

  function handleSave() {
    const filtered = slides.filter((s) => s.imageUrl.trim().length > 0);
    if (slides.length > 0 && filtered.length === 0) {
      toast.info(
        "لا توجد شرائح بروابط صور صالحة؛ سيتم حفظ قائمة فارغة وفق خيار «صور المجلد» أدناه.",
      );
    } else if (filtered.length < slides.length) {
      toast.info("تم تجاهل صفوف بلا رابط صورة قبل الحفظ.");
    }
    onSave({
      slides: filtered,
      useFileFallbackWhenEmpty,
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold">شرائح الهيرو</h2>
        <Button type="button" variant="secondary" size="sm" onClick={addSlide}>
          + شريحة
        </Button>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          كل شريحة تحتاج رابط صورة صالحًا (رفع أو لصق URL). الصفوف الفارغة تُستبعد تلقائيًا عند
          الحفظ — ولن يظهر خطأ التحقق.
        </p>
        <p>
          إن لم تُضف أي شريحة في CMS، يمكنك اختيار إظهار صور المجلد الثابت{" "}
          <code className="rounded bg-surface-muted px-1 font-mono text-xs" dir="ltr">
            public/images/hero
          </code>{" "}
          أو إخفاء الهيرو بالكامل عبر الخيار التالي.
        </p>
        <p>
          بعد الحفظ يُحدَّث العرض خلال حوالي دقيقة (كاش الخادم)، أو فورًا عند الطلب عبر واجهة
          الحفظ في لوحة التحكم.
        </p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-surface-muted/25 p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={useFileFallbackWhenEmpty}
          onChange={(e) => setUseFileFallbackWhenEmpty(e.target.checked)}
        />
        <span>
          <span className="font-semibold text-brand-950">عند عدم وجود شرائح في CMS</span>
          <span className="mt-1 block text-muted-foreground">
            فعّل: استخدام صور المجلد الثابت أعلاه. ألغِ التفعيل: إخفاء بانر الهيرو على الصفحة
            الرئيسية.
          </span>
        </span>
      </label>

      <ul className="space-y-6">
        {slides.map((slide, i) => (
          <li
            key={i}
            className="rounded-xl border border-border/80 bg-surface-muted/20 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-brand-950">شريحة {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => removeSlide(i)}
              >
                حذف
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              <div>
                <ManagedImageUploadField
                  label="صورة الشريحة"
                  value={slide.imageUrl}
                  onChange={(value) => updateSlide(i, "imageUrl", value)}
                  disabled={disabled}
                  placeholder="https://..."
                  helper="الصورة الأساسية اللي هتظهر في السلايدر أعلى الصفحة."
                  buttonLabel="رفع صورة"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">وصف للصورة (alt)</label>
                <ControlFieldHelp>وصف بسيط للصورة، مفيد للوصول ومحركات البحث.</ControlFieldHelp>
                <input
                  value={slide.alt ?? ""}
                  onChange={(e) => updateSlide(i, "alt", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  رابط عند النقر (اختياري)
                </label>
                <ControlFieldHelp>لو المستخدم ضغط على الشريحة، يروح لفين؟</ControlFieldHelp>
                <input
                  value={slide.href ?? ""}
                  onChange={(e) => updateSlide(i, "href", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="/products أو https://..."
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد شرائح. اضغط «+ شريحة» للبدء.</p>
      ) : null}

      <Button type="button" disabled={disabled} onClick={handleSave}>
        {disabled ? "جاري الحفظ…" : "حفظ شرائح الهيرو"}
      </Button>
    </section>
  );
}

const HEADER_ICON_LABELS: Record<CategoryIconSlug, string> = {
  "kitchen-supplies": "مطبخ",
  "home-appliances": "أجهزة منزلية",
  "personal-care": "عناية شخصية",
  "cloth-iron": "مكاوي",
  "coffee-maker": "قهوة",
  "spare-parts": "قطع غيار",
};

export function HeaderCategoryStripForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsHeaderCategoryStrip;
  disabled: boolean;
  onSave: (doc: CmsHeaderCategoryStrip) => void;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [items, setItems] = useState(initial.items);

  useEffect(() => {
    setEnabled(initial.enabled);
    setItems(initial.items);
  }, [initial]);

  function presetForHref(href: string): string {
    return HEADER_NAV_ROUTE_CHOICES.some((c) => c.value === href)
      ? href
      : HEADER_NAV_ROUTE_CUSTOM;
  }

  function updateItem(
    index: number,
    patch: Partial<{ href: string; iconKey: CategoryIconSlug; label: string }>,
  ) {
    setItems((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;
      const label: string | undefined =
        patch.label !== undefined
          ? patch.label.trim() || undefined
          : cur.label;
      next[index] = {
        href: (patch.href ?? cur.href).trim(),
        iconKey: (patch.iconKey ?? cur.iconKey) as CategoryIconSlug,
        ...(label ? { label } : {}),
      };
      return next;
    });
  }

  function handleSave() {
    const doc: CmsHeaderCategoryStrip = {
      enabled,
      items: items.map((it) => ({
        href: it.href.trim(),
        iconKey: it.iconKey,
        label: it.label?.trim() ? it.label.trim() : undefined,
      })),
    };
    const parsed = cmsHeaderCategoryStripSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold">شريط أيقونات التصنيفات</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          دوائر بأيقونات فقط تحت شريط الهيدر (موبايل وديسكتوب). يُفعّل ويُعرّف من هنا ويُحفظ في
          Firestore.
        </p>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="text-sm font-medium">إظهار الشريط</span>
      </label>

      <ul className="space-y-3">
        {items.map((item, i) => {
          const preset = presetForHref(item.href);
          return (
            <li
              key={i}
              className="grid gap-2 rounded-xl border border-border/80 bg-surface-muted/20 p-3 sm:grid-cols-[1fr_1fr_minmax(0,1fr)_auto]"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground">المسار</label>
                <ControlFieldHelp>اختار الصفحة أو القسم اللي الأيقونة هتفتح عليه.</ControlFieldHelp>
                <select
                  className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
                  disabled={disabled}
                  value={preset}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === HEADER_NAV_ROUTE_CUSTOM) {
                      updateItem(i, { href: item.href || "/" });
                    } else {
                      updateItem(i, { href: v });
                    }
                  }}
                >
                  {HEADER_NAV_ROUTE_CHOICES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                  <option value={HEADER_NAV_ROUTE_CUSTOM}>— مسار مخصص (لصق يدوي) —</option>
                </select>
                {preset === HEADER_NAV_ROUTE_CUSTOM ? (
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg border border-border px-2 py-2 font-mono text-sm"
                    dir="ltr"
                    disabled={disabled}
                    value={item.href}
                    placeholder="/categories/…"
                    onChange={(e) => updateItem(i, { href: e.target.value })}
                  />
                ) : null}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">الأيقونة</label>
                <ControlFieldHelp>اختار شكل الأيقونة المناسب للقسم.</ControlFieldHelp>
                <select
                  className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
                  disabled={disabled}
                  value={item.iconKey}
                  onChange={(e) =>
                    updateItem(i, { iconKey: e.target.value as CategoryIconSlug })
                  }
                >
                  {CATEGORY_ICON_SLUGS.map((slug) => (
                    <option key={slug} value={slug}>
                      {HEADER_ICON_LABELS[slug]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground">
                  وصف لقارئ الشاشة (اختياري)
                </label>
                <ControlFieldHelp>وصف بسيط إضافي، يفيد الوصول وممكن تسيبه فاضي.</ControlFieldHelp>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
                  disabled={disabled}
                  value={item.label ?? ""}
                  placeholder="مثال: الانتقال إلى المطبخ"
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={disabled}
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                >
                  حذف
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                href: ROUTES.CATEGORIES,
                iconKey: CATEGORY_ICON_SLUGS[0]!,
                label: undefined,
              },
            ])
          }
        >
          + إضافة أيقونة
        </Button>
        <Button type="button" disabled={disabled} onClick={() => void handleSave()}>
          {disabled ? "جاري الحفظ…" : "حفظ شريط الأيقونات"}
        </Button>
      </div>
    </section>
  );
}

function HomeCategoryScrollerImageRow({
  imageUrl,
  onImageUrlChange,
  disabled,
}: {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  disabled: boolean;
}) {
  const [local, setLocal] = useState(imageUrl);

  useEffect(() => {
    setLocal(imageUrl);
  }, [imageUrl]);
  return (
    <ManagedImageUploadField
      label="صورة (اختياري) — لو حبيت تخصّص الصورة بدل الاعتماد على صورة التصنيف"
      value={local}
      onChange={(value) => {
        setLocal(value);
        onImageUrlChange(value);
      }}
      disabled={disabled}
      placeholder="https://…"
      helper="ممكن ترفع صورة مخصصة للعنصر ده أو تسيبه يعتمد على الصورة الأصلية."
      buttonLabel="اختيار صورة"
      previewClassName="max-h-24 max-w-[240px]"
      previewImageClassName="h-[60px] w-full object-cover"
    />
  );
}

export function HomeCategoryScrollerForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsHomeCategoryScroller;
  disabled: boolean;
  onSave: (doc: CmsHomeCategoryScroller) => void;
}) {
  const [sectionVisible, setSectionVisible] = useState(initial.sectionVisible);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [items, setItems] = useState(initial.items);

  useEffect(() => {
    setSectionVisible(initial.sectionVisible);
    setEnabled(initial.enabled);
    setItems(initial.items);
  }, [initial]);

  function presetForHref(href: string): string {
    return HEADER_NAV_ROUTE_CHOICES.some((c) => c.value === href)
      ? href
      : HEADER_NAV_ROUTE_CUSTOM;
  }

  function updateItem(
    index: number,
    patch: Partial<{ imageUrl: string; href: string; imageAlt: string }>,
  ) {
    setItems((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;
      const imageAlt: string | undefined =
        patch.imageAlt !== undefined
          ? patch.imageAlt.trim() || undefined
          : cur.imageAlt;
      next[index] = {
        imageUrl: (patch.imageUrl ?? cur.imageUrl ?? "").trim(),
        href: (patch.href ?? cur.href).trim(),
        ...(imageAlt ? { imageAlt } : {}),
      };
      return next;
    });
  }

  function handleSave() {
    const doc: CmsHomeCategoryScroller = {
      sectionVisible,
      enabled,
      items: items.map((it) => ({
        imageUrl: (it.imageUrl ?? "").trim(),
        href: it.href.trim(),
        imageAlt: it.imageAlt?.trim() ? it.imageAlt.trim() : undefined,
      })),
    };
    const parsed = cmsHomeCategoryScrollerSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    onSave(parsed.data);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold">شرائح التصنيفات تحت الهيرو</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          الجزء ده بيعرض صور تصنيفات تحت الهيرو في الصفحة الرئيسية. تقدر تشغله أو تقفله،
          وكمان تحدد بنفسك العناصر اللي تظهر والترتيب بتاعها.
        </p>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={sectionVisible}
          disabled={disabled}
          onChange={(e) => setSectionVisible(e.target.checked)}
        />
        <span className="text-sm font-medium">إظهار شرائح التصنيفات في الصفحة الرئيسية</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="text-sm font-medium">عرض العناصر التي أحددها أنا فقط</span>
      </label>

      <ul className="space-y-4">
        {items.map((item, i) => {
          const preset = presetForHref(item.href);
          return (
            <li
              key={i}
              className="grid gap-3 rounded-xl border border-border/80 bg-surface-muted/20 p-3 lg:grid-cols-2"
            >
              <HomeCategoryScrollerImageRow
                imageUrl={item.imageUrl ?? ""}
                disabled={disabled}
                onImageUrlChange={(url) => updateItem(i, { imageUrl: url })}
              />
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">المسار</label>
                  <ControlFieldHelp>اختار الصفحة أو القسم اللي البلاطة دي تفتح عليه.</ControlFieldHelp>
                  <select
                    className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
                    disabled={disabled}
                    value={preset}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === HEADER_NAV_ROUTE_CUSTOM) {
                        updateItem(i, { href: item.href || "/" });
                      } else {
                        updateItem(i, { href: v });
                      }
                    }}
                  >
                    {HEADER_NAV_ROUTE_CHOICES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                    <option value={HEADER_NAV_ROUTE_CUSTOM}>— مسار مخصص (لصق يدوي) —</option>
                  </select>
                  {preset === HEADER_NAV_ROUTE_CUSTOM ? (
                    <input
                      type="text"
                      className="mt-2 w-full rounded-lg border border-border px-2 py-2 font-mono text-sm"
                      dir="ltr"
                      disabled={disabled}
                      value={item.href}
                      placeholder="/categories/…"
                      onChange={(e) => updateItem(i, { href: e.target.value })}
                    />
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">نص بديل (alt) اختياري</label>
                  <ControlFieldHelp>وصف قصير للصورة، وممكن تسيبه فاضي لو مش محتاجه.</ControlFieldHelp>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
                    disabled={disabled}
                    value={item.imageAlt ?? ""}
                    onChange={(e) => updateItem(i, { imageAlt: e.target.value })}
                    placeholder="وصف قصير للصورة"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={disabled}
                    onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                imageUrl: "",
                href: ROUTES.CATEGORIES,
              },
            ])
          }
        >
          + إضافة عنصر
        </Button>
        <Button type="button" disabled={disabled} onClick={() => void handleSave()}>
          {disabled ? "جاري الحفظ…" : "حفظ شرائح التصنيفات"}
        </Button>
      </div>
    </section>
  );
}
