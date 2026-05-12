"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ControlPanelTabId } from "@/features/control/lib/control-tabs";
import {
  CONTROL_TAB_GROUPS,
  normalizeControlSessionTabList,
  normalizeLegacyControlTabId,
} from "@/features/control/lib/control-tabs";
import { ControlAccessTab } from "@/features/control/components/ControlAccessTab";
import { ControlIntegrationsHubTab } from "@/features/control/components/ControlIntegrationsHubTab";
import { ControlLandingPageTab } from "@/features/control/components/ControlLandingPageTab";
import { ControlProductsTab } from "@/features/control/components/ControlProductsTab";
import {
  useControlSession,
  ControlUnauthorizedError,
} from "@/features/control/hooks/useControlSession";
import {
  CONTROL_CMS_BUNDLE_QUERY_KEY,
  useControlCmsBundle,
} from "@/features/control/hooks/useControlCmsBundle";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  BellRing,
  Eye,
  Home,
  Globe,
  FolderKanban,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  MonitorPlay,
  PackageSearch,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
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
import {
  DEFAULT_BRAND_THEME_COLOR,
  normalizeStorefrontThemeColor,
} from "@/lib/site-branding";
import type {
  CmsHomeHeroDoc,
  CmsSiteConfigDoc,
  CmsBranchesDoc,
  CmsSiteBranding,
  CmsSectionBannersDoc,
  CmsRetailersDoc,
  CmsSpotlightsDoc,
  CmsHomeFeatureVideo,
  CmsProductLandingPage,
} from "@/schemas/cms";
import {
  CMS_DEFAULT_ASSISTANT_CONFIG,
  CMS_DEFAULT_HOME_FEATURE_VIDEO,
  CMS_DEFAULT_PRODUCT_LANDING_PAGE,
  CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR,
  CMS_DEFAULT_HEADER_CATEGORY_STRIP,
  CMS_DEFAULT_HOME_CATEGORY_SCROLLER,
  cmsHomeFeatureVideoSchema,
  cmsProductLandingPageSchema,
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
  SocialLinksForm,
  SpotlightsForm,
} from "@/features/control/components/control-panel-forms";
import { mergeSpotlightsDocWithLegacySitePromo } from "@/features/cms/lib/merge-spotlights-legacy-promo";
import { HomeProductSectionsForm } from "@/features/control/components/HomeProductSectionsForm";
import { ControlMediaTab } from "@/features/control/components/ControlMediaTab";
import { putCmsRequest } from "@/features/control/lib/control-cms-put";
import {
  mergeSiteConfigPatch,
} from "@/features/control/lib/site-config-merge";
import {
  ControlActionTile,
  ControlMiniGuide,
  ControlPageHeader,
  ControlSectionIntro,
  ControlStatCard,
} from "@/features/control/components/control-page-chrome";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";

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
  { id: "general", label: "إعدادات عامة" },
  { id: "branding", label: "محتوى الواجهة" },
  { id: "inventory", label: "المنتجات والمخزون و3D" },
  { id: "product3d", label: "المنتجات والمخزون و3D" },
  { id: "hero", label: "محتوى الواجهة" },
  { id: "home", label: "محتوى الواجهة" },
  { id: "landing", label: "صفحة هبوط منتج" },
  { id: "branches", label: "الفروع والموزعين" },
  { id: "retailers", label: "الفروع والموزعين" },
  { id: "media", label: "الوسائط" },
  { id: "preview", label: "معاينة الموقع" },
  { id: "notifications", label: "إرسال إشعار للعملاء" },
  { id: "health", label: "Woo والطلبات وصحة الربط" },
  { id: "access", label: "الصلاحيات" },
];

const NAV_TAB_IDS: ControlPanelTabId[] = [
  "general",
  "home",
  "landing",
  "branches",
  "media",
  "inventory",
  "health",
  "notifications",
  "access",
];

const MERGED_TAB_TARGETS: Partial<Record<ControlPanelTabId, ControlPanelTabId>> = {
  branding: "home",
  hero: "home",
  retailers: "branches",
  product3d: "inventory",
};

function getVisibleTabId(id: ControlPanelTabId): ControlPanelTabId {
  return MERGED_TAB_TARGETS[id] ?? id;
}

const TAB_EXPLAINERS: Record<
  ControlPanelTabId,
  {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    badge: string;
    icon: typeof LayoutDashboard;
  }
> = {
  general: {
    eyebrow: "تشغيل يومي",
    title: "إعدادات عامة",
    description:
      "ده مكان الحاجات اليومية: رسائل، روابط، شات، وبحث سريع. أي حاجة مشتركة في أكتر من صفحة تبدأ من هنا.",
    bullets: ["بيعدل بيانات مشتركة", "مناسب للتغييرات السريعة"],
    badge: "عام",
    icon: LayoutDashboard,
  },
  branding: {
    eyebrow: "واجهة المتجر",
    title: "محتوى الواجهة",
    description:
      "كل اللي بيظهر للعميل في أول واجهة: الاسم، الشعار، الهيرو، أقسام الهوم، الفيديو، والبانرات.",
    bullets: ["مكان واحد للواجهة", "بدون تكرار بين الهيرو والهوم والهوية"],
    badge: "الواجهة",
    icon: Palette,
  },
  inventory: {
    eyebrow: "منتجات",
    title: "المنتجات والمخزون و3D",
    description:
      "مراجعة المنتجات الظاهرة، حالة المخزون، وربط موديل 3D بنفس SKU من نفس الشاشة.",
    bullets: ["المخزون والموديل في نفس المكان", "مناسب لمراجعة Woo اليومية"],
    badge: "منتجات",
    icon: PackageSearch,
  },
  product3d: {
    eyebrow: "منتجات",
    title: "المنتجات والمخزون و3D",
    description:
      "اتدمجت مع المخزون عشان كل حاجة تخص المنتج تبقى في مكان واحد.",
    bullets: ["ربط حسب SKU", "تفعيل أو إخفاء للعميل"],
    badge: "منتجات",
    icon: PackageSearch,
  },
  hero: {
    eyebrow: "واجهة المتجر",
    title: "محتوى الواجهة",
    description:
      "الهيرو جزء من محتوى الواجهة، فبقى مع الهوم والهوية بدل تبويب منفصل.",
    bullets: ["أول حاجة العميل بيشوفها", "مفيد للعروض والمواسم"],
    badge: "الواجهة",
    icon: Sparkles,
  },
  home: {
    eyebrow: "واجهة المتجر",
    title: "محتوى الواجهة",
    description:
      "كل تعديل بيغير شكل واجهة المتجر للعميل موجود هنا: الهوية، الهيرو، أقسام الهوم، الفيديو، والسبوتلايت.",
    bullets: [
      "هوية وهيرو وهوم في شاشة واحدة",
      "كل جزء واضح باسمه",
    ],
    badge: "الواجهة",
    icon: Home,
  },
  landing: {
    eyebrow: "عرض فلاش",
    title: "صفحة هبوط لمنتج واحد",
    description:
      "اختار منتج من WooCommerce وافتح له صفحة بيع مركّزة مع عداد فلاش ونسخة تسويقية من لوحة التحكم.",
    bullets: ["اختيار المنتج من التحكم", "عداد عرض مستقل", "رابط قابل للمشاركة"],
    badge: "Landing",
    icon: Megaphone,
  },
  branches: {
    eyebrow: "أماكن الوصول",
    title: "الفروع والموزعين",
    description:
      "الفروع ومراكز الخدمة والموزعين في شاشة واحدة عشان العميل يعرف يوصلك منين.",
    bullets: ["أماكن البيع والخدمة مع بعض", "بيانات واضحة للعميل"],
    badge: "أماكن الوصول",
    icon: MapPinned,
  },
  retailers: {
    eyebrow: "أماكن الوصول",
    title: "الفروع والموزعين",
    description:
      "اتدمجت مع الفروع لأنها نفس الفكرة: أماكن يشتري منها العميل أو يطلب خدمة.",
    bullets: ["موزعين وفروع في مكان واحد", "أسهل في الصيانة"],
    badge: "أماكن الوصول",
    icon: Store,
  },
  media: {
    eyebrow: "المكتبة",
    title: "رفع الصور والملفات وإدارتها",
    description:
      "من هنا نرفع الصور والملفات المستخدمة داخل لوحة التحكم، ونستبدلها أو نحذفها بدون لمس الكود.",
    bullets: ["يحفظ الملفات في مكان واحد", "يسهّل النسخ والاستبدال", "مناسب للمحتوى المتغير باستمرار"],
    badge: "الوسائط",
    icon: FolderKanban,
  },
  preview: {
    eyebrow: "معاينة",
    title: "معاينة الموقع",
    description:
      "زر سريع لمراجعة شكل المتجر بعد الحفظ. مش إعداد مستقل، لكنه موجود كرابط مباشر لو محتاجه.",
    bullets: ["راجع النتيجة", "افتحها بعد أي تعديل بصري"],
    badge: "معاينة",
    icon: Eye,
  },
  notifications: {
    eyebrow: "رسالة للعملاء",
    title: "إرسال إشعار للعملاء",
    description:
      "اكتب رسالة قصيرة تظهر للعملاء المشتركين في إشعارات المتجر.",
    bullets: ["مناسب للعروض العاجلة", "اكتب مختصر وواضح"],
    badge: "إشعارات",
    icon: BellRing,
  },
  health: {
    eyebrow: "ربط وتشغيل",
    title: "Woo والطلبات وصحة الربط",
    description:
      "هنا متابعة حالة الموقع، ربط Woo، الويبهوك، وإعدادات إرسال الطلبات. التفاصيل التقنية جوه أقسام صغيرة.",
    bullets: [
      "متابعة الحالة",
      "إعدادات الربط الحساسة",
    ],
    badge: "ربط",
    icon: Activity,
  },
  access: {
    eyebrow: "إدارة الفريق",
    title: "صلاحيات الدخول إلى لوحة التحكم",
    description:
      "حدد مين يدخل لوحة التحكم، ومين يشوف أي قسم. العمليات الحساسة للمشرف الرئيسي فقط.",
    bullets: ["صلاحيات واضحة", "حماية للحاجات الحساسة"],
    badge: "أمان",
    icon: ShieldCheck,
  },
};

function buildNavTabList(
  s: ClientControlSession | null,
  scope: "unknown" | "full" | "media",
): { id: ControlPanelTabId; label: string }[] {
  if (scope === "media" && s?.scope === "media") {
    return [{ id: "media", label: "الوسائط" }];
  }
  const fromBase = (id: ControlPanelTabId) => BASE_TAB_LIST.find((b) => b.id === id)!;
  const toVisibleItems = (ids: ControlPanelTabId[]) => {
    const visible = new Set(ids.map(getVisibleTabId));
    if (visible.has("home")) visible.add("landing");
    return NAV_TAB_IDS.filter((id) => visible.has(id)).map((id) => fromBase(id));
  };
  if (scope === "full" && s) {
    if (s.tabs === "all") {
      const core = toVisibleItems(NAV_TAB_IDS.filter((id) => id !== "access"));
      return s.superAdmin ? [...core, fromBase("access")] : core;
    }
    const ids = normalizeControlSessionTabList(s.tabs as string[]).filter((x) => x !== "access");
    const out = toVisibleItems(ids);
    return s.superAdmin ? [...out, fromBase("access")] : out;
  }
  if (scope === "unknown" || !s) {
    return NAV_TAB_IDS.filter((id) => id !== "access").map((id) => fromBase(id));
  }
  return NAV_TAB_IDS.map((id) => fromBase(id));
}

const SEARCH_QUICK_KEYWORDS_MAX = 40;
const SEARCH_QUICK_KEYWORD_MAX_LEN = 64;

type WooTagSuggestionRow = { name: string; slug: string; count: number };

function dedupeQuickKeywordsPreserveOrder(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const t = r.trim();
    if (!t || t.length > SEARCH_QUICK_KEYWORD_MAX_LEN) continue;
    const k = t.toLocaleLowerCase("ar");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= SEARCH_QUICK_KEYWORDS_MAX) break;
  }
  return out;
}

function rowsToKeywordList(rows: string[]): string[] {
  return rows.map((r) => r.trim()).filter(Boolean);
}

function ensureAtLeastOneRow(list: string[]): string[] {
  return list.length === 0 ? [""] : list;
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
  const [wooSuggestions, setWooSuggestions] = useState<WooTagSuggestionRow[] | null>(null);
  const [wooLoading, setWooLoading] = useState(false);
  const [wooError, setWooError] = useState<string | null>(null);

  const loadWooTagSuggestions = useCallback(async () => {
    setWooError(null);
    setWooLoading(true);
    try {
      const res = await fetch("/api/control/search-quick-keyword-suggestions", {
        credentials: "include",
      });
      const j = (await res.json()) as
        | { tags: WooTagSuggestionRow[]; error?: undefined }
        | { error: string; tags?: undefined };
      if (!res.ok || "error" in j) {
        setWooSuggestions(null);
        setWooError(
          "error" in j && typeof j.error === "string" && j.error.trim()
            ? j.error
            : "تعذر التحميل",
        );
        return;
      }
      setWooSuggestions(Array.isArray(j.tags) ? j.tags : []);
    } catch (e) {
      setWooSuggestions(null);
      setWooError(e instanceof Error ? e.message : "خطأ شبكة");
    } finally {
      setWooLoading(false);
    }
  }, []);

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
    setRows((prev) => {
      if (rowsToKeywordList(prev).length >= SEARCH_QUICK_KEYWORDS_MAX) {
        toast.error(`الحد الأقصى ${SEARCH_QUICK_KEYWORDS_MAX} كلمة.`);
        return prev;
      }
      return [...prev, ""];
    });
  }

  function fillFromDefaults() {
    setRows(ensureAtLeastOneRow(dedupeQuickKeywordsPreserveOrder([...DEFAULT_SEARCH_QUICK_KEYWORDS])));
  }

  function applyTopWooTags() {
    if (!wooSuggestions?.length) return;
    const names = wooSuggestions.map((t) => t.name);
    const next = dedupeQuickKeywordsPreserveOrder(names);
    if (next.length === 0) {
      toast.error("لا توجد وسوم صالحة ضمن الحدود (طول الاسم حتى ٦٤ حرفًا).");
      return;
    }
    setRows(ensureAtLeastOneRow(next));
    toast.success("تم استبدال القائمة بأوائل وسوم المتجر (حسب عدد المنتجات).");
  }

  function appendWooTagName(name: string) {
    const t = name.trim();
    if (!t || t.length > SEARCH_QUICK_KEYWORD_MAX_LEN) {
      toast.error("الوسم أطول من الحد المسموح (٦٤ حرفًا).");
      return;
    }
    setRows((prev) => {
      const current = rowsToKeywordList(prev);
      const k = t.toLocaleLowerCase("ar");
      if (current.some((x) => x.toLocaleLowerCase("ar") === k)) {
        toast.message("الكلمة موجودة بالفعل في القائمة.");
        return prev;
      }
      if (current.length >= SEARCH_QUICK_KEYWORDS_MAX) {
        toast.error(`الحد الأقصى ${SEARCH_QUICK_KEYWORDS_MAX} كلمة.`);
        return prev;
      }
      return ensureAtLeastOneRow([...current, t]);
    });
  }

  function handleSave() {
    const out = rowsToKeywordList(rows);
    if (out.length > SEARCH_QUICK_KEYWORDS_MAX) {
      toast.error(`الحد الأقصى ${SEARCH_QUICK_KEYWORDS_MAX} كلمة.`);
      return;
    }
    if (out.some((k) => k.length > SEARCH_QUICK_KEYWORD_MAX_LEN)) {
      toast.error(`كل كلمة يجب ألا تتجاوز ${SEARCH_QUICK_KEYWORD_MAX_LEN} حرفًا.`);
      return;
    }
    onSave(out);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">اقتراحات البحث السريعة</h2>
      <p className="text-sm text-muted-foreground">
        الكلمات دي بتظهر للعميل أول ما يفتح البحث. اختار كلمات قصيرة تساعده يوصل للمنتجات بسرعة.
      </p>
      <details className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-900">تفاصيل تقنية</summary>
        <p className="mt-2">
          ممكن تجيب وسوم Woo حسب عدد المنتجات. ده مؤشر من الكتالوج، مش سجل بحث العملاء.
          صفحات نتائج البحث غير مخصصة للفهرسة، فخلي SEO الأساسي في صفحات المنتجات والتصنيفات.
        </p>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || wooLoading}
          onClick={() => void loadWooTagSuggestions()}
        >
          {wooLoading ? "جاري جلب الوسوم…" : "جلب وسوم من المتجر"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || !wooSuggestions?.length}
          onClick={applyTopWooTags}
        >
          استبدال القائمة بأوائل الوسوم
        </Button>
      </div>
      {wooError ? (
        <p className="text-sm text-destructive" role="alert">
          {wooError}
        </p>
      ) : null}
      {wooSuggestions && wooSuggestions.length > 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            وسوم من Woo (عدد المنتجات) — اضغط «إضافة» لدمجها في القائمة أدناه
          </p>
          <ul className="max-h-56 space-y-1 overflow-y-auto overscroll-y-contain pe-1">
            {wooSuggestions.map((t, idx) => (
              <li
                key={t.slug ? `${t.slug}-${idx}` : `${t.name}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-sm"
              >
                <span className="min-w-0 truncate" dir="auto" title={t.name}>
                  {t.name}{" "}
                  <span className="text-muted-foreground">({t.count})</span>
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                  disabled={disabled}
                  onClick={() => appendWooTagName(t.name)}
                >
                  إضافة
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : wooSuggestions && wooSuggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد وسوم بمنتجات في Woo حاليًا.</p>
      ) : null}

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
          استخدام الاقتراحات الجاهزة
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
          حذف التعديل والرجوع للجاهز
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
  setIf("productCardBadgeText", "productCardBadgeText");
  b.logoDisabled = fd.get("logoDisabled") === "on";
  b.productCardBadgeEnabled = fd.get("productCardBadgeEnabled") === "on";
  return b;
}

/*
 * لوحة التحكم: تبويبات ونماذج (بدون JSON في الواجهة)؛ التحقق بـ Zod قبل الحفظ.
 */
export function ControlPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<ControlPanelTabId>("general");
  const [saving, setSaving] = useState<string | null>(null);
  /** يتغيّر بعد حفظ CMS/رفع ناجح لإعادة تحميل iframe معاينة الواجهة. */
  const [storefrontPreviewKey, setStorefrontPreviewKey] = useState(0);

  const sessionQuery = useControlSession();
  const sessionData = sessionQuery.data;
  const sessionError =
    sessionQuery.error && !(sessionQuery.error instanceof ControlUnauthorizedError)
      ? "تعذر التحقق من صلاحية الجلسة"
      : null;
  const accessScope: "unknown" | "full" | "media" = sessionData
    ? sessionData.scope
    : "unknown";
  const clientSession = useMemo<ClientControlSession | null>(
    () =>
      sessionData
        ? {
            scope: sessionData.scope,
            tabs: sessionData.scope === "media" ? ["media"] : sessionData.tabs,
            mediaFolders: sessionData.mediaFolders,
            superAdmin: sessionData.superAdmin,
          }
        : null,
    [sessionData],
  );

  const cmsQuery = useControlCmsBundle({ enabled: accessScope === "full" });
  const bundle = (cmsQuery.data ?? null) as CmsBundle | null;
  const loadError =
    cmsQuery.error && !(cmsQuery.error instanceof ControlUnauthorizedError)
      ? cmsQuery.error instanceof Error
        ? cmsQuery.error.message
        : "خطأ"
      : null;

  useEffect(() => {
    if (loadError) {
      toast.error("تعذر تحميل الإعدادات");
    }
  }, [loadError]);

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
    const normalizedParam = tabParam ? normalizeLegacyControlTabId(tabParam) : null;
    const directPreviewAllowed =
      normalizedParam === "preview" &&
      (clientSession?.tabs === "all" ||
        (Array.isArray(clientSession?.tabs) &&
          normalizeControlSessionTabList(clientSession.tabs).includes("preview")));
    if (directPreviewAllowed) {
      setTab("preview");
      return;
    }
    const visibleParam = normalizedParam ? getVisibleTabId(normalizedParam) : null;
    if (visibleParam && allowed.has(visibleParam)) {
      setTab(visibleParam);
      if (tabParam !== visibleParam) {
        router.replace(`/control?tab=${visibleParam}`, { scroll: false });
      }
      return;
    }
    if (tabParam != null && tabParam !== "") {
      setTab(first);
      router.replace(`/control?tab=${first}`, { scroll: false });
    }
  }, [accessScope, clientSession, tabParam, router, navTabs]);

  const load = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: CONTROL_CMS_BUNDLE_QUERY_KEY,
    });
  }, [queryClient]);

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
  const assistant = site?.assistant ?? CMS_DEFAULT_ASSISTANT_CONFIG;
  const promo = site?.promoFlash ?? {
    enabled: true,
    endsAt: null,
    headline: "",
    subline: "",
  };
  const ann = site?.topAnnouncementBar ?? CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR;
  const homeFeatureVideoParsed = cmsHomeFeatureVideoSchema.safeParse(
    site?.homeFeatureVideo ?? CMS_DEFAULT_HOME_FEATURE_VIDEO,
  );
  const homeFeatureVideo: CmsHomeFeatureVideo = homeFeatureVideoParsed.success
    ? homeFeatureVideoParsed.data
    : CMS_DEFAULT_HOME_FEATURE_VIDEO;
  const productLandingPageParsed = cmsProductLandingPageSchema.safeParse(
    site?.productLandingPage ?? CMS_DEFAULT_PRODUCT_LANDING_PAGE,
  );
  const productLandingPage: CmsProductLandingPage = productLandingPageParsed.success
    ? productLandingPageParsed.data
    : CMS_DEFAULT_PRODUCT_LANDING_PAGE;

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
  const spotlightsDocForForm = mergeSpotlightsDocWithLegacySitePromo(
    spotlightsDoc,
    bundle.site_config,
  );

  const currentTabLabel = navTabs.find((t) => t.id === tab)?.label ?? "المحتوى";
  const currentTabInfo = TAB_EXPLAINERS[tab];
  const navTabsSet = new Set(navTabs.map((item) => item.id));
  const groupedNavTabs = CONTROL_TAB_GROUPS.map((group) => ({
    ...group,
    ids: group.ids.filter((id) => navTabsSet.has(id)),
  })).filter((group) => group.ids.length > 0);
  const overviewStats = [
    {
      label: "شرائح الهيرو",
      value: String(homeHero.slides.length),
      hint: "عدد الشرائح الرئيسية المعروضة الآن في واجهة المتجر.",
      tone: "brand" as const,
      icon: Sparkles,
    },
    {
      label: "الفروع والخدمة",
      value: String(branches.sales.length + branches.service.length),
      hint: "إجمالي نقاط البيع ومراكز الخدمة المخزنة داخل اللوحة.",
      tone: "emerald" as const,
      icon: MapPinned,
    },
    {
      label: "بانرات وإعلانات",
      value: String(sectionBanners.items.length + spotlightsDoc.items.length),
      hint: "كل الوحدات الدعائية التي تساعدنا نوجّه العميل داخل المتجر.",
      tone: "amber" as const,
      icon: Megaphone,
    },
    {
      label: "موزعون",
      value: String(retailersDoc.retailers.length),
      hint: "عدد نقاط البيع أو الموزعين المعروضة حاليًا للعميل.",
      tone: "slate" as const,
      icon: Store,
    },
  ];
  const quickGuides = [
    {
      title: "من أين أبدأ؟",
      badge: "للعمل اليومي",
      description:
        "ابدأ من «إعدادات عامة» للرسائل والروابط المشتركة، ومن «محتوى الواجهة» لأي حاجة ظاهرة في الهوم.",
    },
    {
      title: "متى أستخدم الوسائط؟",
      badge: "رفع ملفات",
      description:
        "إذا أردت صورة جديدة أو استبدال ملف قديم بدون لمس الريبو، استخدم تبويب «الوسائط» ثم انسخ الرابط داخل القسم المطلوب.",
    },
    {
      title: "كيف أتأكد من النتيجة؟",
      badge: "قبل النشر",
      description:
        "بعد أي تعديل بصري، اضغط زر «معاينة» فوق وشوف النتيجة قبل ما تعتبر الشغل خلص.",
    },
  ];
  const generalActionTiles = [
    {
      title: "تعديل أول واجهة تظهر للعميل",
      description: "ادخل على محتوى الواجهة لو عندك بانر، هيرو، فيديو، أو أقسام هوم عايز تعدلها.",
      href: "/control?tab=home",
      cta: "فتح محتوى الواجهة",
      icon: Sparkles,
    },
    {
      title: "رفع صورة أو ملف بسرعة",
      description: "من الوسائط تقدر ترفع الصور وتنسخ الرابط وتستخدمه في أي جزء داخل التحكم.",
      href: "/control?tab=media",
      cta: "فتح الوسائط",
      icon: FolderKanban,
    },
    {
      title: "مراجعة شكل الموقع قبل النشر",
      description: "لو خلصت التعديلات وعايز تتأكد من النتيجة، افتح المعاينة المباشرة.",
      href: "/control?tab=preview",
      cta: "فتح المعاينة",
      icon: MonitorPlay,
    },
  ] as const;

  /*
   * غلاف تطبيق: عمود جانبي + منطقة رئيسية (bg-page) قابلة للتمرير؛
   * معاينة: الـ content يتمدد (overflow hidden) و iframe min-h-0. RTL: أول قسم = اليمين.
   */
  return (
    <div className="flex w-full min-h-0 min-h-dvh max-w-full flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-slate-200/90 bg-white p-3 sm:p-4 md:min-h-dvh md:w-72 md:shrink-0 md:overflow-y-auto md:self-stretch md:border-b-0 md:py-5 md:ps-4 md:pe-3">
        <div className="mb-4 hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            لوحة الإدارة
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            اختار القسم من هنا، وكل قسم فيه الحقول الخاصة به فقط بدون تشتيت.
          </p>
        </div>
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
        <nav className="mt-0 hidden min-w-0 flex-col gap-2 md:flex" role="tablist" aria-label="أقسام لوحة التحكم">
          {groupedNavTabs.map((group) => {
            const open = group.ids.includes(tab);
            return (
              <details
                key={group.label}
                className="group rounded-2xl border border-slate-200/90 bg-slate-50/40"
                open={open}
              >
                <summary className="cursor-pointer list-none px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {group.label}
                    <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
                  </span>
                </summary>
                <div className="space-y-1 border-t border-slate-200/60 px-2 pb-2 pt-1">
                  {group.ids.map((id) => {
                    const info = TAB_EXPLAINERS[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        id={`control-tab-${id}`}
                        role="tab"
                        aria-selected={tab === id}
                        aria-controls="control-panel-body"
                        className={cn(
                          "w-full rounded-2xl border px-3 py-3 text-start transition-colors",
                          tab === id
                            ? "border-brand-300 bg-brand-50 text-slate-950 shadow-sm"
                            : "border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                        )}
                        onClick={() => onSelectTab(id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">{info.badge}</span>
                          <span className="text-[11px] text-slate-400">
                            {BASE_TAB_LIST.find((item) => item.id === id)?.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{info.title}</p>
                      </button>
                    );
                  })}
                </div>
              </details>
            );
          })}

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-semibold text-slate-600">روابط سريعة</p>
            <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-950">
              <Globe className="h-4 w-4" />
              فتح المتجر
            </Link>
            <Link href="/control?tab=health" className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-950">
              <MonitorPlay className="h-4 w-4" />
              متابعة الحالة
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f6f9fc] md:min-h-dvh md:min-w-0 md:border-s md:border-slate-200/90">
        <header className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-3 sm:px-5 sm:py-4">
          <ControlPageHeader
            compact
            eyebrow={currentTabInfo.eyebrow}
            title={
              BASE_TAB_LIST.find((item) => item.id === tab)?.label ??
              "إعدادات المتجر"
            }
            description={currentTabInfo.description}
            actions={
              <>
                <Link
                  href="/control?tab=preview"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                >
                  معاينة
                </Link>
                <Link
                  href="/control?tab=health"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                >
                  صحة وربط
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
                  onClick={() => void logout()}
                >
                  خروج
                </Button>
              </>
            }
          />
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
          <div className={cn("space-y-6", tab === "preview" && "flex min-h-0 flex-1 flex-col")}>
            {tab !== "preview" ? (
              <ControlSectionIntro
                eyebrow={currentTabInfo.eyebrow}
                title={currentTabInfo.title}
                description={currentTabInfo.description}
                bullets={currentTabInfo.bullets}
                tone={tab === "access" ? "slate" : tab === "health" ? "amber" : "brand"}
                icon={currentTabInfo.icon}
                compact
              />
            ) : null}

            {tab === "general" ? (
              <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {overviewStats.map((item) => (
                    <ControlStatCard
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      hint={item.hint}
                      tone={item.tone}
                      icon={item.icon}
                    />
                  ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <div className="grid gap-3">
                    {generalActionTiles.map((tile) => (
                      <ControlActionTile
                        key={tile.title}
                        title={tile.title}
                        description={tile.description}
                        icon={tile.icon}
                        cta={
                          <Link
                            href={tile.href}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                          >
                            {tile.cta}
                          </Link>
                        }
                      />
                    ))}
                  </div>

                  <div className="grid gap-3">
                    {quickGuides.map((guide) => (
                      <ControlMiniGuide
                        key={guide.title}
                        title={guide.title}
                        description={guide.description}
                        badge={guide.badge}
                      />
                    ))}
                  </div>
                </section>
              </>
            ) : null}

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
                <ControlFieldHelp>
                  لو العرض له وقت نهاية، اختاره من هنا. لو مفيش وقت انتهاء سيبه فاضي.
                </ControlFieldHelp>
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
                <ControlFieldHelp>
                  ده العنوان الكبير اللي هيظهر للعميل في جزء العروض.
                </ControlFieldHelp>
                <input
                  name="headline"
                  defaultValue={promo.headline ?? ""}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">نص فرعي</label>
                <ControlFieldHelp>
                  اكتب جملة قصيرة توضّح العرض أو الفايدة بشكل بسيط.
                </ControlFieldHelp>
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

          <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg font-bold">مساعد الشات العام</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                تحكم في ظهور أيقونة مساعد سوكاني على واجهة المتجر العامة فقط.
              </p>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void saveSiteConfig({
                  assistant: { enabled: fd.get("assistantEnabled") === "on" },
                });
              }}
            >
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <input
                  type="checkbox"
                  name="assistantEnabled"
                  defaultChecked={assistant.enabled}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-950">
                    إظهار أيقونة الشات في المتجر
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    عند الإغلاق لن تظهر الأيقونة للعملاء، ولن يتغير مسار API أو أي إعدادات أخرى.
                  </span>
                </span>
              </label>
              <Button type="submit" disabled={saving === "site_config"}>
                {saving === "site_config" ? "جاري الحفظ…" : "حفظ إعداد الشات"}
              </Button>
            </form>
          </section>

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

            {tab === "inventory" ? <ControlProductsTab /> : null}

            {tab === "landing" ? (
              <ControlLandingPageTab
                key={JSON.stringify(productLandingPage)}
                initial={productLandingPage}
                disabled={saving === "site_config"}
                onSave={(doc) => void saveSiteConfig({ productLandingPage: doc })}
              />
            ) : null}

      {tab === "home" ? (
        <section className="space-y-6">
        <section
          key={JSON.stringify(site?.branding ?? null)}
          className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="font-display text-lg font-bold">هوية الموقع</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              الاسم والشعار والصور العامة. لو سبت حقل فاضي هنستخدم القيمة الافتراضية.
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
              <ControlFieldHelp>
                الاسم الأساسي اللي يظهر للعميل داخل الموقع.
              </ControlFieldHelp>
              <input
                name="siteName"
                defaultValue={site?.branding?.siteName ?? ""}
                placeholder={SITE_NAME}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">العنوان العربي (قالب SEO)</label>
              <ControlFieldHelp>
                الاسم العربي الرسمي اللي تحب يظهر في العناوين والمشاركة.
              </ControlFieldHelp>
              <input
                name="siteBrandTitleAr"
                defaultValue={site?.branding?.siteBrandTitleAr ?? ""}
                placeholder={SITE_BRAND_TITLE_AR}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">العلامة اللاتينية المختصرة</label>
              <ControlFieldHelp>
                الاسم الإنجليزي أو المختصر اللي يظهر في أماكن صغيرة مثل الهيدر.
              </ControlFieldHelp>
              <input
                name="siteWordmark"
                defaultValue={site?.branding?.siteWordmark ?? ""}
                placeholder={SITE_WORDMARK}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2 rounded-xl border border-border/80 bg-surface-muted/20 p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="productCardBadgeEnabled"
                  defaultChecked={site?.branding?.productCardBadgeEnabled ?? true}
                />
                <span className="text-sm font-medium">
                  إظهار ليبول الاعتماد على كارت المنتج وصفحة المنتج
                </span>
              </label>
              <div className="mt-3">
                <label className="text-sm font-medium">نص الليبول</label>
                <ControlFieldHelp>
                  يظهر فوق صورة كارت المنتج وداخل شريط الثقة في صفحة المنتج. اتركه فارغًا لاستخدام النص الافتراضي.
                </ControlFieldHelp>
                <input
                  name="productCardBadgeText"
                  defaultValue={site?.branding?.productCardBadgeText ?? ""}
                  placeholder={`Official ${site?.branding?.siteWordmark ?? SITE_WORDMARK}`}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                />
              </div>
            </div>
            <ControlImageUrlField
              className="sm:col-span-2"
              name="logoPath"
              label="صورة الشعار"
              helper="ارفع لوجو المتجر هنا، وهو اللي هيظهر بدل الاسم في أغلب الأماكن."
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
              <span>إخفاء صورة الشعار وعرض اسم المتجر نصيًا بدلًا منها</span>
            </label>
            <ControlImageUrlField
              name="icon192"
              label="أيقونة التطبيق الصغيرة"
              helper="دي الأيقونة الصغيرة اللي تظهر عند تثبيت الموقع أو في بعض الأجهزة."
              defaultValue={site?.branding?.icon192 ?? ""}
              placeholder="/images/icon-192.png"
              disabled={saving === "site_config"}
            />
            <ControlImageUrlField
              name="icon512"
              label="أيقونة التطبيق الكبيرة"
              helper="دي النسخة الأكبر من أيقونة التطبيق، وبعض الأجهزة تعتمد عليها."
              defaultValue={site?.branding?.icon512 ?? ""}
              placeholder="/images/icon-512.png"
              disabled={saving === "site_config"}
            />
            <ControlImageUrlField
              name="appleTouchIcon"
              label="أيقونة أجهزة iPhone و iPad"
              helper="الصورة اللي تظهر لو حد حفظ الموقع على شاشة iPhone أو iPad."
              defaultValue={site?.branding?.appleTouchIcon ?? ""}
              placeholder="/apple-touch-icon.png"
              disabled={saving === "site_config"}
            />
            <div>
              <label className="text-sm font-medium">اسم تطبيق PWA</label>
              <ControlFieldHelp>
                الاسم الكامل اللي يظهر لو العميل ثبّت الموقع كتطبيق على الموبايل.
              </ControlFieldHelp>
              <input
                name="pwaName"
                defaultValue={site?.branding?.pwaName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={PWA_INSTALL_NAME}
              />
            </div>
            <div>
              <label className="text-sm font-medium">الاسم المختصر (PWA)</label>
              <ControlFieldHelp>
                اسم أقصر يظهر تحت أيقونة التطبيق لو المساحة صغيرة.
              </ControlFieldHelp>
              <input
                name="pwaShortName"
                defaultValue={site?.branding?.pwaShortName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={PWA_INSTALL_NAME}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">وصف الموقع / PWA</label>
              <ControlFieldHelp>
                وصف قصير جدًا يشرح المتجر بيبيع إيه أو بيقدّم إيه.
              </ControlFieldHelp>
              <textarea
                name="pwaDescription"
                defaultValue={site?.branding?.pwaDescription ?? ""}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder="متجر أجهزة سوكانى الكهربائية"
              />
            </div>
            <div>
              <label className="text-sm font-medium">لون الواجهة الأساسي</label>
              <ControlFieldHelp>
                اللون الأساسي اللي يعبر عن هوية المتجر في المتصفح وبعض الشاشات.
              </ControlFieldHelp>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  aria-label="لون الواجهة الأساسي"
                  defaultValue={normalizeStorefrontThemeColor(
                    site?.branding?.themeColor,
                  )}
                  className="h-12 w-16 rounded-lg border border-border bg-white p-1"
                  onChange={(e) => {
                    const form = e.currentTarget.form;
                    const hidden = form?.elements.namedItem("themeColor");
                    if (hidden instanceof HTMLInputElement) hidden.value = e.target.value;
                  }}
                />
                <input
                  type="text"
                  name="themeColor"
                  defaultValue={normalizeStorefrontThemeColor(
                    site?.branding?.themeColor,
                  )}
                  dir="ltr"
                  className="w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                  placeholder={DEFAULT_BRAND_THEME_COLOR}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">لون خلفية التطبيق</label>
              <ControlFieldHelp>
                لون الخلفية العامة للتطبيق أو الشاشة الافتتاحية.
              </ControlFieldHelp>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  aria-label="لون خلفية التطبيق"
                  defaultValue={site?.branding?.backgroundColor ?? "#2F3D4E"}
                  className="h-12 w-16 rounded-lg border border-border bg-white p-1"
                  onChange={(e) => {
                    const form = e.currentTarget.form;
                    const hidden = form?.elements.namedItem("backgroundColor");
                    if (hidden instanceof HTMLInputElement) hidden.value = e.target.value;
                  }}
                />
                <input
                  type="text"
                  name="backgroundColor"
                  defaultValue={site?.branding?.backgroundColor ?? "#2F3D4E"}
                  dir="ltr"
                  className="w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                  placeholder="#2F3D4E"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">العنوان الافتراضي للمتجر</label>
              <ControlFieldHelp>
                العنوان الافتراضي اللي يستخدم لو الصفحة نفسها ما عندهاش عنوان خاص.
              </ControlFieldHelp>
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
              label="صورة المشاركة عند نشر رابط الموقع"
              helper="الصورة اللي تظهر لما حد يشارك رابط الموقع على واتساب أو فيسبوك."
              defaultValue={site?.branding?.defaultOgImageUrl ?? ""}
              disabled={saving === "site_config"}
            />
            <div>
              <label className="text-sm font-medium">اسم النشاط التجاري</label>
              <ControlFieldHelp>
                الاسم التجاري الرسمي للنشاط أو الشركة.
              </ControlFieldHelp>
              <input
                name="organizationName"
                defaultValue={site?.branding?.organizationName ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                placeholder={SITE_BRAND_TITLE_AR}
              />
            </div>
            <ControlImageUrlField
              name="organizationLogoUrl"
              label="شعار النشاط التجاري"
              helper="شعار النشاط التجاري بصيغة واضحة، ويُستخدم في بيانات تعريف الموقع."
              defaultValue={site?.branding?.organizationLogoUrl ?? ""}
              disabled={saving === "site_config"}
            />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">هاتف الدعم الظاهر للعملاء</label>
              <ControlFieldHelp>
                رقم خدمة العملاء اللي تحب الزبون يشوفه داخل الموقع.
              </ControlFieldHelp>
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
                الرجوع للهوية الافتراضية
              </Button>
            </div>
          </form>
        </section>

        <HeroSlidesForm
          key={JSON.stringify({
            slides: homeHero.slides,
            fb: homeHero.useFileFallbackWhenEmpty,
          })}
          initial={homeHero}
          disabled={saving === "home_hero"}
          onSave={(doc) => void saveHomeHero(doc)}
        />

          <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg font-bold">فيديو الصفحة الرئيسية</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                فيديو يعمل تلقائياً مكتوماً. ادعم رابط ملف مباشر (mp4/webm) — أو رابط يوتيوب/فيميو وسيتم عرضه ببلاير المنصّة.
              </p>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const doc = {
                  enabled: fd.get("enabled") === "on",
                  videoUrl: String(fd.get("videoUrl") ?? "").trim(),
                  posterImageUrl: String(fd.get("posterImageUrl") ?? "").trim(),
                  placement: String(fd.get("placement") ?? "afterHero"),
                };
                const parsed = cmsHomeFeatureVideoSchema.safeParse(doc);
                if (!parsed.success) {
                  toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
                  return;
                }
                void saveSiteConfig({ homeFeatureVideo: parsed.data });
              }}
            >
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={homeFeatureVideo.enabled}
                />
                <span>إظهار الفيديو في الصفحة الرئيسية</span>
              </label>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">رابط الفيديو</label>
                <ControlFieldHelp>
                  ملف فيديو مباشر (mp4/webm) من الوسائط أو CDN — أو رابط يوتيوب (youtu.be / youtube.com) أو فيميو (vimeo.com). روابط يوتيوب/فيميو تعرض ببلاير المنصّة لتشغيل الصوت.
                </ControlFieldHelp>
                <input
                  name="videoUrl"
                  defaultValue={homeFeatureVideo.videoUrl}
                  dir="ltr"
                  placeholder="https://.../video.mp4 أو https://youtu.be/..."
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <ControlImageUrlField
                className="sm:col-span-2"
                name="posterImageUrl"
                label="صورة قبل تحميل الفيديو"
                helper="اختياري: صورة تظهر قبل تحميل أول فريم من الفيديو."
                defaultValue={homeFeatureVideo.posterImageUrl}
                disabled={saving === "site_config"}
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">مكان الفيديو</label>
                <select
                  name="placement"
                  defaultValue={homeFeatureVideo.placement}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2"
                >
                  <option value="top">بداية الصفحة قبل الهيرو</option>
                  <option value="afterHero">بعد الهيرو مباشرة</option>
                  <option value="afterFlashSales">بعد العروض السريعة</option>
                  <option value="afterServices">بعد كبسولة الخدمات</option>
                  <option value="afterPromo">بعد البانر الترويجي</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving === "site_config"}>
                  {saving === "site_config" ? "جاري الحفظ…" : "حفظ إعدادات الفيديو"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving === "site_config"}
                  onClick={() => void saveSiteConfig({ homeFeatureVideo: CMS_DEFAULT_HOME_FEATURE_VIDEO })}
                >
                  إخفاء ومسح الفيديو
                </Button>
              </div>
            </form>
          </section>
          <HomeProductSectionsForm
            key={JSON.stringify({
              m: site?.homeProductSectionsMode,
              s: site?.homeProductSections,
              b: sectionBanners.items,
            })}
            initialMode={site?.homeProductSectionsMode}
            initialSections={site?.homeProductSections}
            initialSectionBanners={sectionBanners}
            disabled={saving === "site_config"}
            sectionBannersDisabled={saving === "section_banners"}
            onSave={(patch) => void saveSiteConfig(patch)}
            onSaveSectionBanners={(doc) => void saveSectionBanners(doc)}
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
          <SpotlightsForm
            key={JSON.stringify(spotlightsDocForForm)}
            initial={spotlightsDocForForm}
            disabled={saving === "spotlights"}
            onSave={(doc) => void saveSpotlights(doc)}
          />
        </section>
      ) : null}

      {tab === "branches" ? (
        <section className="space-y-6">
          <BranchesForm
            key={JSON.stringify(branches)}
            initial={branches}
            disabled={saving === "branches"}
            onSave={(doc) => void saveBranches(doc)}
          />
          <RetailersForm
            key={JSON.stringify(retailersDoc)}
            initial={retailersDoc}
            disabled={saving === "retailers"}
            onSave={(doc) => void saveRetailers(doc)}
          />
        </section>
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

            {tab === "health" ? (
              <ControlIntegrationsHubTab
                initialIntegrations={site?.storefrontIntegrations}
                disabled={saving === "site_config"}
                onSaveIntegrations={(patch) => void saveSiteConfig(patch)}
              />
            ) : null}
        </div>
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
                <ControlFieldHelp>اسم الفرع بالشكل اللي عايز العميل يشوفه.</ControlFieldHelp>
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
                <ControlFieldHelp>اكتب العنوان بالتفصيل عشان الوصول يكون أسهل.</ControlFieldHelp>
                <input
                  placeholder="رابط خرائط Google (https://...)"
                  value={row.googleMapsUrl}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSales((x) => x.map((r, j) => (j === i ? { ...r, googleMapsUrl: v } : r)));
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <ControlFieldHelp>الصق رابط خرائط Google لو عايز الزبون يفتح الاتجاهات بضغطة.</ControlFieldHelp>
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
                <ControlFieldHelp>اسم مركز الصيانة أو اسم نقطة الخدمة.</ControlFieldHelp>
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
                <ControlFieldHelp>اكتب العنوان بشكل واضح وسهل على العميل.</ControlFieldHelp>
                <input
                  placeholder="واتساب (مثال 01xxxxxxxxx)"
                  value={row.whatsapp}
                  onChange={(e) => {
                    const v = e.target.value;
                    setService((x) => x.map((r, j) => (j === i ? { ...r, whatsapp: v } : r)));
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <ControlFieldHelp>رقم واتساب اللي العميل يقدر يتواصل عليه مباشرة.</ControlFieldHelp>
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
      <ControlFieldHelp>عنوان قصير يظهر للمستخدم أول ما التنبيه يوصله.</ControlFieldHelp>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border px-3 py-2"
        placeholder="نص الإشعار"
      />
      <ControlFieldHelp>اكتب الرسالة نفسها بشكل واضح ومختصر.</ControlFieldHelp>
      <Button type="button" disabled={pending || !body.trim()} onClick={() => void send()}>
        {pending ? "جاري الإرسال…" : "إرسال"}
      </Button>
    </section>
  );
}
