"use client";

/**
 * تنقل الديسكتوب + ميجا منيو
 * بالعامية: الصف التاني في الهيدر بيعرض الأقسام الأب مباشرة؛ الهوفر يفتح تفاصيل كل قسم، والموبايل لسه على الدرج.
 *
 * التفاصيل البصرية تحت في تعليق التخطيط.
 */
/*
 * شريط تنقل الديسكتوب (صف ثانٍ تحت اللوجو/البحث) + ميجا مينو للأقسام والعروض.
 * — الصف: «الرئيسية» + «العروض» + الأقسام الأب من WooCommerce + روابط إضافية + زر «المزيد» في سطر واحد بلا التفاف.
 * — هوفر على أي قسم أب يفتح تفاصيله: تصنيفات فرعية + روابط أولوية + صورة القسم/أول تصنيف فرعي متاحة.
 * — «المزيد»: روابط المتجر الثانوية + المساعدة والسياسات + السوشيال.
 * — الـ lg فقط؛ الموبايل يبقى على الدرج.
 */

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
import type { Category } from "@/features/categories/types";
import { SocialGlyph } from "@/components/layout/social-glyph";
import { ROUTES } from "@/lib/constants";
import { navLinkActiveSurfaceClass, navLinkPressableClass } from "@/lib/nav-link-interaction";
import type { SocialLink } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const MEGA_LINK_LIMIT = 12;
const MEGA_TOP_LEVEL_CATEGORY_LIMIT = 12;

export type DesktopMoreLink = { href: string; label: string };

type PrimaryBarItem =
  | { key: "home"; href: string; label: string; mega: null }
  | { key: string; href: string; label: string; mega: "category" }
  | {
      key: "offers";
      href: string;
      label: string;
      mega: "offers";
      offersHighlight: true;
    };

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
  /** روابط متجر ثانوية داخل قائمة «المزيد». */
  secondaryLinks?: readonly DesktopMoreLink[];
  moreLinks: readonly DesktopMoreLink[];
  socialLinks: readonly SocialLink[];
};

const primaryBarExtraLinkClass = cn(
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2.5 py-2 text-brand-900/85 transition-colors [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
  navLinkPressableClass,
  navLinkActiveSurfaceClass,
);

export function DesktopCategoryMegaNav({
  categories,
  categoriesLoading,
  primaryBarExtraLinks = [],
  secondaryLinks = [],
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

  const primaryBarItems: PrimaryBarItem[] = useMemo(() => {
    const home: PrimaryBarItem = {
      key: "home",
      href: ROUTES.HOME,
      label: "الرئيسية",
      mega: null,
    };
    const topLevel = (categories ?? [])
      .filter(
        (c) =>
          c.parentId === 0 &&
          c.count > 0 &&
          c.slug !== "offers" &&
          c.slug !== "home",
      )
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
      .slice(0, MEGA_TOP_LEVEL_CATEGORY_LIMIT);
    const categoryItems: PrimaryBarItem[] = topLevel.map((c) => ({
      key: c.slug,
      href: ROUTES.CATEGORY(c.slug),
      label: c.name,
      mega: "category" as const,
    }));
    const offers: PrimaryBarItem = {
      key: "offers",
      href: ROUTES.OFFERS,
      label: "العروض",
      mega: "offers",
      offersHighlight: true,
    };
    return [home, ...categoryItems, offers];
  }, [categories]);

  const dropdownCategoryLinks = useMemo(
    () =>
      (categories ?? [])
        .filter(
          (c) =>
            c.parentId === 0 &&
            c.count > 0 &&
            c.slug !== "offers" &&
            c.slug !== "home",
        )
        .sort((a, b) => a.name.localeCompare(b.name, "ar"))
        .map((c) => ({
          href: ROUTES.CATEGORY(c.slug),
          label: c.name,
        })),
    [categories],
  );

  const closeMega = useCallback(() => setOpenKey(null), []);

  const focusFirstLinkInMegaPanel = useCallback(() => {
    window.setTimeout(() => {
      const panel = document.getElementById(`${baseId}-mega-panel`);
      const first = panel?.querySelector<HTMLElement>("a[href]");
      first?.focus();
    }, 0);
  }, [baseId]);

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

  const renderCategoryMega = (slug: string) => {
    const parent = findCategoryBySlug(categories, slug);
    const children = parent
      ? (byParent.get(parent.id) ?? []).filter((c: Category) => c.count > 0)
      : [];
    const slice = children.slice(0, MEGA_LINK_LIMIT);
    const spotlight = parent
      ? pickSpotlightImage(parent, children)
      : null;

    return (
      <div className="grid gap-6 border-t border-border/60 bg-white px-4 py-6 shadow-lg sm:px-6 md:grid-cols-12 md:gap-8 lg:px-8">
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
              className="surface-panel group block overflow-hidden rounded-xl border border-border/70 bg-surface-muted/30 shadow-sm"
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
    <div className="grid gap-6 border-t border-border/60 bg-white px-4 py-6 shadow-lg sm:px-6 md:grid-cols-12 md:gap-8 lg:px-8">
      <div className="md:col-span-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          عروض وأسعار
        </p>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              href={ROUTES.OFFERS}
              className="block rounded-md px-1 py-1 font-medium text-destructive transition-colors hover:bg-destructive-surface hover:text-destructive-foreground"
            >
              كل المنتجات المخفضة
            </Link>
          </li>
          <li>
            <Link
              href={productsFilteredUrl({ featured: true })}
              className="block rounded-md px-1 py-1 transition-colors hover:bg-surface-muted/60 hover:text-brand-950"
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
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-0.5 overflow-hidden py-1.5 text-sm font-medium"
          aria-label="التصنيفات الرئيسية"
        >
          {primaryBarItems.map((item) => {
            const isMega =
              item.mega === "category" || item.mega === "offers";
            const isOpen = openKey === item.key;
            const itemId = `${baseId}-${item.key}`;
            const isOffers = item.mega === "offers";

            const navItem = (
              <div
                className="relative"
                onMouseEnter={() => {
                  setMoreOpen(false);
                  if (isMega) setOpenKey(item.key);
                  else setOpenKey(null);
                }}
                onFocus={() => {
                  setMoreOpen(false);
                  if (isMega) setOpenKey(item.key);
                  else setOpenKey(null);
                }}
              >
                <Link
                  id={itemId}
                  href={item.href}
                  onKeyDown={(e) => {
                    if (!isMega) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setMoreOpen(false);
                      setOpenKey(item.key);
                      focusFirstLinkInMegaPanel();
                    }
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2.5 py-2 transition-colors",
                    navLinkPressableClass,
                    isOffers
                      ? "font-semibold text-destructive [@media(hover:hover)]:hover:bg-destructive-surface [@media(hover:hover)]:hover:text-destructive-foreground active:bg-destructive-surface/80"
                      : "text-brand-900/85 [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
                    isOpen && !isOffers && "bg-surface-muted/45 text-brand-950",
                    isOpen && isOffers && "bg-destructive-surface text-destructive-foreground",
                    !isOffers && navLinkActiveSurfaceClass,
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
          <div ref={moreRef} className="relative py-1.5">
            <button
              type="button"
              className={cn(
                "inline-flex touch-manipulation items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-[transform,colors,opacity] duration-100 active:scale-95 active:opacity-90 [@media(hover:hover)]:hover:bg-surface-muted/50 [@media(hover:hover)]:hover:text-brand-950",
                moreOpen && "bg-surface-muted/45 text-brand-950",
              )}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-controls={moreOpen ? `${baseId}-services-menu` : undefined}
              id={`${baseId}-services-trigger`}
              onClick={() => {
                setOpenKey(null);
                setMoreOpen((v) => !v);
              }}
            >
              المزيد
              <ChevronDownGlyph className="h-4 w-4 opacity-70" />
            </button>
            {moreOpen ? (
              <div
                id={`${baseId}-services-menu`}
                role="menu"
                aria-labelledby={`${baseId}-services-trigger`}
                className="absolute end-0 top-full z-[60] mt-1 w-[min(42rem,calc(100vw-2rem))] max-h-[min(34rem,80vh)] overflow-y-auto rounded-2xl border border-border/80 bg-white p-3 shadow-lg"
              >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(13rem,0.9fr)]">
                  <section
                    role="group"
                    aria-labelledby={`${baseId}-more-categories-heading`}
                    className="rounded-xl bg-surface-muted/35 p-2.5"
                  >
                    <p
                      id={`${baseId}-more-categories-heading`}
                      className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      الأقسام
                    </p>
                    {categoriesLoading ? (
                      <div className="grid grid-cols-2 gap-1.5 px-1" aria-busy="true">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-9 animate-pulse rounded-lg bg-white/75"
                            aria-hidden
                          />
                        ))}
                      </div>
                    ) : dropdownCategoryLinks.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1">
                        {dropdownCategoryLinks.map((l) => (
                          <Link
                            key={l.href}
                            role="menuitem"
                            href={l.href}
                            className={cn(
                              "rounded-lg px-2.5 py-2 text-sm font-medium text-brand-950 [@media(hover:hover)]:hover:bg-white/85",
                              navLinkPressableClass,
                              navLinkActiveSurfaceClass,
                            )}
                            onClick={() => setMoreOpen(false)}
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="px-2 py-2 text-sm text-muted-foreground">
                        لا توجد تصنيفات متاحة.
                      </p>
                    )}
                  </section>

                  <div className="space-y-3">
                    {secondaryLinks.length > 0 ? (
                      <section
                        role="group"
                        aria-labelledby={`${baseId}-more-store-heading`}
                      >
                        <p
                          id={`${baseId}-more-store-heading`}
                          className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          روابط المتجر
                        </p>
                        <div className="rounded-xl border border-border/60 bg-white py-1">
                          {secondaryLinks.map((l) => (
                            <Link
                              key={l.href}
                              role="menuitem"
                              href={l.href}
                              className={cn(
                                "block px-3 py-2 text-sm font-medium text-foreground [@media(hover:hover)]:hover:bg-surface-muted/60",
                                navLinkPressableClass,
                                navLinkActiveSurfaceClass,
                              )}
                              onClick={() => setMoreOpen(false)}
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    <section
                      role="group"
                      aria-labelledby={`${baseId}-more-help-heading`}
                    >
                      <p
                        id={`${baseId}-more-help-heading`}
                        className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        المساعدة والسياسات
                      </p>
                      <div className="rounded-xl border border-border/60 bg-white py-1">
                        {moreLinks.map((l) => (
                          <Link
                            key={l.href}
                            role="menuitem"
                            href={l.href}
                            className={cn(
                              "block px-3 py-2 text-sm font-medium text-foreground [@media(hover:hover)]:hover:bg-surface-muted/60",
                              navLinkPressableClass,
                              navLinkActiveSurfaceClass,
                            )}
                            onClick={() => setMoreOpen(false)}
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    </section>

                    {socialLinks.length > 0 ? (
                      <section
                        role="group"
                        aria-labelledby={`${baseId}-more-social-heading`}
                      >
                        <p
                          id={`${baseId}-more-social-heading`}
                          className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          تابعنا
                        </p>
                        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-white p-2">
                          {socialLinks.map((s) => (
                            <a
                              key={s.key}
                              role="menuitem"
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-10 min-h-[40px] w-10 min-w-[40px] items-center justify-center rounded-full border border-border/70 bg-white shadow-sm transition-colors hover:bg-surface-muted/80"
                              aria-label={s.label}
                              onClick={() => setMoreOpen(false)}
                            >
                              <SocialGlyph socialKey={s.key} className="h-4 w-4" />
                            </a>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {openKey && openKey !== "home" ? (
        <div
          id={`${baseId}-mega-panel`}
          key={openKey}
          role="region"
          aria-label="قائمة موسعة"
          className="absolute inset-x-0 top-full z-50 animate-fade-in motion-reduce:animate-none"
        >
          {openKey === "offers"
            ? renderOffersMega()
            : renderCategoryMega(openKey ?? "")}
        </div>
      ) : null}
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
