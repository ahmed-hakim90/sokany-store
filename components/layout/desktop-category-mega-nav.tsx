"use client";

/*
 * شريط تصنيفات الديسكتوب (صف ثانٍ تحت اللوجو/البحث) + ميجا مينو عند الـ hover.
 * — الصف: «الرئيسية» ثم أقسام الميجا ثم «العروض» ثم روابط ثابتة (كل التصنيفات، من نحن، الفروع، الموزعون، تتبع الطلب)؛ يمين: سوشيال + «تواصل معنا» + «خدماتنا» (شروط، خصوصية، …).
 * — الميجا: شبكة ثلاثية الأعمدة (فرعية · أولوية تسوق · صورة) أو لوحة عروض بديلة.
 * — الـ lg فقط؛ الموبايل يبقى على الدرج.
 */

import { AnimatePresence, motion } from "framer-motion";
import { Link } from "next-view-transitions";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import type { Category } from "@/features/categories/types";
import { SocialGlyph } from "@/components/layout/social-glyph";
import { ROUTES } from "@/lib/constants";
import { navLinkActiveSurfaceClass, navLinkPressableClass } from "@/lib/nav-link-interaction";
import type { SocialLink } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const MEGA_LINK_LIMIT = 12;

export type DesktopMoreLink = { href: string; label: string };

type MegaKey = "home-appliances" | "kitchen-supplies" | "personal-care" | "offers";

type PrimaryNavDef =
  | {
      key: "home";
      href: string;
      label: string;
      mega: null;
      offersHighlight?: false;
    }
  | {
      key: MegaKey;
      href: string;
      label: string;
      mega: "category" | "offers";
      offersHighlight?: boolean;
    };

const PRIMARY_NAV: PrimaryNavDef[] = [
  { key: "home", href: ROUTES.HOME, label: "الرئيسية", mega: null },
  {
    key: "home-appliances",
    href: ROUTES.CATEGORY("home-appliances"),
    label: "الأجهزة المنزلية",
    mega: "category",
  },
  {
    key: "kitchen-supplies",
    href: ROUTES.CATEGORY("kitchen-supplies"),
    label: "المطبخ",
    mega: "category",
  },
  {
    key: "personal-care",
    href: ROUTES.CATEGORY("personal-care"),
    label: "العناية الشخصية",
    mega: "category",
  },
  {
    key: "offers",
    href: ROUTES.PRODUCTS,
    label: "العروض",
    mega: "offers",
    offersHighlight: true,
  },
];

function groupByParent(categories: Category[]): Map<number, Category[]> {
  const m = new Map<number, Category[]>();
  for (const c of categories) {
    const bucket = m.get(c.parentId) ?? [];
    bucket.push(c);
    m.set(c.parentId, bucket);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }
  return m;
}

function findCategoryBySlug(
  categories: Category[] | undefined,
  slug: string,
): Category | undefined {
  return categories?.find((c) => c.slug === slug);
}

function productsFilteredUrl(
  opts: {
    categoryId?: number;
    featured?: boolean;
    orderby?: "popularity" | "date";
    order?: "asc" | "desc";
  },
): string {
  const p = new URLSearchParams();
  if (opts.categoryId != null) {
    p.set("category", String(opts.categoryId));
  }
  if (opts.featured) {
    p.set("featured", "true");
  }
  if (opts.orderby) {
    p.set("orderby", opts.orderby);
    p.set("order", opts.order ?? "desc");
  }
  const qs = p.toString();
  return qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS;
}

function pickSpotlightImage(
  parent: Category,
  children: Category[],
): { src: string; alt: string } | null {
  const withChildImage = children.find((c) => c.image);
  if (withChildImage?.image) {
    return { src: withChildImage.image, alt: withChildImage.name };
  }
  if (parent.image) {
    return { src: parent.image, alt: parent.name };
  }
  return null;
}

export type DesktopCategoryMegaNavProps = {
  categories: Category[] | undefined;
  categoriesLoading: boolean;
  /** روابط نصية في الصف مباشرة بعد «العروض». */
  primaryBarExtraLinks?: readonly DesktopMoreLink[];
  moreLinks: readonly DesktopMoreLink[];
  socialLinks: readonly SocialLink[];
};

const primaryBarExtraLinkClass = cn(
  "inline-flex items-center rounded-md px-2.5 py-2 text-brand-900/85 transition-colors [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
  navLinkPressableClass,
  navLinkActiveSurfaceClass,
);

export function DesktopCategoryMegaNav({
  categories,
  categoriesLoading,
  primaryBarExtraLinks = [],
  moreLinks,
  socialLinks,
}: DesktopCategoryMegaNavProps) {
  const baseId = useId();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const byParent = useMemo(
    () => (categories?.length ? groupByParent(categories) : new Map()),
    [categories],
  );

  const closeMega = useCallback(() => setOpenKey(null), []);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        closeMega();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeMega]);

  const renderCategoryMega = (slug: MegaKey) => {
    const parent = findCategoryBySlug(categories, slug);
    const children = parent
      ? (byParent.get(parent.id) ?? []).filter((c: Category) => c.count > 0)
      : [];
    const slice = children.slice(0, MEGA_LINK_LIMIT);
    const spotlight = parent
      ? pickSpotlightImage(parent, children)
      : null;

    return (
      <div className="grid gap-6 border-t border-border/60 bg-white py-6 shadow-lg md:grid-cols-12 px-4 md:gap-8">
        <div className="md:col-span-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            تصنيفات فرعية
          </p>
          {categoriesLoading ? (
            <ul className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="h-4 animate-pulse rounded bg-muted/60"
                  aria-hidden
                />
              ))}
            </ul>
          ) : slice.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {slice.map((c: Category) => (
                <li key={c.id}>
                  <Link
                    href={ROUTES.CATEGORY(c.slug)}
                    className="block rounded-md px-1 py-1 text-foreground transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : parent ? (
            <p className="text-sm text-muted-foreground">
              تصفّح قسم{" "}
              <Link
                href={ROUTES.CATEGORY(parent.slug)}
                className="font-medium text-brand-700 underline-offset-2 hover:underline"
              >
                {parent.name}
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد تصنيفات بعد.</p>
          )}
        </div>

        <div className="md:col-span-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            تسوق حسب الأولوية
          </p>
          {parent ? (
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href={productsFilteredUrl({
                    categoryId: parent.id,
                    orderby: "popularity",
                    order: "desc",
                  })}
                  className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
                >
                  الأكثر مبيعاً في القسم
                </Link>
              </li>
              <li>
                <Link
                  href={productsFilteredUrl({
                    categoryId: parent.id,
                    orderby: "date",
                    order: "desc",
                  })}
                  className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
                >
                  أحدث الإضافات
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CATEGORY(parent.slug)}
                  className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
                >
                  عرض كل منتجات القسم
                </Link>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>

        <div className="md:col-span-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            من المعرض
          </p>
          {spotlight ? (
            <Link
              href={parent ? ROUTES.CATEGORY(parent.slug) : ROUTES.HOME}
              className="group block overflow-hidden rounded-xl border border-border/70 bg-surface-muted/30"
            >
              <div className="relative aspect-[4/3] w-full">
                <AppImage
                  src={spotlight.src}
                  alt={spotlight.alt}
                  fill
                  sizes="(min-width: 768px) 320px, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              {parent ? (
                <p className="px-3 py-2 text-center text-xs font-medium text-brand-950">
                  {parent.name}
                </p>
              ) : null}
            </Link>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground">
              صورة القسم تظهر عند توفرها
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOffersMega = () => (
    <div className="grid gap-6 border-t border-border/60 bg-white py-6 shadow-lg md:grid-cols-12 md:gap-8">
      <div className="md:col-span-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          عروض وأسعار
        </p>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              href={productsFilteredUrl({ featured: true })}
              className="block rounded-md px-1 py-1 font-medium text-red-700 transition-colors hover:bg-red-50 hover:text-red-800"
            >
              منتجات مميزة
            </Link>
          </li>
          <li>
            <Link
              href={productsFilteredUrl({
                orderby: "popularity",
                order: "desc",
              })}
              className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
            >
              الأكثر مبيعاً على الموقع
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.PRODUCTS}
              className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
            >
              كل المنتجات
            </Link>
          </li>
        </ul>
      </div>
      <div className="md:col-span-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          اكتشف
        </p>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              href={ROUTES.CATEGORIES}
              className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
            >
              كل التصنيفات
            </Link>
          </li>
          <li>
            <Link
              href={productsFilteredUrl({
                orderby: "date",
                order: "desc",
              })}
              className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
            >
              وصل حديثاً
            </Link>
          </li>
        </ul>
      </div>
      <div className="md:col-span-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          تلميح
        </p>
        <p className="rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-sm leading-relaxed text-brand-950">
          قارن الأسعار واطلب بضمان أصلي — الشحن لجميع المحافظات.
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="relative"
      onMouseLeave={() => {
        setOpenKey(null);
      }}
    >
      <div className="mx-auto flex max-w-none items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <nav
          className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 py-1.5 text-sm font-medium"
          aria-label="التصنيفات الرئيسية"
        >
          {PRIMARY_NAV.map((item) => {
            const isMega =
              item.mega === "category" || item.mega === "offers";
            const isOpen = openKey === item.key;
            const itemId = `${baseId}-${item.key}`;

            const navItem = (
              <div
                className="relative"
                onMouseEnter={() => {
                  if (isMega) setOpenKey(item.key);
                  else setOpenKey(null);
                }}
                onFocus={() => {
                  if (isMega) setOpenKey(item.key);
                  else setOpenKey(null);
                }}
              >
                <Link
                  id={itemId}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-2 transition-colors",
                    navLinkPressableClass,
                    item.offersHighlight
                      ? "font-semibold text-red-600 [@media(hover:hover)]:hover:bg-red-50 [@media(hover:hover)]:hover:text-red-700 active:bg-red-100/80"
                      : "text-brand-900/85 [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
                    isOpen && !item.offersHighlight && "bg-surface-muted/45 text-brand-950",
                    isOpen && item.offersHighlight && "bg-red-50 text-red-700",
                    !item.offersHighlight && navLinkActiveSurfaceClass,
                  )}
                  aria-expanded={isMega ? isOpen : undefined}
                  aria-haspopup={isMega ? "true" : undefined}
                  aria-controls={isMega && isOpen ? `${baseId}-mega-panel` : undefined}
                >
                  {item.label}
                </Link>
              </div>
            );

            return (
              <Fragment key={item.key}>
                {navItem}
                {item.key === "offers"
                  ? primaryBarExtraLinks.map((l) => (
                      <div key={l.href} className="relative">
                        <Link href={l.href} className={primaryBarExtraLinkClass}>
                          {l.label}
                        </Link>
                      </div>
                    ))
                  : null}
              </Fragment>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div
            className="flex items-center gap-0.5"
            aria-label="وسائل التواصل الاجتماعي"
          >
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-white text-brand-800 shadow-sm transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
                aria-label={s.label}
              >
                <SocialGlyph socialKey={s.key} className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
          <Link
            href={ROUTES.CONTACT}
            className={cn(
              "whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
              navLinkPressableClass,
              navLinkActiveSurfaceClass,
            )}
          >
            تواصل معنا
          </Link>
          <div
            ref={moreRef}
            className="relative py-1.5"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              type="button"
              className={cn(
                "inline-flex touch-manipulation items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-[transform,colors,opacity] duration-100 active:scale-95 active:opacity-90 [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
                moreOpen && "bg-surface-muted/45 text-brand-950",
              )}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((v) => !v)}
            >
              خدماتنا
              <ChevronDownGlyph className="h-4 w-4 opacity-70" />
            </button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute end-0 top-full z-[60] mt-1 min-w-[12rem] rounded-xl border border-border/80 bg-white py-1.5 shadow-lg"
              >
                {moreLinks.map((l) => (
                  <Link
                    key={l.href}
                    role="menuitem"
                    href={l.href}
                    className={cn(
                      "block px-4 py-2 text-sm text-foreground [@media(hover:hover)]:hover:bg-surface-muted/60",
                      navLinkPressableClass,
                      navLinkActiveSurfaceClass,
                    )}
                    onClick={() => setMoreOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openKey && openKey !== "home" ? (
          <motion.div
            id={`${baseId}-mega-panel`}
            key={openKey}
            role="region"
            aria-label="قائمة موسعة"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full z-50"
          >
            <Container>
              {openKey === "offers"
                ? renderOffersMega()
                : renderCategoryMega(openKey as MegaKey)}
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ChevronDownGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
