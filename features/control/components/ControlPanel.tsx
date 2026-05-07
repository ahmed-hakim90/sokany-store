"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ControlPanelTabId } from "@/features/control/lib/control-tabs";
import { CONTROL_TAB_GROUPS, isControlPanelTabId } from "@/features/control/lib/control-tabs";
import { ControlAccessTab } from "@/features/control/components/ControlAccessTab";
import { ControlHealthTab } from "@/features/control/components/ControlHealthTab";
import { ControlWooApiTab } from "@/features/control/components/ControlWooApiTab";
import { OrderForwardingSettingsTab } from "@/features/control/components/OrderForwardingSettingsTab";
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
  DatabaseZap,
  Eye,
  Home,
  Globe,
  FolderKanban,
  ImageUp,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  MonitorPlay,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
  Waypoints,
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
} from "@/schemas/cms";
import {
  CMS_DEFAULT_HOME_FEATURE_VIDEO,
  CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR,
  CMS_DEFAULT_HEADER_CATEGORY_STRIP,
  CMS_DEFAULT_HOME_CATEGORY_SCROLLER,
  cmsHomeFeatureVideoSchema,
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
  { id: "general", label: "عام" },
  { id: "branding", label: "هوية الموقع" },
  { id: "hero", label: "الهيرو" },
  { id: "home", label: "الصفحة الرئيسية" },
  { id: "branches", label: "الفروع" },
  { id: "banners", label: "بانرات الأقسام" },
  { id: "retailers", label: "الموزعون" },
  { id: "spotlights", label: "إعلانات مميزة" },
  { id: "media", label: "الوسائط" },
  { id: "preview", label: "معاينة الموقع" },
  { id: "notifications", label: "إشعارات" },
  { id: "orderForwarding", label: "تكامل الطلبات" },
  { id: "health", label: "صحة الموقع" },
  { id: "wooApi", label: "ربط Woo" },
  { id: "access", label: "الصلاحيات" },
];

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
    title: "الإعدادات العامة للمتجر",
    description:
      "من هنا نتحكم في الرسائل السريعة، الروابط الأساسية، وما يظهر للعميل بشكل متكرر في أكثر من صفحة.",
    bullets: ["عدّل البيانات المشتركة مرة واحدة", "أي حفظ ينعكس على الواجهة بسرعة", "مناسب للرسائل والعناوين اليومية"],
    badge: "أساسيات المتجر",
    icon: LayoutDashboard,
  },
  branding: {
    eyebrow: "هوية بصرية",
    title: "اسم المتجر وصورته وبياناته التعريفية",
    description:
      "هذا القسم مسؤول عن الاسم العربي واللاتيني، الأيقونات، صور المشاركة، وأساس الهوية التي يراها العميل ومحركات البحث.",
    bullets: ["يوحّد الاسم والشعار", "يضبط صور الأيقونات وOG", "يحافظ على ثبات شكل العلامة"],
    badge: "الهوية",
    icon: Palette,
  },
  hero: {
    eyebrow: "الواجهة الأولى",
    title: "سلايدر الهيرو والعناصر البارزة",
    description:
      "هنا نعدّل أول مساحة يراها الزائر عند فتح الموقع: الصور الرئيسية، العناوين، والأزرار التي تدفعه للتصفح أو الشراء.",
    bullets: ["أول انطباع بصري", "مفيد للعروض والمواسم", "غيّره عند إطلاق حملة جديدة"],
    badge: "الصفحة الرئيسية",
    icon: Sparkles,
  },
  home: {
    eyebrow: "كتالوج الهوم",
    title: "أقسام المنتجات والشرائح تحت الهيرو",
    description:
      "اضبط أقسام المنتجات المعروضة في أسفل الصفحة الرئيسية: وضع تلقائي أو مخصص أو الاثنين، مع بانر وتصنيف وعدد واتجاه لكل قسم. شرائح التصنيفات تحت الهيرو تُدار من هنا أيضاً.",
    bullets: ["تحكم كامل بأقسام المنتجات", "ربط أي تصنيف بالقسم", "بانر مخصص لكل قسم"],
    badge: "الهوم",
    icon: Home,
  },
  branches: {
    eyebrow: "ما بعد البيع",
    title: "بيانات الفروع ومراكز الخدمة",
    description:
      "يجمع هذا القسم عناوين الفروع وأرقام التواصل والخريطة وروابط الخدمة حتى يجد العميل أقرب نقطة دعم بسهولة.",
    bullets: ["يرفع الثقة", "يسهّل الوصول للفروع", "يحسّن تجربة ما بعد البيع"],
    badge: "الفروع",
    icon: MapPinned,
  },
  banners: {
    eyebrow: "ترويج الأقسام",
    title: "بانرات الأقسام والروابط السريعة",
    description:
      "الجزء ده لعرض صور دعائية صغيرة داخل المتجر تربط العميل مباشرة بأقسام أو حملات معينة.",
    bullets: ["يوجّه العميل بسرعة", "ممتاز للعروض القصيرة", "يحافظ على حركة واضحة داخل الكتالوج"],
    badge: "الكتالوج",
    icon: ImageUp,
  },
  retailers: {
    eyebrow: "انتشار العلامة",
    title: "الموزعون ونقاط البيع",
    description:
      "نستخدمه لعرض أماكن الشراء المعتمدة أو شركاء البيع، مع بيانات تساعد العميل يعرف أين يجد المنتجات خارج الموقع.",
    bullets: ["يبني الثقة", "يعرّف العميل بالموزعين", "يناسب التوسع الجغرافي"],
    badge: "الموزعون",
    icon: Store,
  },
  spotlights: {
    eyebrow: "رسائل مركزة",
    title: "إعلانات مميزة ومحتوى لافت",
    description:
      "هذا القسم مخصص للرسائل القصيرة أو الكروت المميزة التي نريد إبرازها في نقاط معينة داخل الواجهة.",
    bullets: ["يسلّط الضوء على نقطة محددة", "مفيد للعروض أو المزايا", "يعطي واجهة المتجر نبضًا تسويقيًا"],
    badge: "إبراز المحتوى",
    icon: Megaphone,
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
    eyebrow: "مراجعة قبل النشر",
    title: "معاينة شكل المتجر بعد التعديلات",
    description:
      "هذا التبويب يتيح التأكد من أن التغيير ظاهر بشكل جيد قبل الانتقال لباقي المهام، خاصة على واجهة العميل الحقيقية.",
    bullets: ["يشبه النتيجة النهائية", "يسهّل اكتشاف الأخطاء البصرية", "أفضل خطوة قبل إنهاء التحديث"],
    badge: "معاينة",
    icon: Eye,
  },
  notifications: {
    eyebrow: "التفاعل",
    title: "إشعارات الويب والتنبيهات",
    description:
      "القسم الخاص بإرسال أو ضبط إشعارات تصل للمستخدمين المشتركين، حتى نعلن عن عرض أو تحديث مهم بسرعة.",
    bullets: ["مفيد للعروض العاجلة", "يزيد عودة الزوار", "يخدم الحملات القصيرة"],
    badge: "إشعارات",
    icon: BellRing,
  },
  orderForwarding: {
    eyebrow: "تكاملات",
    title: "إرسال بيانات الطلبات إلى نظام خارجي",
    description:
      "هنا نربط الطلبات الصادرة من المتجر بسيرفر أو API خارجي حتى تتكامل مع أنظمة تشغيل أو تقارير أخرى.",
    bullets: ["مهم للتشغيل", "لا يغيّر تجربة العميل مباشرة", "يفيد الربط مع الأنظمة الداخلية"],
    badge: "ربط الطلبات",
    icon: Waypoints,
  },
  health: {
    eyebrow: "متابعة وتشخيص",
    title: "حالة الموقع والربط",
    description:
      "من هنا نعرف هل الموقع يستقبل التحديثات بشكل سليم، وهل الواجهة تتحدث، وهل هناك شيء يحتاج تدخل سريع.",
    bullets: [
      "الأعلى للحكم السريع",
      "الوسط للإجراءات المهمة",
      "الأسفل لآخر ما وصل",
    ],
    badge: "صحة الموقع",
    icon: Activity,
  },
  wooApi: {
    eyebrow: "متابعة الربط",
    title: "ربط المنتجات والتحديثات",
    description:
      "راجع من هنا هل قراءة المنتجات والتصنيفات تعمل بشكل سليم، وخذ الروابط التي تحتاجها لأي ربط خارجي أو تحديث تلقائي.",
    bullets: [
      "اعرف هل الربط سليم",
      "انسخ الرابط الصحيح",
      "راجع التفاصيل عند الحاجة فقط",
    ],
    badge: "الربط",
    icon: DatabaseZap,
  },
  access: {
    eyebrow: "إدارة الفريق",
    title: "صلاحيات الدخول إلى لوحة التحكم",
    description:
      "هذا الجزء يحدد من يدخل اللوحة وماذا يمكنه أن يرى أو يعدّل، حتى تبقى إدارة المحتوى آمنة ومنظمة.",
    bullets: ["يحمي البيانات الحساسة", "يحدد صلاحيات كل شخص", "يسهّل فصل الأدوار داخل الفريق"],
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
      <h2 className="font-display text-lg font-bold">اقتراحات البحث السريعة</h2>
      <p className="text-sm text-muted-foreground">
        الكلمات دي تظهر للمستخدم أول ما يفتح البحث، قبل ما يبدأ يكتب.
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
        "ابدأ من «عام» لو تريد تعديل رسالة أو رابط مشترك، ومن «الهيرو» لو لديك حملة أو عرض جديد على الصفحة الرئيسية.",
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
        "بعد أي تعديل بصري، افتح «معاينة الموقع» أو صفحات التشخيص للتأكد أن البيانات ظهرت بالشكل الصحيح وبسرعة تحميل مناسبة.",
    },
  ];
  const generalActionTiles = [
    {
      title: "تعديل أول واجهة تظهر للعميل",
      description: "ادخل على الهيرو لو عندك بانر جديد أو عرض عايز يبان أول ما الموقع يفتح.",
      href: "/control?tab=hero",
      cta: "فتح الهيرو",
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
        <nav className="mt-0 hidden min-w-0 flex-col gap-4 md:flex" role="tablist" aria-label="أقسام لوحة التحكم">
          {groupedNavTabs.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
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
                        <span className="text-[11px] text-slate-400">{BASE_TAB_LIST.find((item) => item.id === id)?.label}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {info.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

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
                  حالة الموقع
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
                tone={tab === "access" ? "slate" : tab === "orderForwarding" ? "amber" : "brand"}
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

      {tab === "home" ? (
        <section className="space-y-6">
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
          <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg font-bold">صورة بطاقة الترويج (قبل قسم الأكثر مبيعاً)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                البانر العريض اللي يظهر قبل قسم «الأكثر مبيعاً». لو فاضي يستخدم الصورة الافتراضية أو من «إعلانات مميزة».
              </p>
            </div>
            <form
              key={`${site?.homeBottomPromoImageUrl ?? ""}-${site?.homeBottomPromoVisible === false ? "0" : "1"}`}
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const imageUrl = String(fd.get("homeBottomPromoImageUrl") ?? "").trim();
                const homeBottomPromoVisible = fd.get("homeBottomPromoVisible") === "on";
                /* نبعت string دايماً (حتى لو فاضي) عشان merge function تتعرّف على نية المسح. */
                void saveSiteConfig({
                  homeBottomPromoImageUrl: imageUrl,
                  homeBottomPromoVisible,
                });
              }}
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="homeBottomPromoVisible"
                  defaultChecked={site?.homeBottomPromoVisible !== false}
                />
                <span className="text-sm font-medium">إظهار البانر الترويجي على الصفحة الرئيسية</span>
              </label>
              <p className="text-xs text-muted-foreground">
                لما تلغي التفعيل، البانر يختفي في كل المواضع (حسب «إعلان مميز») حتى لو فيه صورة أو إعلان نشط.
              </p>
              <ControlImageUrlField
                name="homeBottomPromoImageUrl"
                label="صورة البانر"
                helper="ينصح بمقاس 1100×400 بكسل (نسبة عرض/ارتفاع تقريباً 11:4). صيغ مدعومة: JPG / PNG / WebP."
                defaultValue={site?.homeBottomPromoImageUrl ?? ""}
                placeholder="/images/hero-banner.jpg"
                disabled={saving === "site_config"}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving === "site_config"}>
                  {saving === "site_config" ? "جاري الحفظ…" : "حفظ صورة البانر"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving === "site_config"}
                  onClick={() => void saveSiteConfig({ homeBottomPromoImageUrl: "" })}
                >
                  استعادة الافتراضي
                </Button>
              </div>
            </form>
          </section>
          <HomeProductSectionsForm
            key={JSON.stringify({
              m: site?.homeProductSectionsMode,
              s: site?.homeProductSections,
            })}
            initialMode={site?.homeProductSectionsMode}
            initialSections={site?.homeProductSections}
            disabled={saving === "site_config"}
            onSave={(patch) => void saveSiteConfig(patch)}
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
        </section>
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

            {tab === "orderForwarding" ? <OrderForwardingSettingsTab /> : null}

            {tab === "health" ? <ControlHealthTab /> : null}

            {tab === "wooApi" ? <ControlWooApiTab /> : null}
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
