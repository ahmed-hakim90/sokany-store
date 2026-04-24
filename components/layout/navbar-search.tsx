"use client";

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
import { AppImage } from "@/components/AppImage";
import {
  headerProductSearchFieldGlassClass,
  headerProductSearchPanelGlassClass,
} from "@/components/layout/mobile-commerce-surface";
import { SearchField } from "@/components/ui/search-field";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { GLOBAL_PRODUCT_SEARCH_INPUT_ID, ROUTES } from "@/lib/constants";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import { cn, formatPrice } from "@/lib/utils";

export type NavbarSearchProps = {
  /** من CMS أو القيمة الافتراضية من الخادم. */
  quickKeywords?: readonly string[];
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

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

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
  const showKeywordPanel = open && !canSuggest;
  const showProductPanel = open && canSuggest;
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
const applyQuickKeyword = useCallback((keyword: string) => {
  const k = keyword.trim();
  if (!k) return;
  setValue(k);
  if (isProductsPage) {
    replaceProductsSearch(router , searchParams, k);

}else {
  navigateToSearch(router, k );
} setOpen(false);
inputRef.current?.blur();},
[isProductsPage,router, searchParams]
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
        placeholder="ابحث عن أجهزة سوكاني…"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value.trim().length >= 3) setOpen(true);
        }}
        onFocus={() => {
          if (trimmed.length >= 0) setOpen(true);
        }}
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
          "min-w-0 max-w-none h-9 sm:h-10 lg:h-12",
          headerProductSearchFieldGlassClass,
        )}
        compact
        leading={
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
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
       <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">
  الكلمات المفتاحية المقترحة
</p>
<ul
  className="max-h-[min(20rem,50dvh)] divide-y divide-slate-200/50 overflow-y-auto py-1"
  role="list"
>
  {quickKeywords.map((kw, index) => (
    <li key={`${kw}-${index}`}>
      <button
        type="button"
        className={cn(
          "w-full px-3 py-2.5 text-start text-sm text-brand-950",
          "transition-colors hover:bg-surface-muted/80 focus-visible:bg-surface-muted/80 focus-visible:outline-none",
        )}
        onClick={() => applyQuickKeyword(kw)}
      >
        {kw}
      </button>
    </li>
  ))}
</ul>
          </div>
          ): null}
          {showProductPanel ? (
            <div
              id={listboxId}
              role="listbox"
              className={cn(
                "absolute start-0 end-0 top-[calc(100%+0.35rem)] z-50",
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
                      className="flex animate-pulse gap-3 rounded-md bg-surface-muted/60 p-2"
                    >
                      <div className="h-12 w-12 shrink-0 rounded bg-border" />
                      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
                        <div className="h-3.5 w-[82%] rounded bg-border" />
                        <div className="h-3 w-1/3 rounded bg-border" />
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
            <ul className="max-h-[min(22rem,60dvh)] divide-y divide-slate-200/50 overflow-y-auto py-1">
              {suggestions.data.map((product) => (
                <li key={product.id} role="presentation">
                  <Link
                    href={ROUTES.PRODUCT(product.id)}
                    role="option"
                    className={cn(
                      "flex gap-3 px-3 py-2 text-start transition-colors",
                      "hover:bg-surface-muted/80 focus-visible:bg-surface-muted/80 focus-visible:outline-none",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/80 bg-image-well">
                      <AppImage
                        src={product.thumbnail}
                        alt=""
                        fill
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-brand-950">
                        {product.name}
                      </p>
                      <p
                        className="mt-0.5 text-xs font-semibold text-brand-900 tabular-nums tracking-wide"
                        dir="ltr"
                      >
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-200/50 p-2">
            <button
              type="button"
              className="min-w-0 max-w-none rounded-md py-2 text-center text-sm font-medium text-brand-900 hover:bg-surface-muted/80"
              onClick={goSearch}
            >
              عرض الكل
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
