"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { SOCIAL_ICON_PRESETS, isKnownSocialIconKey } from "@/lib/social-icon-presets";
import { SOCIAL_LINKS, type SocialLink } from "@/lib/social-links";
import type {
  CmsHomeHeroDoc,
  CmsRetailersDoc,
  CmsSectionBannersDoc,
  CmsSpotlightsDoc,
  CmsTopAnnouncementBar,
} from "@/schemas/cms";
import {
  cmsRetailersDocSchema,
  cmsSectionBannersDocSchema,
  cmsSocialLinkSchema,
  cmsSpotlightsDocSchema,
  cmsTopAnnouncementBarSchema,
} from "@/schemas/cms";
import { z } from "zod";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

export async function uploadControlImage(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  form.set("filename", file.name);
  const res = await fetch("/api/control/upload", { method: "POST", body: form });
  const j = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(j.error ?? "رفع فاشل");
  if (!j.url?.trim()) throw new Error("لم يُرجع الخادم رابطًا للصورة");
  return j.url.trim();
}

/** حقل رابط صورة لنماذج `FormData`: نص + رفع يملأ القيمة + `hidden` بنفس `name` للإرسال. */
export function ControlImageUrlField({
  name,
  label,
  defaultValue = "",
  placeholder,
  disabled,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadControlImage(file);
      setValue(url);
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploading(false);
    }
  }

  const trimmed = value.trim();
  const showPreview = trimmed.length > 0;

  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={value} />
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
          {uploading ? "جاري الرفع…" : "اختيار ملف"}
        </Button>
      </div>
      {showPreview ? (
        <div className="mt-2 max-h-36 max-w-md overflow-hidden rounded-lg border border-border bg-surface-muted/40 p-1">
          <AppImage
            src={trimmed}
            alt=""
            width={400}
            height={160}
            className="mx-auto h-auto max-h-32 w-full object-contain"
            sizes="(max-width: 28rem) 100vw, 28rem"
          />
        </div>
      ) : null}
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

  useEffect(() => {
    setEnabled(initial.enabled);
    setMode(initial.mode);
    setCarouselIntervalSec(initial.carouselIntervalSec ?? 8);
    setRows(
      initial.items.length > 0
        ? initial.items.map((i) => ({ text: i.text, href: i.href ?? "" }))
        : [{ text: "", href: "" }],
    );
  }, [initial]);

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
        يظهر فوق شريط التنقل؛ مارquee أو كاروسيل. اترك النصوص فارغة أو عطّل التفعيل لإخفاء الشريط.
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
                <input
                  value={row.text}
                  onChange={(e) => updateRow(i, { text: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="نص الإعلان"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">رابط (اختياري)</label>
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

  useEffect(() => {
    setRows(
      initialFromCms && initialFromCms.length > 0
        ? initialFromCms.map((s) => ({ ...s }))
        : SOCIAL_LINKS.map((s) => ({ ...s })),
    );
  }, [initialFromCms]);

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
              <input
                value={row.label}
                onChange={(e) => updateRow(i, "label", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 sm:col-span-1">
              <div className="min-w-0 flex-1">
                <label className="text-xs text-muted-foreground">الرابط</label>
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
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => {
    setItems(
      initial.items.length > 0
        ? initial.items.map((x) => ({ imageUrl: x.imageUrl, href: x.href ?? "" }))
        : [{ imageUrl: "", href: "" }],
    );
  }, [initial]);

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

  async function onPickFile(i: number, file: File | undefined) {
    if (!file) return;
    setUploadingIdx(i);
    try {
      const url = await uploadControlImage(file);
      updateRow(i, "imageUrl", url);
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploadingIdx(null);
    }
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
                <label className="text-xs font-medium text-muted-foreground">رابط الصورة</label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={it.imageUrl}
                    onChange={(e) => updateRow(i, "imageUrl", e.target.value)}
                    dir="ltr"
                    className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm"
                    placeholder="https://..."
                  />
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept={ACCEPT_IMAGES}
                      className="sr-only"
                      disabled={disabled || uploadingIdx === i}
                      onChange={(e) => {
                        void onPickFile(i, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <span className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-surface-muted/50">
                      {uploadingIdx === i ? "جاري الرفع…" : "رفع صورة"}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  رابط عند النقر (اختياري)
                </label>
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
  const [uploadingMap, setUploadingMap] = useState(false);
  const [uploadingRetailerIdx, setUploadingRetailerIdx] = useState<number | null>(null);

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

  async function uploadMapHero(file: File | undefined) {
    if (!file) return;
    setUploadingMap(true);
    try {
      const url = await uploadControlImage(file);
      setMapHeroSrc(url);
      toast.success("تم رفع صورة الخريطة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploadingMap(false);
    }
  }

  async function uploadRetailerImage(i: number, file: File | undefined) {
    if (!file) return;
    setUploadingRetailerIdx(i);
    try {
      const url = await uploadControlImage(file);
      setRetailers((prev) =>
        prev.map((row, j) => (j === i ? { ...row, imageSrc: url } : row)),
      );
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploadingRetailerIdx(null);
    }
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
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={mapHeroSrc}
            onChange={(e) => setMapHeroSrc(e.target.value)}
            dir="ltr"
            className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
          <label className="inline-flex cursor-pointer shrink-0">
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              className="sr-only"
              disabled={disabled || uploadingMap}
              onChange={(e) => {
                void uploadMapHero(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <span className="inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-surface-muted/50">
              {uploadingMap ? "جاري الرفع…" : "رفع"}
            </span>
          </label>
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
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground">صورة الموزع</label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={row.imageSrc}
                      onChange={(e) =>
                        setRetailers((r) =>
                          r.map((x, j) =>
                            j === i ? { ...x, imageSrc: e.target.value } : x,
                          ),
                        )
                      }
                      dir="ltr"
                      className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm"
                    />
                    <label className="inline-flex cursor-pointer">
                      <input
                        type="file"
                        accept={ACCEPT_IMAGES}
                        className="sr-only"
                        disabled={disabled || uploadingRetailerIdx === i}
                        onChange={(e) => {
                          void uploadRetailerImage(i, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                      <span className="inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold">
                        {uploadingRetailerIdx === i ? "…" : "رفع"}
                      </span>
                    </label>
                  </div>
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
          },
        ],
  );
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => {
    setItems(
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
            },
          ],
    );
  }, [initial]);

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
      },
    ]);
  }

  function removeRow(i: number) {
    setItems((s) => (s.length <= 1 ? s : s.filter((_, j) => j !== i)));
  }

  async function onPickFile(i: number, file: File | undefined) {
    if (!file) return;
    setUploadingIdx(i);
    try {
      const url = await uploadControlImage(file);
      updateRow(i, { imageUrl: url });
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploadingIdx(null);
    }
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
          <h2 className="font-display text-lg font-bold">إعلان مميز (أسفل الصفحة الرئيسية)</h2>
          <p className="text-sm text-muted-foreground">
            يُعرَض أول عنصر عليه «نشط». املأ الصورة والعناوين لظهور أفضل.
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
                <label className="text-xs text-muted-foreground">رابط الصورة</label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={row.imageUrl}
                    onChange={(e) => updateRow(i, { imageUrl: e.target.value })}
                    dir="ltr"
                    className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm"
                  />
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept={ACCEPT_IMAGES}
                      className="sr-only"
                      disabled={disabled || uploadingIdx === i}
                      onChange={(e) => {
                        void onPickFile(i, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <span className="inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold">
                      {uploadingIdx === i ? "جاري الرفع…" : "رفع"}
                    </span>
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">رابط مخصص (اختياري)</label>
                <input
                  value={row.href}
                  onChange={(e) => updateRow(i, { href: e.target.value })}
                  dir="ltr"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">عنوان</label>
                <input
                  value={row.title}
                  onChange={(e) => updateRow(i, { title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">نص فرعي</label>
                <input
                  value={row.subtitle}
                  onChange={(e) => updateRow(i, { subtitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">نص الزر</label>
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

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

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

  async function onPickFile(i: number, file: File | undefined) {
    if (!file) return;
    setUploadingIdx(i);
    try {
      const url = await uploadControlImage(file);
      updateSlide(i, "imageUrl", url);
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploadingIdx(null);
    }
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
                <label className="text-xs font-medium text-muted-foreground">
                  رابط الصورة (URL)
                </label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={slide.imageUrl}
                    onChange={(e) => updateSlide(i, "imageUrl", e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="https://..."
                    dir="ltr"
                  />
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept={ACCEPT_IMAGES}
                      className="sr-only"
                      disabled={disabled || uploadingIdx === i}
                      onChange={(e) => {
                        void onPickFile(i, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <span className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-surface-muted/50">
                      {uploadingIdx === i ? "جاري الرفع…" : "رفع صورة"}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">وصف للصورة (alt)</label>
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
