"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ControlPanelTabId } from "@/features/control/lib/control-tabs";
import { isControlPanelTabId } from "@/features/control/lib/control-tabs";
import { ControlAccessTab } from "@/features/control/components/ControlAccessTab";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PWA_INSTALL_NAME,
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
  CMS_DEFAULT_HEADER_CATEGORY_STRIP,
  CMS_DEFAULT_HOME_CATEGORY_SCROLLER,
  cmsHeaderCategoryStripSchema,
  cmsHomeCategoryScrollerSchema,
  cmsHomeHeroDocSchema,
  cmsBranchesDocSchema,
  cmsSectionBannersDocSchema,
  cmsRetailersDocSchema,
  cmsSpotlightsDocSchema,
  cmsSiteBrandingSchema,
} from "@/schemas/cms";
import {
  AnnouncementBarForm,
  ControlImageUrlField,
  HeaderCategoryStripForm,
  HomeCategoryScrollerForm,
  HeroSlidesForm,
  RetailersForm,
  SectionBannersForm,
  SocialLinksForm,
  SpotlightsForm,
} from "@/features/control/components/control-panel-forms";
import { ControlMediaTab } from "@/features/control/components/ControlMediaTab";
import { putCmsRequest } from "@/features/control/lib/control-cms-put";
import {
  mergeSiteConfigPatch,
} from "@/features/control/lib/site-config-merge";

type CmsBundle = {
  site_config: unknown;
  home_hero: unknown;
  section_banners: unknown;
  branches: unknown;
  retailers: unknown;
  spotlights: unknown;
};

type ClientControlSession = {
  scope: "full" | "media";
  tabs: "all" | string[];
  mediaFolders: "all" | string[];
  superAdmin: boolean;
};

const BASE_TAB_LIST: { id: ControlPanelTabId; label: string }[] = [
  { id: "general", label: "عام" },
  { id: "branding", label: "هوية الموقع" },
  { id: "hero", label: "الهيرو" },
  { id: "branches", label: "الفروع" },
  { id: "banners", label: "بانرات الأقسام" },
  { id: "retailers", label: "الموزعون" },
  { id: "spotlights", label: "إعلانات مميزة" },
  { id: "media", label: "الوسائط" },
  { id: "preview", label: "معاينة الموقع" },
  { id: "notifications", label: "إشعارات" },
  { id: "access", label: "الصلاحيات" },
];

function buildNavTabList(
  s: ClientControlSession | null,
  scope: "unknown" | "full" | "media",
): { id: ControlPanelTabId; label: string }[] {
  if (scope === "media" && s?.scope === "media") {
    return [{ id: "media", label: "الوسائط" }];
  }
  if (scope === "full" && s) {
    const fromBase = (id: ControlPanelTabId) => BASE_TAB_LIST.find((b) => b.id === id)!;
    if (s.tabs === "all") {
      const core = BASE_TAB_LIST.filter((t) => t.id !== "access");
      return s.superAdmin ? [...core, fromBase("access")] : core;
    }
    const ids = s.tabs
      .filter(
        (x) => isControlPanelTabId(x) && (x as ControlPanelTabId) !== "access",
      ) as ControlPanelTabId[];
    const out = ids.map((id) => fromBase(id));
    return s.superAdmin ? [...out, fromBase("access")] : out;
  }
  if (scope === "unknown" || !s) {
    return BASE_TAB_LIST.filter((t) => t.id !== "access");
  }
  return BASE_TAB_LIST;
}

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
  setIf("appleTouchIcon", "appleTouchIcon");
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

/*
 * لوحة التحكم: تبويبات ونماذج (بدون JSON في الواجهة)؛ التحقق بـ Zod قبل الحفظ.
 */
export function ControlPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<ControlPanelTabId>("general");
  const [bundle, setBundle] = useState<CmsBundle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [accessScope, setAccessScope] = useState<"unknown" | "full" | "media">("unknown");
  const [saving, setSaving] = useState<string | null>(null);
  const [clientSession, setClientSession] = useState<ClientControlSession | null>(null);
  /** يتغيّر بعد حفظ CMS/رفع ناجح لإعادة تحميل iframe معاينة الواجهة. */
  const [storefrontPreviewKey, setStorefrontPreviewKey] = useState(0);
  const navTabs = useMemo(
    () => buildNavTabList(clientSession, accessScope),
    [clientSession, accessScope],
  );

  const onSelectTab = useCallback(
    (next: ControlPanelTabId) => {
      if (accessScope === "media" && next !== "media") {
        return;
      }
      if (!navTabs.some((n) => n.id === next)) {
        return;
      }
      setTab(next);
      router.replace(`/control?tab=${next}`, { scroll: false });
    },
    [accessScope, router, navTabs],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSessionError(null);
      const res = await fetch("/api/control/session");
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/control/login");
        return;
      }
      if (!res.ok) {
        setSessionError("تعذر التحقق من صلاحية الجلسة");
        return;
      }
      const j = (await res.json().catch(() => ({}))) as {
        scope?: "full" | "media";
        tabs?: "all" | string[];
        mediaFolders?: "all" | string[];
        superAdmin?: boolean;
      };
      if (j.scope === "media") {
        setClientSession({
          scope: "media",
          tabs: ["media"],
          mediaFolders: j.mediaFolders === undefined ? "all" : (j.mediaFolders as "all" | string[]),
          superAdmin: Boolean(j.superAdmin),
        });
        setAccessScope("media");
        setTab("media");
        return;
      }
      setClientSession({
        scope: "full",
        tabs: (j.tabs as "all" | string[] | undefined) ?? "all",
        mediaFolders: j.mediaFolders === undefined ? "all" : (j.mediaFolders as "all" | string[]),
        superAdmin: Boolean(j.superAdmin),
      });
      setAccessScope("full");
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (accessScope === "unknown") return;
    if (accessScope === "media") {
      setTab("media");
      if (tabParam && tabParam !== "media") {
        router.replace("/control?tab=media", { scroll: false });
      }
      return;
    }
    const allowed = new Set(navTabs.map((n) => n.id));
    const first = (navTabs[0]?.id ?? "general") as ControlPanelTabId;
    if (tabParam && isControlPanelTabId(tabParam) && allowed.has(tabParam as ControlPanelTabId)) {
      setTab(tabParam);
      return;
    }
    if (tabParam != null && tabParam !== "" && !allowed.has(tabParam as ControlPanelTabId)) {
      setTab(first);
      router.replace(`/control?tab=${first}`, { scroll: false });
    }
  }, [accessScope, tabParam, router, navTabs]);

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
    if (accessScope === "full") {
      void load();
    }
  }, [accessScope, load]);

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
      setStorefrontPreviewKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(null);
    }
  }

  async function saveSiteConfig(patch: Partial<CmsSiteConfigDoc>) {
    const current = bundle?.site_config as Partial<CmsSiteConfigDoc> | null;
    await runSave("site_config", () =>
      putCmsRequest("site_config", mergeSiteConfigPatch(current, patch)),
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

  if (accessScope === "unknown" && sessionError) {
    return (
      <div className="flex min-h-dvh w-full flex-1 flex-col items-center justify-center p-4">
        <p className="text-center text-red-600">{sessionError}</p>
        <Button type="button" className="mt-4" onClick={() => window.location.reload()}>
          إعادة تحميل
        </Button>
      </div>
    );
  }

  if (accessScope === "unknown") {
    return (
      <div
        className="flex w-full min-h-0 min-h-dvh max-w-full flex-1 flex-col md:flex-row"
        aria-busy
      >
        <aside
          className="shrink-0 border-b border-border/80 bg-white p-3 sm:p-4 md:min-h-dvh md:w-64 md:shrink-0 md:overflow-y-auto md:self-stretch md:border-b-0 md:py-5 md:ps-4 md:pe-3"
          aria-hidden
        />
        <div className="bg-page flex min-h-0 min-w-0 flex-1 flex-col md:min-h-dvh md:min-w-0 md:border-s md:border-border/60">
          <header className="shrink-0 border-b border-border bg-white px-4 py-3 sm:px-5 sm:py-4">
            <h1 className="font-display text-2xl font-bold text-brand-950">إعدادات المتجر</h1>
            <p className="mt-1 text-sm text-muted-foreground">جاري التحقق من الجلسة…</p>
          </header>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 md:p-6">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (accessScope === "media") {
    return (
      <div className="flex w-full min-h-0 min-h-dvh max-w-full flex-1 flex-col md:flex-row">
        <aside className="shrink-0 border-b border-border/80 bg-white p-3 sm:p-4 md:min-h-dvh md:w-64 md:shrink-0 md:overflow-y-auto md:self-stretch md:border-b-0 md:py-5 md:ps-4 md:pe-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">صلاحية الوسائط فقط</p>
          <nav className="flex min-w-0 flex-col gap-1" role="tablist" aria-label="قسم الوسائط">
            {navTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className="min-h-12 w-full rounded-xl border border-brand-200/90 bg-brand-50 px-3 py-3 text-start text-sm font-semibold text-brand-950 sm:px-4"
                disabled
                aria-current="page"
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="bg-page flex min-h-0 min-w-0 flex-1 flex-col md:min-h-dvh md:min-w-0 md:border-s md:border-border/60">
          <header className="shrink-0 border-b border-border bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold text-brand-950">إدارة الوسائط</h1>
                <p className="text-sm text-muted-foreground">
                  رفع وقائمة وحذف الملفات ضمن المسار{" "}
                  <span dir="ltr" className="font-mono text-xs">
                    cms/site-media/
                  </span>{" "}
                  فقط.
                </p>
              </div>
              <Button type="button" variant="secondary" className="shrink-0" onClick={() => void logout()}>
                خروج
              </Button>
            </div>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            <ControlMediaTab mediaFolderPolicy={clientSession?.mediaFolders} />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex w-full min-h-0 min-h-dvh max-w-full flex-1 flex-col md:flex-row">
        <aside
          className="shrink-0 border-b border-border/80 bg-white p-3 sm:p-4 md:min-h-dvh md:w-64 md:shrink-0 md:overflow-y-auto md:self-stretch md:border-b-0 md:py-5 md:ps-4 md:pe-3"
          aria-hidden
        />
        <div className="bg-page flex min-h-0 min-w-0 flex-1 flex-col md:min-h-dvh md:min-w-0 md:border-s md:border-border/60">
          <header className="shrink-0 border-b border-border bg-white px-4 py-3 sm:px-5 sm:py-4">
            <h1 className="font-display text-2xl font-bold text-brand-950">إعدادات المتجر</h1>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            <p className="text-red-600">{loadError}</p>
            <Button type="button" className="mt-4" onClick={() => void load()}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div
        className="flex w-full min-h-0 min-h-dvh max-w-full flex-1 flex-col md:flex-row"
        aria-busy
      >
        <aside
          className="shrink-0 border-b border-border/80 bg-white p-3 sm:p-4 md:min-h-dvh md:w-64 md:shrink-0 md:overflow-y-auto md:self-stretch md:border-b-0 md:py-5 md:ps-4 md:pe-3"
          aria-hidden
        />
        <div className="bg-page flex min-h-0 min-w-0 flex-1 flex-col md:min-h-dvh md:min-w-0 md:border-s md:border-border/60">
          <header className="shrink-0 border-b border-border bg-white px-4 py-3 sm:px-5 sm:py-4">
            <h1 className="font-display text-2xl font-bold text-brand-950">إعدادات المتجر</h1>
            <p className="mt-1 text-sm text-muted-foreground">جاري التحميل…</p>
          </header>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 md:p-6">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        </div>
      </div>
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

  const currentTabLabel = navTabs.find((t) => t.id === tab)?.label ?? "المحتوى";

  /*
   * غلاف تطبيق: عمود جانبي + منطقة رئيسية (bg-page) قابلة للتمرير؛
   * معاينة: الـ content يتمدد (overflow hidden) و iframe min-h-0. RTL: أول قسم = اليمين.
   */
  return (
    <div className="flex w-full min-h-0 min-h-dvh max-w-full flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-slate-200/90 bg-white p-3 sm:p-4 md:min-h-dvh md:w-60 md:shrink-0 md:overflow-y-auto md:self-stretch md:border-b-0 md:py-5 md:ps-4 md:pe-3">
        <label
          htmlFor="control-tab-jump"
          className="mb-2 block text-sm font-medium text-slate-800 md:hidden"
        >
          القسم
        </label>
        <select
          id="control-tab-jump"
          className="mb-0 w-full min-h-12 min-w-0 rounded-lg border border-slate-200 bg-white py-3 ps-3 pe-2 text-sm font-semibold text-slate-900 shadow-sm md:hidden"
          value={tab}
          aria-label="قسم لوحة التحكم"
          onChange={(e) => onSelectTab(e.target.value as ControlPanelTabId)}
        >
          {navTabs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <nav
          className="mt-0 hidden min-w-0 flex-col gap-1 md:mt-0 md:flex"
          role="tablist"
          aria-label="أقسام لوحة التحكم"
        >
          {navTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              id={`control-tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="control-panel-body"
              className={cn(
                "min-h-10 w-full rounded-md border px-3 py-2.5 text-start text-sm font-medium transition-colors sm:px-3.5",
                tab === t.id
                  ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                  : "border-transparent text-slate-600 hover:border-transparent hover:bg-slate-100/80 hover:text-slate-900",
              )}
              onClick={() => onSelectTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f6f9fc] md:min-h-dvh md:min-w-0 md:border-s md:border-slate-200/90">
        <header className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                الإعدادات
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                إعدادات المتجر
              </h1>
              <p className="text-sm text-slate-600">
                المصدر: Firestore. الصفحات العامة تُخزَّن مؤقتًا نحو دقيقة؛ حفظ أي تبويب من
                هنا يُحدّث العرض فورًا عبر الخادم. إعدادات ‎Woo/API وعناوين التكامل من{" "}
                <span className="font-medium text-slate-800">تشخيص / ‎dev</span>.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
              onClick={() => void logout()}
            >
              خروج
            </Button>
          </div>
        </header>

        <div
          id="control-panel-body"
          className={cn(
            "min-h-0 flex-1 p-3 sm:p-4 md:p-6",
            tab === "preview"
              ? "flex min-h-0 flex-col overflow-hidden"
              : "min-w-0 overflow-y-auto",
          )}
          role="tabpanel"
          aria-label={currentTabLabel}
        >
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

          <HeaderCategoryStripForm
            key={JSON.stringify((site as { headerCategoryStrip?: unknown })?.headerCategoryStrip ?? null)}
            initial={(() => {
              const r = cmsHeaderCategoryStripSchema.safeParse(
                (site as { headerCategoryStrip?: unknown } | null)?.headerCategoryStrip ??
                  CMS_DEFAULT_HEADER_CATEGORY_STRIP,
              );
              return r.success ? r.data : CMS_DEFAULT_HEADER_CATEGORY_STRIP;
            })()}
            disabled={saving === "site_config"}
            onSave={(doc) => void saveSiteConfig({ headerCategoryStrip: doc })}
          />

          <HomeCategoryScrollerForm
            key={JSON.stringify((site as { homeCategoryScroller?: unknown })?.homeCategoryScroller ?? null)}
            initial={(() => {
              const r = cmsHomeCategoryScrollerSchema.safeParse(
                (site as { homeCategoryScroller?: unknown } | null)?.homeCategoryScroller ??
                  CMS_DEFAULT_HOME_CATEGORY_SCROLLER,
              );
              return r.success ? r.data : CMS_DEFAULT_HOME_CATEGORY_SCROLLER;
            })()}
            disabled={saving === "site_config"}
            onSave={(doc) => void saveSiteConfig({ homeCategoryScroller: doc })}
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
            <ControlImageUrlField
              name="appleTouchIcon"
              label="Apple touch icon (مسار، ١٨٠×١٨٠)"
              defaultValue={site?.branding?.appleTouchIcon ?? ""}
              placeholder="/apple-touch-icon.png"
              disabled={saving === "site_config"}
            />
            <div>
              <label className="text-sm font-medium">اسم تطبيق PWA</label>
              <input
                name="pwaName"
                defaultValue={site?.branding?.pwaName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={PWA_INSTALL_NAME}
              />
            </div>
            <div>
              <label className="text-sm font-medium">الاسم المختصر (PWA)</label>
              <input
                name="pwaShortName"
                defaultValue={site?.branding?.pwaShortName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={PWA_INSTALL_NAME}
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
                placeholder="#2F3D4E"
              />
            </div>
            <div>
              <label className="text-sm font-medium">لون الخلفية (#RRGGBB)</label>
              <input
                name="backgroundColor"
                defaultValue={site?.branding?.backgroundColor ?? ""}
                dir="ltr"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                placeholder="#2F3D4E"
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
        <ControlMediaTab
          onRemoteMediaChanged={() => setStorefrontPreviewKey((k) => k + 1)}
          mediaFolderPolicy={clientSession?.mediaFolders}
        />
      ) : null}

            {tab === "access" ? <ControlAccessTab /> : null}

            {tab === "preview" ? (
              <section
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-4"
                aria-label="معاينة مباشرة للواجهة"
              >
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold">معاينة الموقع (مباشر)</h2>
                    <p className="text-sm text-muted-foreground">
                      تُعاد تحميل المعاينة تلقائياً بعد كل حفظ (أو رفع صورة) ناجح. إن احتجت
                      واجهاً دون انتظار طبقة التخزين المؤقت (حوالي دقيقة) استخدم
                      &quot;تحديث&quot;.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStorefrontPreviewKey((k) => k + 1)}
                    >
                      تحديث المعاينة
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        window.open(
                          `/?_control_preview=${Date.now()}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      فتح في تبويب جديد
                    </Button>
                  </div>
                </div>
                <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-surface-muted/30 shadow-inner">
                  <iframe
                    key={storefrontPreviewKey}
                    title="معاينة الموقع"
                    className="block h-full min-h-[50dvh] w-full min-w-0 border-0 bg-page"
                    src={`/?_control_preview=${storefrontPreviewKey}`}
                  />
                </div>
              </section>
            ) : null}

            {tab === "notifications" ? <NotificationsSection /> : null}
        </div>
      </div>
    </div>
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
