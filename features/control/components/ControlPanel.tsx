"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";
import {
  SITE_BRAND_TITLE_AR,
  SITE_LOGO_DISABLED,
  SITE_NAME,
  SITE_WORDMARK,
} from "@/lib/constants";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import type {
  CmsHomeHeroDoc,
  CmsSiteConfigDoc,
  CmsBranchesDoc,
  CmsSiteBranding,
  CmsSectionBannersDoc,
  CmsRetailersDoc,
  CmsSpotlightsDoc,
} from "@/schemas/cms";
import {
  CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR,
  cmsHomeHeroDocSchema,
  cmsBranchesDocSchema,
  cmsSectionBannersDocSchema,
  cmsRetailersDocSchema,
  cmsSpotlightsDocSchema,
  cmsSiteBrandingSchema,
  cmsSiteConfigDocSchema,
} from "@/schemas/cms";
import {
  AnnouncementBarForm,
  ControlImageUrlField,
  HeroSlidesForm,
  RetailersForm,
  SectionBannersForm,
  SocialLinksForm,
  SpotlightsForm,
  uploadControlImage,
} from "@/features/control/components/control-panel-forms";

type CmsBundle = {
  site_config: unknown;
  home_hero: unknown;
  section_banners: unknown;
  branches: unknown;
  retailers: unknown;
  spotlights: unknown;
};

type TabId =
  | "general"
  | "branding"
  | "hero"
  | "branches"
  | "banners"
  | "retailers"
  | "spotlights"
  | "media"
  | "notifications";

function SearchQuickKeywordsSection({
  cmsKeywords,
  disabled,
  onSave,
}: {
  cmsKeywords: string[] | undefined;
  disabled: boolean;
  onSave: (keywords: string[]) => void;
}) {
  const [rows, setRows] = useState<string[]>(() =>
    cmsKeywords && cmsKeywords.length > 0 ? [...cmsKeywords] : [""],
  );

  useEffect(() => {
    setRows(cmsKeywords && cmsKeywords.length > 0 ? [...cmsKeywords] : [""]);
  }, [cmsKeywords]);

  function updateRow(i: number, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function removeRow(i: number) {
    setRows((prev) => (prev.length <= 1 ? [""] : prev.filter((_, j) => j !== i)));
  }

  function addRow() {
    setRows((prev) => [...prev, ""]);
  }

  function fillFromDefaults() {
    setRows([...DEFAULT_SEARCH_QUICK_KEYWORDS]);
  }

  function handleSave() {
    const out = rows.map((r) => r.trim()).filter(Boolean);
    if (out.length > 40) {
      toast.error("الحد الأقصى ٤٠ كلمة.");
      return;
    }
    if (out.some((k) => k.length > 64)) {
      toast.error("كل كلمة يجب ألا تتجاوز ٦٤ حرفًا.");
      return;
    }
    onSave(out);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">كلمات البحث السريعة (الهيدر)</h2>
      <p className="text-sm text-muted-foreground">
        تظهر عند فتح حقل البحث قبل كتابة ٣ أحرف. إن لم تُحفظ كلمات في CMS يُستخدم الافتراضي من
        الكود.
      </p>
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li key={i} className="flex gap-2">
            <input
              type="text"
              value={row}
              onChange={(e) => updateRow(i, e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2"
              placeholder="كلمة بحث"
              dir="auto"
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={disabled}
              onClick={() => removeRow(i)}
            >
              حذف
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={disabled} onClick={addRow}>
          إضافة سطر
        </Button>
        <Button type="button" variant="secondary" disabled={disabled} onClick={fillFromDefaults}>
          ملء من الافتراضي (الكود)
        </Button>
        <Button type="button" disabled={disabled} onClick={handleSave}>
          {disabled ? "جاري الحفظ…" : "حفظ الكلمات"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onSave([])}
        >
          مسح من CMS (الموقع يستخدم الافتراضي)
        </Button>
      </div>
    </section>
  );
}

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "عام" },
  { id: "branding", label: "هوية الموقع" },
  { id: "hero", label: "الهيرو" },
  { id: "branches", label: "الفروع" },
  { id: "banners", label: "بانرات الأقسام" },
  { id: "retailers", label: "الموزعون" },
  { id: "spotlights", label: "إعلانات مميزة" },
  { id: "media", label: "الوسائط" },
  { id: "notifications", label: "إشعارات" },
];

function formatControlApiError(payload: { error?: unknown }): string {
  const e = payload.error;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "formErrors" in e) {
    const f = e as {
      formErrors: string[];
      fieldErrors: Record<string, string[] | undefined>;
    };
    const fe = Object.values(f.fieldErrors)
      .filter(Boolean)
      .flat() as string[];
    const parts = [...(f.formErrors ?? []), ...fe];
    return parts.length > 0 ? parts.join(" — ") : "خطأ في التحقق من البيانات";
  }
  return "فشل الحفظ";
}

/** حقول نصية فارغة تُحذف؛ `logoDisabled` يُمرَّر دائمًا من خانة الاختيار. */
function brandingFromForm(fd: FormData): CmsSiteBranding {
  const t = (name: string) => String(fd.get(name) ?? "").trim();
  const b: CmsSiteBranding = {};
  const setIf = (key: keyof CmsSiteBranding, name: string) => {
    const v = t(name);
    if (v) (b as Record<string, string>)[key as string] = v;
  };
  setIf("siteName", "siteName");
  setIf("siteBrandTitleAr", "siteBrandTitleAr");
  setIf("siteWordmark", "siteWordmark");
  setIf("logoPath", "logoPath");
  setIf("icon192", "icon192");
  setIf("icon512", "icon512");
  setIf("pwaName", "pwaName");
  setIf("pwaShortName", "pwaShortName");
  setIf("pwaDescription", "pwaDescription");
  setIf("themeColor", "themeColor");
  setIf("backgroundColor", "backgroundColor");
  setIf("defaultMetadataTitle", "defaultMetadataTitle");
  setIf("defaultOgImageUrl", "defaultOgImageUrl");
  setIf("organizationName", "organizationName");
  setIf("organizationLogoUrl", "organizationLogoUrl");
  setIf("supportPhoneDisplay", "supportPhoneDisplay");
  b.logoDisabled = fd.get("logoDisabled") === "on";
  return b;
}

async function putCmsRequest(key: string, data: unknown): Promise<void> {
  const res = await fetch("/api/control/cms", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, data }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: unknown };
    throw new Error(formatControlApiError(j));
  }
}

/*
 * لوحة التحكم: تبويبات ونماذج (بدون JSON في الواجهة)؛ التحقق بـ Zod قبل الحفظ.
 */
export function ControlPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("general");
  const [bundle, setBundle] = useState<CmsBundle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastUploadUrl, setLastUploadUrl] = useState<string | null>(null);
  /** معاينة محلية أثناء الرفع أو بعد فشل الرفع (blob URL) */
  const [uploadLocalPreviewUrl, setUploadLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadLocalPreviewUrl) URL.revokeObjectURL(uploadLocalPreviewUrl);
    };
  }, [uploadLocalPreviewUrl]);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/control/cms");
      if (res.status === 401) {
        router.replace("/control/login");
        return;
      }
      if (!res.ok) throw new Error("تعذر تحميل البيانات");
      const data = (await res.json()) as CmsBundle;
      setBundle(data);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "خطأ");
      toast.error("تعذر تحميل الإعدادات");
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/control/session", { method: "DELETE" });
    router.replace("/control/login");
    router.refresh();
    toast.success("تم تسجيل الخروج");
  }

  async function runSave(
    key: string,
    fn: () => Promise<void>,
    successMsg = "تم الحفظ",
  ) {
    setSaving(key);
    try {
      await fn();
      toast.success(successMsg);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(null);
    }
  }

  function mergeSiteConfigPatch(patch: Partial<CmsSiteConfigDoc>): CmsSiteConfigDoc {
    const current = bundle?.site_config as Partial<CmsSiteConfigDoc> | null;
    return cmsSiteConfigDocSchema.parse({
      promoFlash:
        patch.promoFlash ??
        current?.promoFlash ?? {
          enabled: true,
          endsAt: null,
          headline: undefined,
          subline: undefined,
        },
      topAnnouncementBar:
        patch.topAnnouncementBar ??
        current?.topAnnouncementBar ??
        CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR,
      socialLinks: patch.socialLinks ?? current?.socialLinks,
      branding:
        patch.branding !== undefined ? patch.branding : current?.branding,
      searchQuickKeywords:
        patch.searchQuickKeywords !== undefined
          ? patch.searchQuickKeywords
          : current?.searchQuickKeywords,
    });
  }

  async function saveSiteConfig(patch: Partial<CmsSiteConfigDoc>) {
    await runSave("site_config", () =>
      putCmsRequest("site_config", mergeSiteConfigPatch(patch)),
    );
  }

  async function saveHomeHero(doc: CmsHomeHeroDoc) {
    const filteredSlides = doc.slides.filter((s) => s.imageUrl.trim().length > 0);
    const normalized: CmsHomeHeroDoc = {
      ...doc,
      slides: filteredSlides,
    };
    const parsed = cmsHomeHeroDocSchema.safeParse(normalized);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    await runSave("home_hero", () => putCmsRequest("home_hero", parsed.data));
  }

  async function saveBranches(doc: CmsBranchesDoc) {
    const parsed = cmsBranchesDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    await runSave("branches", () => putCmsRequest("branches", parsed.data));
  }

  async function saveSectionBanners(doc: CmsSectionBannersDoc) {
    const parsed = cmsSectionBannersDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    await runSave("section_banners", () =>
      putCmsRequest("section_banners", parsed.data),
    );
  }

  async function saveRetailers(doc: CmsRetailersDoc) {
    const parsed = cmsRetailersDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    await runSave("retailers", () => putCmsRequest("retailers", parsed.data));
  }

  async function saveSpotlights(doc: CmsSpotlightsDoc) {
    const parsed = cmsSpotlightsDocSchema.safeParse(doc);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    await runSave("spotlights", () => putCmsRequest("spotlights", parsed.data));
  }

  async function seedBranchesRetailers() {
    await runSave("seed", async () => {
      const res = await fetch("/api/control/seed", { method: "POST" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "فشل الاستيراد");
      }
    }, "تم استيراد الفروع والموزعين من الملفات الثابتة");
  }

  async function onUploadFile(f: File) {
    setUploading(true);
    setLastUploadUrl(null);
    setUploadLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    try {
      const url = await uploadControlImage(f);
      setLastUploadUrl(url);
      setUploadLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      toast.success("تم رفع الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
      setUploadLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } finally {
      setUploading(false);
    }
  }

  if (loadError) {
    return (
      <Container className="py-10">
        <p className="text-red-600">{loadError}</p>
        <Button type="button" className="mt-4" onClick={() => void load()}>
          إعادة المحاولة
        </Button>
      </Container>
    );
  }

  if (!bundle) {
    return (
      <Container className="py-16">
        <p className="text-muted-foreground">جاري التحميل…</p>
      </Container>
    );
  }

  const site = bundle.site_config as Partial<CmsSiteConfigDoc> | null;
  const promo = site?.promoFlash ?? {
    enabled: true,
    endsAt: null,
    headline: "",
    subline: "",
  };
  const ann = site?.topAnnouncementBar ?? CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR;

  const homeHeroParsed = cmsHomeHeroDocSchema.safeParse(bundle.home_hero ?? { slides: [] });
  const homeHero: CmsHomeHeroDoc = homeHeroParsed.success
    ? homeHeroParsed.data
    : { slides: [] };

  const branchesParsed = cmsBranchesDocSchema.safeParse(
    bundle.branches ?? { sales: [], service: [] },
  );
  const branches: CmsBranchesDoc = branchesParsed.success
    ? branchesParsed.data
    : { sales: [], service: [] };

  const sectionBannersParsed = cmsSectionBannersDocSchema.safeParse(
    bundle.section_banners ?? { items: [] },
  );
  const sectionBanners: CmsSectionBannersDoc = sectionBannersParsed.success
    ? sectionBannersParsed.data
    : { items: [] };

  const retailersParsed = cmsRetailersDocSchema.safeParse(
    bundle.retailers ?? { retailers: [], mapHeroSrc: "" },
  );
  const retailersDoc: CmsRetailersDoc = retailersParsed.success
    ? retailersParsed.data
    : { retailers: [], mapHeroSrc: "" };

  const spotlightsParsed = cmsSpotlightsDocSchema.safeParse(
    bundle.spotlights ?? { items: [] },
  );
  const spotlightsDoc: CmsSpotlightsDoc = spotlightsParsed.success
    ? spotlightsParsed.data
    : { items: [] };

  return (
    <Container className="py-8 pb-24">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-950">إعدادات المتجر</h1>
          <p className="text-sm text-muted-foreground">
            المصدر: Firestore. الصفحات العامة تُخزَّن مؤقتًا نحو دقيقة؛ حفظ أي تبويب من هنا يُحدّث
            العرض فورًا عبر الخادم.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void logout()}>
          خروج
        </Button>
      </header>

      {/* شريط تبويبات: سكرول أفقي على الجوال */}
      <div
        className="mb-8 flex gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="أقسام لوحة التحكم"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id
                ? "border-b-2 border-brand-500 bg-brand-50/80 text-brand-950"
                : "text-muted-foreground hover:bg-surface-muted/60 hover:text-foreground",
            )}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" ? (
        <section className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold">قسم العروض السريعة</h2>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const enabled = fd.get("enabled") === "on";
                const endsRaw = String(fd.get("endsAt") ?? "");
                let endsAt: string | null = null;
                if (endsRaw) {
                  const d = new Date(endsRaw);
                  if (!Number.isNaN(d.getTime())) {
                    endsAt = d.toISOString();
                  }
                }
                void saveSiteConfig({
                  promoFlash: {
                    enabled,
                    endsAt,
                    headline: String(fd.get("headline") ?? "") || undefined,
                    subline: String(fd.get("subline") ?? "") || undefined,
                  },
                });
              }}
            >
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" name="enabled" defaultChecked={promo.enabled} />
                <span>إظهار قسم العروض السريعة بالكامل</span>
              </label>
              <div>
                <label className="text-sm font-medium">نهاية العد (محلي)</label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  defaultValue={
                    promo.endsAt
                      ? new Date(promo.endsAt).toISOString().slice(0, 16)
                      : ""
                  }
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">عنوان رئيسي</label>
                <input
                  name="headline"
                  defaultValue={promo.headline ?? ""}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">نص فرعي</label>
                <textarea
                  name="subline"
                  defaultValue={promo.subline ?? ""}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving === "site_config"}>
                  {saving === "site_config" ? "جاري الحفظ…" : "حفظ إعدادات العروض"}
                </Button>
              </div>
            </form>
          </section>

          <AnnouncementBarForm
            key={JSON.stringify(ann)}
            initial={ann}
            disabled={saving === "site_config"}
            onSave={(bar) => void saveSiteConfig({ topAnnouncementBar: bar })}
          />

          <SocialLinksForm
            key={JSON.stringify(site?.socialLinks ?? null)}
            initialFromCms={site?.socialLinks}
            disabled={saving === "site_config"}
            onSave={(links) => void saveSiteConfig({ socialLinks: links })}
            onResetDefaults={() => void saveSiteConfig({ socialLinks: [] })}
          />

          <SearchQuickKeywordsSection
            key={JSON.stringify(site?.searchQuickKeywords ?? null)}
            cmsKeywords={site?.searchQuickKeywords}
            disabled={saving === "site_config"}
            onSave={(keywords) => void saveSiteConfig({ searchQuickKeywords: keywords })}
          />

          <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5">
            <h2 className="font-display text-lg font-bold">استيراد سريع</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              نسخ فروع البيع/الصيانة وقائمة الموزعين من الكود الثابت إلى Firestore.
            </p>
            <Button
              type="button"
              className="mt-4"
              variant="secondary"
              disabled={saving === "seed"}
              onClick={() => void seedBranchesRetailers()}
            >
              {saving === "seed" ? "جاري الاستيراد…" : "استيراد الفروع والموزعين من الموقع الثابت"}
            </Button>
          </section>
        </section>
      ) : null}

      {tab === "branding" ? (
        <section
          key={JSON.stringify(site?.branding ?? null)}
          className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="font-display text-lg font-bold">هوية الموقع و SEO و PWA</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              اترك الحقل فارغًا لاستخدام القيمة الافتراضية من المتغيرات العامة أو الكود. يُحدَّث العرض خلال
              حوالي دقيقة (ذاكرة التخزين المؤقت).
            </p>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const branding = brandingFromForm(fd);
              const parsed = cmsSiteBrandingSchema.safeParse(branding);
              if (!parsed.success) {
                toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
                return;
              }
              void saveSiteConfig({ branding: parsed.data });
            }}
          >
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">اسم الموقع (واجهة)</label>
              <input
                name="siteName"
                defaultValue={site?.branding?.siteName ?? ""}
                placeholder={SITE_NAME}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">العنوان العربي (قالب SEO)</label>
              <input
                name="siteBrandTitleAr"
                defaultValue={site?.branding?.siteBrandTitleAr ?? ""}
                placeholder={SITE_BRAND_TITLE_AR}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">العلامة اللاتينية المختصرة</label>
              <input
                name="siteWordmark"
                defaultValue={site?.branding?.siteWordmark ?? ""}
                placeholder={SITE_WORDMARK}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <ControlImageUrlField
              className="sm:col-span-2"
              name="logoPath"
              label="مسار شعار الصورة (public أو URL)"
              defaultValue={site?.branding?.logoPath ?? ""}
              placeholder="/images/logo.png"
              disabled={saving === "site_config"}
            />
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                name="logoDisabled"
                defaultChecked={site?.branding?.logoDisabled ?? SITE_LOGO_DISABLED}
              />
              <span>إخفاء صورة الشعار وعرض الاسم نصًا (مثل تعطيل NEXT_PUBLIC_SITE_LOGO_PATH)</span>
            </label>
            <ControlImageUrlField
              name="icon192"
              label="أيقونة ١٩٢ (مسار)"
              defaultValue={site?.branding?.icon192 ?? ""}
              placeholder="/images/icon-192.png"
              disabled={saving === "site_config"}
            />
            <ControlImageUrlField
              name="icon512"
              label="أيقونة ٥١٢ (مسار)"
              defaultValue={site?.branding?.icon512 ?? ""}
              placeholder="/images/icon-512.png"
              disabled={saving === "site_config"}
            />
            <div>
              <label className="text-sm font-medium">اسم تطبيق PWA</label>
              <input
                name="pwaName"
                defaultValue={site?.branding?.pwaName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={SITE_BRAND_TITLE_AR}
              />
            </div>
            <div>
              <label className="text-sm font-medium">الاسم المختصر (PWA)</label>
              <input
                name="pwaShortName"
                defaultValue={site?.branding?.pwaShortName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder="سوكانى"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">وصف الموقع / PWA</label>
              <textarea
                name="pwaDescription"
                defaultValue={site?.branding?.pwaDescription ?? ""}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder="متجر أجهزة سوكانى الكهربائية"
              />
            </div>
            <div>
              <label className="text-sm font-medium">لون السمة (#RRGGBB)</label>
              <input
                name="themeColor"
                defaultValue={site?.branding?.themeColor ?? ""}
                dir="ltr"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                placeholder="#0f172a"
              />
            </div>
            <div>
              <label className="text-sm font-medium">لون الخلفية (#RRGGBB)</label>
              <input
                name="backgroundColor"
                defaultValue={site?.branding?.backgroundColor ?? ""}
                dir="ltr"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                placeholder="#fafafa"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">عنوان الصفحة الافتراضي (metadata)</label>
              <input
                name="defaultMetadataTitle"
                defaultValue={site?.branding?.defaultMetadataTitle ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={SITE_BRAND_TITLE_AR}
              />
            </div>
            <ControlImageUrlField
              className="sm:col-span-2"
              name="defaultOgImageUrl"
              label="صورة OG الافتراضية (URL)"
              defaultValue={site?.branding?.defaultOgImageUrl ?? ""}
              disabled={saving === "site_config"}
            />
            <div>
              <label className="text-sm font-medium">اسم المنظمة (JSON-LD)</label>
              <input
                name="organizationName"
                defaultValue={site?.branding?.organizationName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={SITE_BRAND_TITLE_AR}
              />
            </div>
            <ControlImageUrlField
              name="organizationLogoUrl"
              label="شعار المنظمة (JSON-LD)"
              defaultValue={site?.branding?.organizationLogoUrl ?? ""}
              disabled={saving === "site_config"}
            />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">هاتف الدعم (للعرض و JSON-LD)</label>
              <input
                name="supportPhoneDisplay"
                defaultValue={site?.branding?.supportPhoneDisplay ?? ""}
                dir="ltr"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                placeholder="+20…"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving === "site_config"}>
                {saving === "site_config" ? "جاري الحفظ…" : "حفظ هوية الموقع"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={saving === "site_config"}
                onClick={() => void saveSiteConfig({ branding: {} })}
              >
                مسح تجاوزات CMS (العودة للافتراضي)
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {tab === "hero" ? (
        <HeroSlidesForm
          key={JSON.stringify({
            slides: homeHero.slides,
            fb: homeHero.useFileFallbackWhenEmpty,
          })}
          initial={homeHero}
          disabled={saving === "home_hero"}
          onSave={(doc) => void saveHomeHero(doc)}
        />
      ) : null}

      {tab === "branches" ? (
        <BranchesForm
          key={JSON.stringify(branches)}
          initial={branches}
          disabled={saving === "branches"}
          onSave={(doc) => void saveBranches(doc)}
        />
      ) : null}

      {tab === "banners" ? (
        <SectionBannersForm
          key={JSON.stringify(sectionBanners.items)}
          initial={sectionBanners}
          disabled={saving === "section_banners"}
          onSave={(doc) => void saveSectionBanners(doc)}
        />
      ) : null}

      {tab === "retailers" ? (
        <RetailersForm
          key={JSON.stringify(retailersDoc)}
          initial={retailersDoc}
          disabled={saving === "retailers"}
          onSave={(doc) => void saveRetailers(doc)}
        />
      ) : null}

      {tab === "spotlights" ? (
        <SpotlightsForm
          key={JSON.stringify(spotlightsDoc.items)}
          initial={spotlightsDoc}
          disabled={saving === "spotlights"}
          onSave={(doc) => void saveSpotlights(doc)}
        />
      ) : null}

      {tab === "media" ? (
        <section className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold">رفع صورة</h2>
          <p className="text-sm text-muted-foreground">
            الأساس: ارفع من نفس التبويب الذي يحتوي الحقل (الهيرو، الهوية، البانرات، الموزعون، إلخ).
            هذا القسم اختياري إذا احتجت رابطًا عامًا للنسخ السريع دون فتح تبويب آخر.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onUploadFile(f);
            }}
          />
          {uploading ? (
            <p className="text-sm text-muted-foreground">جاري الرفع…</p>
          ) : null}
          {lastUploadUrl ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-950">معاينة الصورة المرفوعة</p>
              <div className="relative max-h-[min(24rem,70vh)] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                <AppImage
                  src={lastUploadUrl}
                  alt="معاينة الصورة بعد الرفع"
                  width={1200}
                  height={675}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 42rem) 100vw, 42rem"
                />
              </div>
              <p className="break-all rounded-lg bg-surface-muted/50 p-3 font-mono text-xs text-muted-foreground">
                {lastUploadUrl}
              </p>
            </div>
          ) : null}
          {uploadLocalPreviewUrl && uploading ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-950">معاينة قبل اكتمال الرفع</p>
              <div className="relative max-h-[min(24rem,70vh)] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface-muted/40">
                <img
                  src={uploadLocalPreviewUrl}
                  alt="معاينة محلية"
                  className="h-auto max-h-[min(24rem,70vh)] w-full object-contain"
                />
              </div>
            </div>
          ) : null}
          {uploadLocalPreviewUrl && !uploading && !lastUploadUrl ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-900">
                معاينة (فشل الرفع — يمكنك اختيار ملف آخر)
              </p>
              <div className="relative max-h-[min(24rem,70vh)] w-full max-w-2xl overflow-hidden rounded-xl border border-amber-200 bg-amber-50/50">
                <img
                  src={uploadLocalPreviewUrl}
                  alt="معاينة محلية"
                  className="h-auto max-h-[min(24rem,70vh)] w-full object-contain"
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "notifications" ? <NotificationsSection /> : null}
    </Container>
  );
}

function BranchesForm({
  initial,
  disabled,
  onSave,
}: {
  initial: CmsBranchesDoc;
  disabled: boolean;
  onSave: (doc: CmsBranchesDoc) => void;
}) {
  const [sales, setSales] = useState(initial.sales);
  const [service, setService] = useState(initial.service);

  useEffect(() => {
    setSales(initial.sales);
    setService(initial.service);
  }, [initial]);

  function addSales() {
    setSales((s) => [
      ...s,
      { name: "", address: "", googleMapsUrl: "https://www.google.com/maps" },
    ]);
  }
  function addService() {
    setService((s) => [...s, { name: "", address: "", whatsapp: "" }]);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold">فروع البيع والاستلام</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addSales}>
            + فرع بيع
          </Button>
        </div>
        <ul className="space-y-4">
          {sales.map((row, i) => (
            <li key={`s-${i}`} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-2 flex justify-between gap-2">
                <span className="text-sm font-semibold">فرع {i + 1}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600"
                  onClick={() => setSales((x) => x.filter((_, j) => j !== i))}
                >
                  حذف
                </button>
              </div>
              <div className="grid gap-2">
                <input
                  placeholder="اسم الفرع"
                  value={row.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSales((x) => x.map((r, j) => (j === i ? { ...r, name: v } : r)));
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="العنوان"
                  value={row.address}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSales((x) => x.map((r, j) => (j === i ? { ...r, address: v } : r)));
                  }}
                  rows={2}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <input
                  placeholder="رابط خرائط Google (https://...)"
                  value={row.googleMapsUrl}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSales((x) => x.map((r, j) => (j === i ? { ...r, googleMapsUrl: v } : r)));
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold">مراكز الصيانة</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addService}>
            + مركز صيانة
          </Button>
        </div>
        <ul className="space-y-4">
          {service.map((row, i) => (
            <li key={`v-${i}`} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="mb-2 flex justify-between gap-2">
                <span className="text-sm font-semibold">مركز {i + 1}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600"
                  onClick={() => setService((x) => x.filter((_, j) => j !== i))}
                >
                  حذف
                </button>
              </div>
              <div className="grid gap-2">
                <input
                  placeholder="الاسم"
                  value={row.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setService((x) => x.map((r, j) => (j === i ? { ...r, name: v } : r)));
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="العنوان"
                  value={row.address}
                  onChange={(e) => {
                    const v = e.target.value;
                    setService((x) => x.map((r, j) => (j === i ? { ...r, address: v } : r)));
                  }}
                  rows={2}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <input
                  placeholder="واتساب (مثال 01xxxxxxxxx)"
                  value={row.whatsapp}
                  onChange={(e) => {
                    const v = e.target.value;
                    setService((x) => x.map((r, j) => (j === i ? { ...r, whatsapp: v } : r)));
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" disabled={disabled} onClick={() => onSave({ sales, service })}>
        {disabled ? "جاري الحفظ…" : "حفظ الفروع"}
      </Button>
    </div>
  );
}

function NotificationsSection() {
  const [title, setTitle] = useState("تنبيه من سوكانى");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function send() {
    setPending(true);
    try {
      const res = await fetch("/api/control/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, topic: "all_customers" }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(j.error ?? "فشل الإرسال");
      toast.success("تم إرسال الإشعار للموضوع");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">إشعار (FCM topic)</h2>
      <p className="text-sm text-muted-foreground">
        يُرسل إلى الموضوع «all_customers» للمشتركين الذين وافقوا على الإشعارات.
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-2"
        placeholder="العنوان"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border px-3 py-2"
        placeholder="نص الإشعار"
      />
      <Button type="button" disabled={pending || !body.trim()} onClick={() => void send()}>
        {pending ? "جاري الإرسال…" : "إرسال"}
      </Button>
    </section>
  );
}
