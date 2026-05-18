"use client";

/*
 * لوحة موبايل: سكة أفقية قابلة للسحب أسفل البحث.
 *
 * المحتوى: بطاقات اختصارات (عروض، الأكثر مبيعاً…) + زر «المزيد» يفتح درج القائمة.
 * إشارة التمرير: عرض ~٢٫٣ بطاقة كاملة + قصّ الحافة + تدرّجات عند وجود محتوى مخفي (RTL).
 * البطاقة: أيقونة + نص في صف واحد بخط صغير لتقليل الارتفاع.
 * نقاط الانكسار: الهيدر لاصق بـ lg؛ يُحمّل فقط ضمن عمود Navbar (`lg:hidden`).
 */
import { Link } from "next-view-transitions";
import { useLinkStatus } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BadgePercent,
  Flame,
  Headphones,
  Info,
  LayoutGrid,
  Menu,
  Sparkles,
} from "lucide-react";
import {
  mobileNavDrawerReturnFocusRef,
  useMobileNavDrawerOpenStore,
} from "@/components/layout/mobile-nav-drawer-open-store";
import {
  PRODUCTS_ALL_CATALOG_HREF,
  PRODUCTS_NEW_ARRIVALS_HREF,
  ROUTES,
} from "@/lib/constants";
import { bottomNavItemPressableClass } from "@/lib/nav-link-interaction";
import { cn } from "@/lib/utils";

/** ~٢٫٣ بطاقة مرئية على عرض الموبايل — يبقى طرف البطاقة التالية ظاهراً كإشارة سحب. */
const QUICK_CHIP_WIDTH_CLASS =
  "w-[clamp(5.75rem,calc((100vw-4.5rem)/2.35),6.875rem)]";

const SCROLL_EDGE_FADE_CLASS =
  "from-[color-mix(in_srgb,var(--sokany-accent)_14%,white_94%)]";

function useHorizontalScrollOverflowEdges() {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const measure = () => {
      const { left: rootLeft, right: rootRight } = root.getBoundingClientRect();
      let start = false;
      let end = false;
      for (const child of root.children) {
        if (!(child instanceof HTMLElement)) continue;
        const { left, right } = child.getBoundingClientRect();
        if (left < rootLeft - 2) start = true;
        if (right > rootRight + 2) end = true;
      }
      setEdges({ start, end });
    };

    measure();
    root.addEventListener("scroll", measure, { passive: true });
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);
    return () => {
      root.removeEventListener("scroll", measure);
      resizeObserver.disconnect();
    };
  }, []);

  return { scrollRef, ...edges };
}

type QuickChip = {
  key: string;
  href: string;
  label: string;
  Icon: typeof BadgePercent;
  isActive: (ctx: {
    pathname: string;
    orderby: string | null;
    order: string | null;
  }) => boolean;
};

const CHIP_DEFS: QuickChip[] = [
  {
    key: "offers",
    href: ROUTES.OFFERS,
    label: "العروض",
    Icon: BadgePercent,
    isActive: ({ pathname }) =>
      pathname === ROUTES.OFFERS || pathname.startsWith(`${ROUTES.OFFERS}/`),
  },
  {
    key: "bestsellers",
    href: PRODUCTS_ALL_CATALOG_HREF,
    label: "الأكثر مبيعاً",
    Icon: Flame,
    isActive: ({ pathname, orderby }) =>
      pathname === ROUTES.PRODUCTS && (orderby ?? "popularity") === "popularity",
  },
  {
    key: "new",
    href: PRODUCTS_NEW_ARRIVALS_HREF,
    label: "وصل حديثاً",
    Icon: Sparkles,
    isActive: ({ pathname, orderby }) =>
      pathname === ROUTES.PRODUCTS && orderby === "date",
  },
  {
    key: "categories",
    href: ROUTES.CATEGORIES,
    label: "التصنيفات",
    Icon: LayoutGrid,
    isActive: ({ pathname }) =>
      pathname === ROUTES.CATEGORIES || pathname.startsWith("/categories/"),
  },
  {
    key: "about",
    href: ROUTES.ABOUT,
    label: "عن سوكاني",
    Icon: Info,
    isActive: ({ pathname }) =>
      pathname === ROUTES.ABOUT || pathname.startsWith(`${ROUTES.ABOUT}/`),
  },
  {
    key: "support",
    href: ROUTES.SERVICE_CENTERS,
    label: "الصيانة",
    Icon: Headphones,
    isActive: ({ pathname }) =>
      pathname === ROUTES.SERVICE_CENTERS ||
      pathname.startsWith(`${ROUTES.SERVICE_CENTERS}/`),
  },
];

function QuickChipLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof BadgePercent;
  active: boolean;
}) {
  const { pending } = useLinkStatus();
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        bottomNavItemPressableClass,
        "snap-start shrink-0",
        "flex min-h-[2.375rem] max-w-none flex-row items-center justify-center gap-1 rounded-xl border px-2 py-2",
        QUICK_CHIP_WIDTH_CLASS,
        "text-[10px] font-bold leading-snug tracking-[-0.01em]",
        active
          ? "border-brand-500/55 bg-brand-400/95 text-brand-950 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] ring-2 ring-brand-500/55"
          : "border-black/[0.06] bg-white/90 text-brand-950 shadow-[0_6px_18px_-12px_rgba(15,23,42,0.28)] backdrop-blur-sm",
        pending && "opacity-60",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 stroke-2 text-current" aria-hidden />
      <span className="min-w-0 truncate leading-snug">{label}</span>
    </Link>
  );
}

export function MobileHeaderQuickActions() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderby = searchParams.get("orderby");
  const order = searchParams.get("order");
  const ctx = {
    pathname: pathname ?? "",
    orderby,
    order,
  };
  const moreRef = useRef<HTMLButtonElement>(null);
  const drawerOpen = useMobileNavDrawerOpenStore((s) => s.open);
  const openDrawer = useMobileNavDrawerOpenStore((s) => s.openDrawer);
  const isCheckout = pathname === ROUTES.CHECKOUT;
  const { scrollRef, start: fadeStart, end: fadeEnd } =
    useHorizontalScrollOverflowEdges();
  const hasScrollOverflow = fadeStart || fadeEnd;

  if (isCheckout) return null;

  return (
    <div className="relative -mx-[3px] min-w-0 overflow-x-clip overflow-y-visible">
      {fadeStart ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-10",
            "bg-gradient-to-r to-transparent",
            SCROLL_EDGE_FADE_CLASS,
          )}
        />
      ) : null}
      {fadeEnd ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10",
            "bg-gradient-to-l to-transparent",
            SCROLL_EDGE_FADE_CLASS,
          )}
        />
      ) : null}
      <ul
        ref={scrollRef}
        className="-mx-[9px] flex min-h-px snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-2.5 pb-1 pt-1 scroll-ps-2.5 scroll-pe-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="اختصارات سريعة للتصفح"
      >
        {CHIP_DEFS.map((chip) => {
          const Icon = chip.Icon;
          const active = chip.isActive(ctx);
          return (
            <li key={chip.key} className="snap-start">
              <QuickChipLink
                href={chip.href}
                label={chip.label}
                Icon={Icon}
                active={active}
              />
            </li>
          );
        })}
        <li className="snap-start">
          <button
            ref={moreRef}
            type="button"
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
            aria-label="فتح قائمة أكثر من الخدمات"
            className={cn(
              bottomNavItemPressableClass,
              "flex min-h-[2.375rem] snap-start shrink-0 flex-row items-center justify-center gap-1 rounded-xl border border-dashed border-black/[0.1] px-2 py-2 text-[10px] font-bold leading-snug text-brand-900/85",
              QUICK_CHIP_WIDTH_CLASS,
              drawerOpen &&
                "border-brand-500/45 bg-brand-400/95 text-brand-950 ring-2 ring-brand-500/45",
              !drawerOpen && "bg-white/70 backdrop-blur-sm shadow-[0_6px_18px_-12px_rgba(15,23,42,0.22)]",
            )}
            onClick={() => {
              mobileNavDrawerReturnFocusRef.current = moreRef.current;
              openDrawer();
            }}
          >
            <Menu className="h-3.5 w-3.5 shrink-0 stroke-2" aria-hidden />
            <span className="min-w-0 truncate leading-snug">المزيد</span>
          </button>
        </li>
      </ul>
      {hasScrollOverflow ? (
        <span
          className="pointer-events-none mx-auto mt-0.5 block h-1 w-12 shrink-0 rounded-full bg-brand-500/75"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
