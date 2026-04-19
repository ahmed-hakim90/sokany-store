"use client";

import { createPortal } from "react-dom";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FocusTrap } from "focus-trap-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { MobileAccordionSection } from "@/components/ui/mobile-accordion-section";
import { IconButton } from "@/components/ui/icon-button";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import type { Category } from "@/features/categories/types";
import { CONTACT_EMAIL, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NavDrawerLink = { href: string; label: string };

export type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Ref to the control that opened the drawer (menu button) for focus restore. */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  links: readonly NavDrawerLink[];
  categories: Category[] | undefined;
  categoriesLoading?: boolean;
};

function buildCategoryTree(categories: Category[]) {
  const childrenByParent = new Map<number, Category[]>();
  for (const c of categories) {
    if (c.parentId === 0) continue;
    const list = childrenByParent.get(c.parentId) ?? [];
    list.push(c);
    childrenByParent.set(c.parentId, list);
  }
  const roots = categories.filter((c) => c.parentId === 0);
  return roots.map((r) => ({
    ...r,
    children: childrenByParent.get(r.id) ?? [],
  }));
}

const navLinkClass =
  "flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-brand-950 hover:bg-surface-muted/80";
const navLinkActiveClass =
  "bg-brand-500/15 text-brand-900 ring-1 ring-brand-500/40";

export function MobileNavDrawer({
  open,
  onClose,
  returnFocusRef,
  links,
  categories,
  categoriesLoading,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLAnchorElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const tree = useMemo(
    () => (categories?.length ? buildCategoryTree(categories) : []),
    [categories],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const panelInitial = reduceMotion ? { x: 0 } : { x: "100%" };
  const panelAnimate = { x: 0 };
  const panelExit = reduceMotion ? { x: 0 } : { x: "100%" };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="mobile-nav-backdrop"
            className="fixed inset-0 z-[140] bg-slate-900/45 backdrop-blur-[10px] lg:hidden"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
          <FocusTrap
            key="mobile-nav-trap"
            active
            focusTrapOptions={{
              initialFocus: () => closeRef.current ?? searchRef.current ?? undefined,
              returnFocusOnDeactivate: true,
              setReturnFocus: () => returnFocusRef.current ?? false,
              escapeDeactivates: false,
              clickOutsideDeactivates: false,
            }}
          >
            <motion.div
              id="mobile-nav-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={cn(
                "fixed top-0 bottom-0 right-0 z-[141] flex h-dvh min-h-dvh w-[min(20rem,88vw)] max-w-[100vw] flex-col border-s border-border/80 bg-page shadow-2xl",
                "pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              )}
              initial={panelInitial}
              animate={panelAnimate}
              exit={panelExit}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.28 }
              }
            >
              <h2 id={titleId} className="sr-only">
                قائمة التنقل
              </h2>
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/80 px-2 pb-2 pt-0.5">
                <Link
                  href={ROUTES.ACCOUNT}
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-950 transition-colors hover:bg-surface-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                    (pathname === ROUTES.ACCOUNT ||
                      pathname.startsWith(`${ROUTES.ACCOUNT}/`)) &&
                      "bg-brand-500/15 ring-1 ring-brand-500/40",
                  )}
                  aria-label="حسابي"
                  onClick={onClose}
                >
                  <UserGlyph />
                </Link>
                <IconButton
                  ref={closeRef}
                  variant="ghost"
                  size="md"
                  aria-label="إغلاق القائمة"
                  onClick={onClose}
                  className="text-brand-950"
                >
                  <CloseGlyph />
                </IconButton>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2 sm:px-5">
                <div className="border-b border-border/80 pb-3">
                  <Link
                    ref={searchRef}
                    href={ROUTES.SEARCH}
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border/80 bg-white px-3 py-2 text-sm font-semibold text-brand-950 shadow-sm ring-brand-500/0 transition-shadow hover:bg-surface-muted/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-500/40"
                    onClick={onClose}
                  >
                    <SearchGlyph className="shrink-0 text-muted-foreground" />
                    بحث عن منتج
                  </Link>
                </div>

                <nav aria-label="الصفحات" className="divide-y divide-border/80 border-b border-border/80 py-1">
                  {links.map((l) => {
                    const active =
                      l.href === ROUTES.HOME
                        ? pathname === ROUTES.HOME
                        : pathname === l.href || pathname.startsWith(`${l.href}/`);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(navLinkClass, active && navLinkActiveClass)}
                        onClick={onClose}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-b border-border/80 py-2">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    التصنيفات
                  </p>
                  {categoriesLoading ? (
                    <div className="space-y-2 px-2 py-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-11 animate-pulse rounded-lg bg-surface-muted/70"
                        />
                      ))}
                    </div>
                  ) : tree.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-muted-foreground">
                      لا توجد تصنيفات
                    </p>
                  ) : (
                    <div className="space-y-0">
                      {tree.map((cat) => (
                        <CategoryDrawerRow
                          key={cat.id}
                          category={cat}
                          pathname={pathname}
                          onNavigate={onClose}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <nav
                  aria-label="خدمة العملاء"
                  className="divide-y divide-border/80 border-b border-border/80 py-1"
                >
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className={navLinkClass}
                    onClick={onClose}
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <p className="px-2 py-2 text-xs leading-relaxed text-muted-foreground">
                    القاهرة، مصر — دعم العملاء 10:00–18:00
                  </p>
                </nav>

                <div className="mt-3 rounded-xl border border-brand-500/35 bg-brand-500 px-3 py-3 sticky bottom-0">
                  <p className="text-sm font-bold text-brand-950">
                    خصم 10% على أول طلب
                  </p>
                  <p className="mt-1 text-xs text-brand-900/90">
                    استخدم الكود:{" "}
                    <span className="rounded bg-brand-500 px-1.5 py-0.5 font-mono text-xs font-bold text-black">
                      SOKANY10
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </FocusTrap>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function UserGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  );
}

type CategoryWithKids = Category & { children: Category[] };

function CategoryDrawerRow({
  category,
  pathname,
  onNavigate,
}: {
  category: CategoryWithKids;
  pathname: string;
  onNavigate: () => void;
}) {
  const href = ROUTES.CATEGORY(category.slug);
  const active =
    pathname === href || pathname.startsWith(`${href}/`);
  const hasKids = category.children.length > 0;

  if (!hasKids) {
    return (
      <Link
        href={href}
        className={cn(
          "flex min-h-11 items-center gap-2 border-b border-border/60 px-2 py-1.5 text-sm font-medium text-brand-950 hover:bg-surface-muted/80",
          active && navLinkActiveClass,
        )}
        onClick={onNavigate}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white text-brand-800">
          <CategoryIcon slug={category.slug} className="h-5 w-5" />
        </span>
        {category.name}
      </Link>
    );
  }

  return (
    <div className="border-b border-border/60 py-0.5">
      <MobileAccordionSection
        title={
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white text-brand-800">
              <CategoryIcon slug={category.slug} className="h-5 w-5" />
            </span>
            <span className="truncate">{category.name}</span>
          </span>
        }
        noBorder
        className="px-0"
      >
      <div className="space-y-1 ps-2">
        <Link
          href={href}
          className={cn(
            "flex min-h-10 items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-brand-800 hover:bg-surface-muted/70",
            active && "text-brand-600",
          )}
          onClick={onNavigate}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-white">
            <CategoryIcon slug={category.slug} className="h-4 w-4" />
          </span>
          عرض كل {category.name}
        </Link>
        {category.children.map((ch) => {
          const chHref = ROUTES.CATEGORY(ch.slug);
          const chActive =
            pathname === chHref || pathname.startsWith(`${chHref}/`);
          return (
            <Link
              key={ch.id}
              href={chHref}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-lg px-2 py-1 text-sm text-brand-950 hover:bg-surface-muted/80",
                chActive && navLinkActiveClass,
              )}
              onClick={onNavigate}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-white">
                <CategoryIcon slug={ch.slug} className="h-4 w-4" />
              </span>
              {ch.name}
            </Link>
          );
        })}
      </div>
    </MobileAccordionSection>
    </div>
  );
}
