"use client";

/**
 * طبقة بحث ملء الشاشة (موبايل/تابلت):
 * — حقل لاصق أعلى + عمليات أخيرة + أقسام + نتائج حية من نفس hook الاقتراحات.
 * — لا يغيّر API البحث؛ التنقّل كما في NavbarSearch.
 */
import { createPortal } from "react-dom";
import { Link } from "next-view-transitions";
import { usePathname, useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { SearchField } from "@/components/ui/search-field";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useProducts } from "@/features/products/hooks/useProducts";
import { STOREFRONT_Z } from "@/lib/storefront-overlay-z";
import { ROUTES } from "@/lib/constants";
import {
  clearRecentProductSearches,
  getRecentProductSearches,
  rememberProductSearch,
} from "@/lib/recent-product-searches";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import { useSearchOverlayOpenStore } from "@/features/search/store/useSearchOverlayOpenStore";
import { cn, formatPrice } from "@/lib/utils";

const POPULAR_CATEGORY_CHIPS = [
  { href: ROUTES.CATEGORY("kitchen-supplies"), label: "المطبخ" },
  { href: ROUTES.CATEGORY("home-appliances"), label: "الأجهزة المنزلية" },
  { href: ROUTES.CATEGORY("personal-care"), label: "العناية الشخصية" },
  { href: ROUTES.OFFERS, label: "العروض" },
] as const;

function navigateToSearch(router: ReturnType<typeof useTransitionRouter>, q: string) {
  const trimmed = q.trim();
  router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
}

export type StorefrontSearchOverlayProps = {
  quickKeywords?: readonly string[];
};

export function StorefrontSearchOverlay({
  quickKeywords = DEFAULT_SEARCH_QUICK_KEYWORDS,
}: StorefrontSearchOverlayProps) {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const open = useSearchOverlayOpenStore((s) => s.open);
  const initialQuery = useSearchOverlayOpenStore((s) => s.initialQuery);
  const closeOverlay = useSearchOverlayOpenStore((s) => s.closeOverlay);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const isProductsPage = pathname === ROUTES.PRODUCTS;
  const [value, setValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setValue(initialQuery || "");
    setRecentSearches(getRecentProductSearches());
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.documentElement;
    root.setAttribute("data-storefront-modal", "");
    return () => {
      document.body.style.overflow = prev;
      root.removeAttribute("data-storefront-modal");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOverlay]);

  const debouncedValue = useDebounce(value, 400);
  const trimmed = value.trim();
  const canSuggest = trimmed.length >= 3;
  const suggestions = useSearchSuggestions(value);
  const loading = canSuggest && suggestions.isFetching && !suggestions.data;
  const trendingQuery = useProducts(
    { orderby: "popularity", order: "desc", per_page: 6 },
    { enabled: open && !canSuggest },
  );

  const goSearch = useCallback(() => {
    const q = value.trim();
    if (q.length >= 2) rememberProductSearch(q);
    if (isProductsPage) {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("search", q);
      else params.delete("search");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS, { scroll: false });
    } else {
      navigateToSearch(router, value);
    }
    closeOverlay();
  }, [closeOverlay, isProductsPage, router, searchParams, value]);

  const applyTerm = useCallback(
    (term: string) => {
      const k = term.trim();
      if (!k) return;
      rememberProductSearch(k);
      setValue(k);
      navigateToSearch(router, k);
      closeOverlay();
    },
    [closeOverlay, router],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col bg-page"
      style={{ zIndex: STOREFRONT_Z.searchOverlay }}
      role="presentation"
    >
      <header className="shrink-0 border-b border-border/80 bg-white/95 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm"
            aria-label="إغلاق البحث"
            onClick={() => closeOverlay()}
          >
            <CloseIcon />
          </button>
          <SearchField
            ref={inputRef}
            id="storefront-search-overlay-input"
            role="combobox"
            aria-expanded={canSuggest}
            aria-controls={canSuggest ? listboxId : undefined}
            aria-label="بحث في المنتجات"
            placeholder="ابحث عن أجهزة سوكاني…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goSearch();
              }
            }}
            className="min-h-12 flex-1"
            compact={false}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {!canSuggest ? (
          <div className="space-y-5">
            {recentSearches.length > 0 ? (
              <section aria-label="عمليات البحث الأخيرة">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-brand-950">عمليات البحث الأخيرة</h2>
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-800"
                    onClick={() => {
                      clearRecentProductSearches();
                      setRecentSearches([]);
                    }}
                  >
                    مسح الكل
                  </button>
                </div>
                <ul className="space-y-1" role="list">
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-start text-sm font-medium text-brand-950 shadow-sm"
                        onClick={() => applyTerm(term)}
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-label="أقسام شائعة">
              <h2 className="mb-2 text-sm font-bold text-brand-950">أقسام شائعة</h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CATEGORY_CHIPS.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="rounded-full border border-border/80 bg-white px-3 py-1.5 text-xs font-semibold text-brand-900 shadow-sm"
                    onClick={() => closeOverlay()}
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </section>

            <section aria-label="اقتراحات سريعة">
              <h2 className="mb-2 text-sm font-bold text-brand-950">اقتراحات سريعة</h2>
              <ul className="space-y-1" role="list">
                {quickKeywords.map((kw, index) => (
                  <li key={`${kw}-${index}`}>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-start text-sm font-medium text-brand-950 shadow-sm"
                      onClick={() => applyTerm(kw)}
                    >
                      {kw}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="منتجات رائجة">
              <h2 className="mb-2 text-sm font-bold text-brand-950">منتجات رائجة</h2>
              {trendingQuery.isFetching ? (
                <div className="space-y-2" aria-busy="true">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex animate-pulse gap-3 rounded-2xl border border-border/60 bg-white p-3"
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-surface-muted" />
                      <div className="flex flex-1 flex-col justify-center gap-2">
                        <div className="h-3.5 w-[75%] rounded bg-surface-muted" />
                        <div className="h-3 w-16 rounded bg-surface-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingQuery.data?.items.length ? (
                <ul className="space-y-2" role="list">
                  {trendingQuery.data.items.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={ROUTES.PRODUCT(product.id)}
                        className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white p-3 shadow-sm"
                        onClick={() => closeOverlay()}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-image-well">
                          <AppImage src={product.thumbnail} alt="" fill sizes="56px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-brand-950">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-brand-900" dir="ltr">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
        ) : (
          <section aria-label="نتائج البحث السريعة">
            {loading ? (
              <div className="space-y-2" aria-busy="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse gap-3 rounded-2xl border border-border/60 bg-white p-3"
                  >
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-surface-muted" />
                    <div className="flex flex-1 flex-col justify-center gap-2">
                      <div className="h-3.5 w-[80%] rounded bg-surface-muted" />
                      <div className="h-3.5 w-20 rounded bg-surface-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.isError ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                تعذر تحميل الاقتراحات. اضغط Enter للبحث الكامل.
              </p>
            ) : !suggestions.data?.length ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                لا توجد نتائج مطابقة — جرّب كلمات أخرى أو اضغط «عرض كل النتائج».
              </p>
            ) : (
              <ul id={listboxId} className="space-y-2" role="listbox">
                {suggestions.data.map((product) => (
                  <li key={product.id} role="presentation">
                    <Link
                      href={ROUTES.PRODUCT(product.id)}
                      role="option"
                      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white p-3 shadow-sm"
                      onClick={() => closeOverlay()}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-image-well">
                        <AppImage src={product.thumbnail} alt="" fill sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-brand-950">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-brand-900" dir="ltr">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <footer className="shrink-0 border-t border-border/80 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-black text-black shadow-sm"
          onClick={goSearch}
        >
          عرض كل النتائج
        </button>
      </footer>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
