"use client";

/**
 * بحث المنتجات في الهيدر
 * بالعامية: debounce + اقتراحات سريعة من CMS؛ التنقّل يستخدم view transitions حيث متاح.
 *
 * شوف كمان: `@/hooks/useSearchSuggestions.ts`
 */
import { Link } from "next-view-transitions";
import {
  usePathname,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import {
  headerProductSearchFieldGlassClass,
  headerProductSearchPanelGlassClass,
} from "@/components/layout/mobile-commerce-surface";
import { SearchField } from "@/components/ui/search-field";
import { useDebounce } from "@/hooks/useDebounce";
import { useMinLg } from "@/hooks/useMinLg";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useSearchOverlayOpenStore } from "@/features/search/store/useSearchOverlayOpenStore";
import { GLOBAL_PRODUCT_SEARCH_INPUT_ID, ROUTES } from "@/lib/constants";
import {
  clearRecentProductSearches,
  getRecentProductSearches,
  rememberProductSearch,
} from "@/lib/recent-product-searches";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import { cn, formatPrice } from "@/lib/utils";

const POPULAR_CATEGORY_CHIPS = [
  { href: ROUTES.CATEGORY("kitchen-supplies"), label: "المطبخ" },
  { href: ROUTES.CATEGORY("home-appliances"), label: "الأجهزة المنزلية" },
  { href: ROUTES.CATEGORY("personal-care"), label: "العناية الشخصية" },
  { href: ROUTES.OFFERS, label: "العروض" },
] as const;

export type NavbarSearchProps = {
  /** من CMS أو القيمة الافتراضية من الخادم. */
  quickKeywords?: readonly string[];
  /** يُمرَّر على حقل البحث — مفيد لتعديل الارتفاع في سياقات مختلفة */
  fieldClassName?: string;
};

function navigateToSearch(router: ReturnType<typeof useTransitionRouter>, q: string) {
  const trimmed = q.trim();
  router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`);
}

function replaceProductsSearch(
  router: ReturnType<typeof useTransitionRouter>,
  searchParams: ReadonlyURLSearchParams,
  raw: string,
) {
  const next = raw.trim();
  const current = (searchParams.get("search") ?? "").trim();
  if (next === current) return;

  const params = new URLSearchParams(searchParams.toString());
  if (next) {
    params.set("search", next);
  } else {
    params.delete("search");
  }
  params.delete("page");

  const qs = params.toString();
  startTransition(() => {
    router.replace(qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS, {
      scroll: false,
    });
  });
}

export function NavbarSearch({
  quickKeywords = DEFAULT_SEARCH_QUICK_KEYWORDS,
  fieldClassName,
}: NavbarSearchProps = {}) {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const keywordPanelId = useId();
  const reactId = useId();
  const inputId = `${GLOBAL_PRODUCT_SEARCH_INPUT_ID}-${reactId.replace(/:/g, "")}`;

  const isProductsPage = pathname === ROUTES.PRODUCTS;
  const isSearchPage = pathname === ROUTES.SEARCH;
  const lgUp = useMinLg();
  const openSearchOverlay = useSearchOverlayOpenStore((s) => s.openOverlay);

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setRecentSearches(getRecentProductSearches());
  }, [open]);

  useEffect(() => {
    if (!isProductsPage) return;
    const fromUrl = searchParams.get("search")?.trim() ?? "";
    queueMicrotask(() => setValue(fromUrl));
  }, [isProductsPage, searchParams]);

  useEffect(() => {
    if (!isSearchPage) return;
    const fromUrl = searchParams.get("q")?.trim() ?? "";
    queueMicrotask(() => setValue(fromUrl));
  }, [isSearchPage, searchParams]);

  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    if (!isProductsPage) return;
    if (debouncedValue !== value) return;
    const next = debouncedValue.trim();
    const current = (searchParams.get("search") ?? "").trim();
    if (next === current) return;
    replaceProductsSearch(router, searchParams, debouncedValue);
  }, [debouncedValue, value, isProductsPage, router, searchParams]);

  const trimmed = value.trim();
  const canSuggest = trimmed.length >= 3;
  const suggestions = useSearchSuggestions(value);
  const showKeywordPanel = open && !canSuggest && lgUp;
  const showProductPanel = open && canSuggest && lgUp;
  const loading =
    canSuggest && suggestions.isFetching && !suggestions.data;
  const dropdownOpen = showKeywordPanel || showProductPanel;
  const ariaControlsId = showProductPanel ? listboxId : keywordPanelId;

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const goSearch = useCallback(() => {
    const q = value.trim();
    if (q.length >= 2) rememberProductSearch(q);
    if (isProductsPage) {
      replaceProductsSearch(router, searchParams, value);
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    navigateToSearch(router, value);
    setOpen(false);
    inputRef.current?.blur();
  }, [isProductsPage, router, searchParams, value]);
  const applyQuickKeyword = useCallback(
    (keyword: string) => {
      const k = keyword.trim();
      if (!k) return;
      rememberProductSearch(k);
      setValue(k);
      if (isProductsPage) {
        replaceProductsSearch(router, searchParams, k);
      } else {
        navigateToSearch(router, k);
      }
      setOpen(false);
      inputRef.current?.blur();
    },
    [isProductsPage, router, searchParams],
  );
  return (
    <div ref={rootRef} className="relative min-w-0 max-w-none">
      <SearchField
        ref={inputRef}
        id={inputId}
        role="combobox"
        aria-expanded={dropdownOpen}
        aria-controls={ariaControlsId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-label="بحث في المنتجات"
        data-product-search-header=""
        placeholder="ابحث عن أجهزة سوكاني..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value.trim().length >= 3) setOpen(true);
        }}
        onFocus={() => {
          if (!lgUp) {
            openSearchOverlay(value);
            inputRef.current?.blur();
            return;
          }
          setOpen(true);
        }}
        onClick={() => {
          if (!lgUp) openSearchOverlay(value);
        }}
        readOnly={!lgUp}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
          }
          if (e.key === "Enter") {
            e.preventDefault();
            goSearch();
          }
        }}
        className={cn(
          "min-w-0 max-w-none lg:h-12 max-lg:h-12 lg:rounded-[1rem]",
          headerProductSearchFieldGlassClass,
          "max-lg:rounded-2xl max-lg:ps-5 max-lg:ring-1 max-lg:ring-black/[0.05]",
          fieldClassName,
        )}
        compact
        leading={
          <Search
            className="h-[1.0625rem] w-[1.0625rem] shrink-0 text-muted-foreground"
            strokeWidth={2.05}
            aria-hidden
          />
        }
        trailing={
          value.trim() ? (
            <button
              type="button"
              className="rounded-md px-1.5 py-0.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
              aria-label="مسح البحث"
              onClick={() => {
                setValue("");
                setOpen(true);
                inputRef.current?.focus();
              }}
            >
              مسح
            </button>
          ) : null
        }
      />

      {showKeywordPanel ? (
        <div
          id={keywordPanelId}
          role="region"
          aria-label="بحث سريع"
          className={cn(
            "absolute start-0 end-0 top-[calc(100%+0.35rem)] z-50",
            headerProductSearchPanelGlassClass,
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          {recentSearches.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/55 px-3 py-2">
                <p className="text-xs font-bold text-brand-950">عمليات البحث الأخيرة</p>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-brand-800 hover:underline"
                  onClick={() => {
                    clearRecentProductSearches();
                    setRecentSearches([]);
                  }}
                >
                  مسح الكل
                </button>
              </div>
              <ul className="space-y-0.5 px-1.5 pb-1" role="list">
                {recentSearches.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2.5 py-2 text-start text-sm font-medium text-brand-950 transition-colors hover:bg-surface-muted/85"
                      onClick={() => applyQuickKeyword(term)}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="border-b border-t border-slate-200/55 px-3 py-2 text-xs font-bold text-brand-950">
            أقسام شائعة
          </p>
          <div className="flex flex-wrap gap-1.5 px-2 py-2">
            {POPULAR_CATEGORY_CHIPS.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="rounded-full border border-border/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-brand-900 transition-colors hover:bg-surface-muted/90"
                onClick={() => setOpen(false)}
              >
                {chip.label}
              </Link>
            ))}
          </div>
          <p className="border-b border-t border-slate-200/55 px-3 py-2 text-xs font-bold text-brand-950">
            اقتراحات سريعة
          </p>
          <ul
            className="max-h-[min(14rem,40dvh)] space-y-0.5 overflow-y-auto overscroll-y-contain px-1.5 py-1.5"
            role="list"
          >
            {quickKeywords.map((kw, index) => (
              <li key={`${kw}-${index}`}>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-start text-sm font-medium text-brand-950",
                    "transition-colors hover:bg-surface-muted/85 focus-visible:bg-surface-muted/85 focus-visible:outline-none",
                  )}
                  onClick={() => applyQuickKeyword(kw)}
                >
                  {kw}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
          {showProductPanel ? (
            <div
              id={listboxId}
              role="listbox"
              className={cn(
                "absolute start-0 end-0 top-[calc(100%+0.35rem)] z-50 flex max-h-[min(28rem,72dvh)] flex-col",
                headerProductSearchPanelGlassClass,
              )}
              onMouseDown={(e) => e.preventDefault()}
            >
              {loading ? (
                <div className="space-y-2 p-3" aria-live="polite" aria-busy="true">
                  <p className="sr-only">جاري التحميل</p>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex animate-pulse gap-3 rounded-lg bg-surface-muted/60 p-2.5"
                    >
                      <div className="h-14 w-14 shrink-0 rounded-md bg-border" />
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                        <div className="h-3.5 w-[82%] rounded bg-border" />
                        <div className="h-3.5 w-24 rounded bg-border" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestions.isError ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  تعذر تحميل الاقتراحات. اضغط Enter للبحث الكامل.
                </div>
              ) : !suggestions.data?.length ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  لا توجد نتائج مطابقة
                </div>
              ) : (
                <>
                  <div className="shrink-0 border-b border-slate-200/55 px-3 py-2">
                    <p className="text-xs font-bold text-brand-950">نتائج سريعة</p>
                    <p className="text-[11px] text-muted-foreground">
                      {suggestions.data.length} منتج — اضغط للصفحة أو «عرض الكل» للقائمة
                    </p>
                  </div>
                  <ul className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-1">
                    {suggestions.data.map((product) => (
                      <li key={product.id} role="presentation">
                        <Link
                          href={ROUTES.PRODUCT(product.id)}
                          role="option"
                          className={cn(
                            "mx-1.5 flex items-center gap-3 rounded-lg px-2 py-2 text-start transition-colors",
                            "hover:bg-surface-muted/85 focus-visible:bg-surface-muted/85 focus-visible:outline-none",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-image-well">
                            <AppImage
                              src={product.thumbnail}
                              alt=""
                              fill
                              sizes="56px"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-950">
                              {product.name}
                            </p>
                            <p
                              className="text-sm font-bold tabular-nums tracking-wide text-brand-900"
                              dir="ltr"
                            >
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="shrink-0 border-t border-slate-200/55 bg-white/50 p-2">
                <button
                  type="button"
                  className="w-full rounded-lg py-2.5 text-center text-sm font-bold text-brand-950 transition-colors hover:bg-surface-muted/90"
                  onClick={goSearch}
                >
                  عرض كل النتائج
                </button>
              </div>
            </div>
          ) : null}
    </div>
  );
}

/**
 * Placeholder for the header search row while `useSearchParams()` resolves (SSR/streaming).
 * Matches flex layout + heights of `NavbarSearch` + `CatalogFilterDrawerTrigger`.
 */
export function NavbarSearchRowSkeleton() {
  return (
    <div
      className="flex min-w-0 w-full items-center gap-2"
      aria-busy="true"
      aria-label="جاري تحميل البحث"
    >
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "min-w-0 max-w-none h-9 lg:h-12 lg:rounded-[1rem] max-lg:h-12",
            "max-lg:rounded-2xl animate-pulse",
            "bg-white/92 shadow-[0_10px_34px_-14px_rgba(15,23,42,0.22)] backdrop-blur-2xl ring-1 ring-slate-900/10",
            headerProductSearchFieldGlassClass,
          )}
        />
      </div>
      <div
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white/90 animate-pulse"
        aria-hidden
      />
    </div>
  );
}
