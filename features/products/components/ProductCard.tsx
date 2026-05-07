"use client";

import { BadgeCheck, CirclePlay, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { cn } from "@/lib/utils";
import { usePointerSwipe } from "@/hooks/usePointerSwipe";
import {
  PRODUCT_CARD_SHOW_QUICK_VIEW,
  PRODUCT_CARD_SHOW_SALES_COUNT,
  ROUTES,
} from "@/lib/constants";
import { getProductCardSalesCountText } from "@/features/products/lib/product-card-sales-count";
import { getProductVideoEmbed } from "@/features/products/lib/product-merchandising";
import { playCartFlyAnimation } from "@/lib/cart-fly-animation";
import { usePrefetchProduct } from "@/features/products/hooks/usePrefetchProduct";
import { ProductQuickViewModal } from "@/features/products/components/product-quick-view-modal";
import {
  WishlistHeartBurstPortal,
  WISHLIST_HEART_BURST_COUNT,
  WISHLIST_HEART_BURST_STAGGER_SEC,
  type HeartParticle,
} from "@/features/products/components/wishlist-heart-burst";
import { ProductRatingDisplay } from "@/features/products/components/product-rating-display";
import { useProductMerchandising } from "@/features/products/components/product-merchandising-context";
import { ProductStatusBadge } from "@/features/products/components/product-status-badge";
import type { Product } from "@/features/products/types";

export type ProductCardVariant =
  | "mobileCompact"
  | "desktopCatalog"
  | "desktopCatalogWide"
  | "featured"
  | "detailed";

export type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
  /** First visible grid cells: pass `true` for LCP-friendly image loading. */
  imagePriority?: boolean;
  /**
   * Homepage / light grids: short CSS opacity crossfade only (no layout animation).
   * @default false
   */
  simpleImageMode?: boolean;
  /**
   * Catalog: longer CSS crossfade when true. Ignored when `simpleImageMode` is true.
   * When false and `simpleImageMode` is false, image swap is instant. @default true
   */
  imageMotion?: boolean;
  getCartLineQuantity?: (productId: number) => number;
  onCartLineQuantityChange?: (product: Product, next: number) => void;
  /** Renders over the image corner (e.g. wishlist IconButton). */
  wishlistSlot?: React.ReactNode;
  className?: string;
};

/** Prefer list vs current price; fall back to regular vs sale_price from WooCommerce. */
function saleDiscountPercent(product: Product): number | null {
  if (!product.onSale) return null;
  const current = product.price;

  const pctFromList = (list: number): number | null => {
    if (!(list > current) || !(list > 0)) return null;
    const pct = Math.round((1 - current / list) * 100);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null;
    return pct;
  };

  const a = pctFromList(product.regularPrice);
  if (a !== null) return a;

  if (
    product.salePrice !== null &&
    product.regularPrice > product.salePrice
  ) {
    const pct = Math.round(
      (1 - product.salePrice / product.regularPrice) * 100,
    );
    if (Number.isFinite(pct) && pct > 0 && pct < 100) return pct;
  }

  return null;
}

const variantLayout: Record<
  ProductCardVariant,
  { card: string; body: string; title: string; image: string }
> = {
  /* بدون ‎overflow-hidden‎ على الـcard — لئلا يُقصّ ظل/حلقة أزرار التذييل (المعاينة) على موبايل. القصّ للصور فقط على مربع الصورة. */
  mobileCompact: {
    card: "min-w-0 gap-2 p-2 sm:p-2.5",
    body: "gap-1.5 p-0.5 pt-0 sm:gap-2",
    title: "line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-[1.22] text-slate-950",
    image: "h-[136px] w-full sm:h-[144px]",
  },
  desktopCatalog: {
    card: "min-w-0 gap-2 p-2 sm:p-2.5",
    body: "gap-1.5 p-0.5 pt-0 sm:gap-2",
    title: "line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-[1.22] text-neutral-950",
    image: "h-[138px] w-full sm:h-[146px] lg:h-[154px]",
  },
  desktopCatalogWide: {
    card: "min-w-0 gap-2 p-2 sm:p-2.5",
    body: "gap-1.5 p-0.5 pt-0 sm:gap-2",
    title: "line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-[1.22] text-neutral-950",
    image: "h-[138px] w-full sm:h-[146px] lg:h-[154px]",
  },
  featured: {
    card: "min-w-0 gap-2 p-2 sm:p-2.5",
    body: "gap-1.5 p-0.5 pt-0 sm:gap-2",
    title: "line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-[1.22] text-neutral-950",
    image: "h-[138px] w-full sm:h-[146px] lg:h-[154px]",
  },
  detailed: {
    card: "p-0 min-w-0",
    body: "gap-2 p-3 sm:p-3.5",
    title: "line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-neutral-950",
    image: "aspect-square w-full",
  },
};

type CardSlide = { key: string; src: string; alt: string };

const productCardImageClassName =
  "object-contain object-center p-2 transition-transform duration-200 ease-out group-hover/card:scale-105 group-active/card:scale-[0.97] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100";

function ProductCardImageStack({
  activeSlide,
  crossfadeMs,
  prefersReducedMotion,
  imageSizes,
  imagePriority,
  productId,
}: {
  activeSlide: CardSlide;
  crossfadeMs: number;
  prefersReducedMotion: boolean;
  imageSizes: string;
  imagePriority: boolean;
  productId: number;
}) {
  const [committed, setCommitted] = useState(activeSlide);
  const [transition, setTransition] = useState<{
    outgoing: CardSlide;
    incoming: CardSlide;
  } | null>(null);
  const [runTransition, setRunTransition] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion || crossfadeMs <= 0) {
      const frame = requestAnimationFrame(() => {
        setCommitted(activeSlide);
        setTransition(null);
        setRunTransition(false);
      });
      return () => cancelAnimationFrame(frame);
    }

    if (activeSlide.key === committed.key && !transition) {
      return;
    }

    if (transition) {
      if (activeSlide.key !== transition.incoming.key) {
        const frame = requestAnimationFrame(() => {
          setCommitted(activeSlide);
          setTransition(null);
          setRunTransition(false);
        });
        return () => cancelAnimationFrame(frame);
      }
      return;
    }
    const frame = requestAnimationFrame(() => {
      setTransition({ outgoing: committed, incoming: activeSlide });
      setRunTransition(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [
    activeSlide,
    committed,
    transition,
    crossfadeMs,
    prefersReducedMotion,
  ]);

  useLayoutEffect(() => {
    if (!transition) return;
    const id = requestAnimationFrame(() => {
      setRunTransition(true);
    });
    return () => cancelAnimationFrame(id);
  }, [transition]);

  const onOutgoingTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.propertyName !== "opacity") return;
    if (!transition) return;
    setCommitted(transition.incoming);
    setTransition(null);
    setRunTransition(false);
  };

  if (prefersReducedMotion || crossfadeMs <= 0) {
    return (
      <AppImage
        src={activeSlide.src}
        alt={activeSlide.alt}
        fill
        sizes={imageSizes}
        priority={imagePriority}
        className={productCardImageClassName}
        shimmerUntilLoaded
        usePlaceholderOnError={false}
      />
    );
  }

  if (!transition) {
    return (
      <AppImage
        src={committed.src}
        alt={committed.alt}
        fill
        sizes={imageSizes}
        priority={imagePriority}
        className={productCardImageClassName}
        shimmerUntilLoaded
        usePlaceholderOnError={false}
      />
    );
  }

  const durationClass =
    crossfadeMs <= 200 ? "duration-200" : "duration-[320ms]";

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 z-0 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)]",
          durationClass,
          runTransition ? "opacity-100" : "opacity-0",
        )}
      >
        <AppImage
          key={`${productId}-${transition.incoming.key}-in`}
          src={transition.incoming.src}
          alt={transition.incoming.alt}
          fill
          sizes={imageSizes}
          priority={imagePriority}
          className={productCardImageClassName}
          shimmerUntilLoaded
          usePlaceholderOnError={false}
        />
      </div>
      <div
        className={cn(
          "absolute inset-0 z-[1] transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)]",
          durationClass,
          runTransition ? "opacity-0" : "opacity-100",
        )}
        onTransitionEnd={onOutgoingTransitionEnd}
      >
        <AppImage
          key={`${productId}-${transition.outgoing.key}-out`}
          src={transition.outgoing.src}
          alt={transition.outgoing.alt}
          fill
          sizes={imageSizes}
          priority={imagePriority}
          className={productCardImageClassName}
          shimmerUntilLoaded
          usePlaceholderOnError={false}
        />
      </div>
    </>
  );
}

export function ProductCard({
  product,
  variant = "desktopCatalog",
  imagePriority = false,
  simpleImageMode = false,
  imageMotion = true,
  getCartLineQuantity,
  onCartLineQuantityChange,
  wishlistSlot,
  className,
}: ProductCardProps) {
  const router = useRouter();
  const prefetchProduct = usePrefetchProduct();
  const imageFlyRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const crossfadeMs = useMemo(() => {
    if (prefersReducedMotion) return 0;
    if (simpleImageMode) return 200;
    if (!imageMotion) return 0;
    return 320;
  }, [prefersReducedMotion, simpleImageMode, imageMotion]);
  const merchandising = useProductMerchandising();
  const addFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layout = variantLayout[variant];
  const compareAt =
    product.onSale && product.regularPrice > product.price
      ? product.regularPrice
      : null;
  const isDetailed = variant === "detailed";
  const priceCompact = !isDetailed;
  const saleDiscount = saleDiscountPercent(product);
  const hasProductVideo = useMemo(
    () => getProductVideoEmbed(product) !== null,
    [product],
  );
  const salesCountLine = useMemo(
    () => getProductCardSalesCountText(product, PRODUCT_CARD_SHOW_SALES_COUNT),
    [product],
  );
  const handlePrefetch = () => {
    void prefetchProduct(product.id);
  };
  const lineQty = getCartLineQuantity?.(product.id) ?? 0;
  const showCartQty = Boolean(onCartLineQuantityChange);
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addButtonText = !product.inStock
    ? "نفد"
    : justAdded
      ? "تم"
      : "أضف للسلة";
  const addButtonAriaLabel = !product.inStock
    ? "المنتج غير متوفر حالياً"
    : justAdded
      ? "تمت الإضافة للسلة"
      : "أضف للسلة";

  const cardSlides = useMemo(() => {
    if (product.images.length > 0) {
      return product.images.map((img) => ({
        key: String(img.id),
        src: img.src,
        alt: img.alt || product.name,
      }));
    }
    if (product.thumbnail.trim()) {
      return [{ key: "thumb", src: product.thumbnail, alt: product.name }];
    }
    return [];
  }, [product]);

  const [imageIndex, setImageIndex] = useState(0);
  const multiImage = cardSlides.length > 1;
  const emptySlide = useMemo(
    (): CardSlide => ({
      key: "no-image",
      src: "",
      alt: product.name,
    }),
    [product.name],
  );
  const activeSlide = useMemo(
    () => cardSlides[imageIndex] ?? cardSlides[0] ?? emptySlide,
    [cardSlides, imageIndex, emptySlide],
  );

  useEffect(() => {
    setImageIndex(0);
  }, [product.id]);

  const goImgNext = useCallback(() => {
    setImageIndex((i) => (i >= cardSlides.length - 1 ? 0 : i + 1));
  }, [cardSlides.length]);

  const goImgPrev = useCallback(() => {
    setImageIndex((i) => (i <= 0 ? cardSlides.length - 1 : i - 1));
  }, [cardSlides.length]);

  const navigateToProduct = useCallback(() => {
    router.push(ROUTES.PRODUCT(product.id));
  }, [router, product.id]);

  const cardImageSwipe = usePointerSwipe({
    enabled: multiImage,
    onSwipeNext: goImgNext,
    onSwipePrev: goImgPrev,
    onTap: navigateToProduct,
  });

  /**
   * ديسكتوب: اختيار الصورة بموضع الماوس أفقياً أثناء الهوفر.
   * لا يُطبَّق أثناء الضغط والسحب (يُرجَع لـ ‎usePointerSwipe‎).
   * عند مغادرة المنطقة نُرجع للصورة الأولى.
   */
  const updateImageIndexFromCardPointerX = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse" || !multiImage) return;
      if (e.buttons !== 0) return;
      const { left, width } = e.currentTarget.getBoundingClientRect();
      if (width <= 0) return;
      const t = (e.clientX - left) / width;
      const n = cardSlides.length;
      const i = Math.min(
        n - 1,
        Math.max(0, Math.floor(Math.min(1, Math.max(0, t)) * n)),
      );
      setImageIndex((prev) => (prev === i ? prev : i));
    },
    [multiImage, cardSlides.length],
  );

  const onCardImagePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      void prefetchProduct(product.id);
      if (e.pointerType === "mouse" && multiImage) {
        updateImageIndexFromCardPointerX(e);
      }
    },
    [prefetchProduct, product.id, multiImage, updateImageIndexFromCardPointerX],
  );

  const onCardImagePointerLeave = useCallback(() => {
    if (multiImage) setImageIndex(0);
  }, [multiImage]);

  useEffect(() => {
    return () => {
      if (addFeedbackTimerRef.current) {
        clearTimeout(addFeedbackTimerRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!onCartLineQuantityChange || !product.inStock) return;
    onCartLineQuantityChange(product, Math.min(99, lineQty + 1));
    void playCartFlyAnimation({
      fromElement: imageFlyRef.current,
      imageSrc: activeSlide.src,
      prefersReducedMotion: Boolean(prefersReducedMotion),
    });
    setJustAdded(true);
    if (addFeedbackTimerRef.current) {
      clearTimeout(addFeedbackTimerRef.current);
    }
    addFeedbackTimerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const imageSizes =
    isDetailed
      ? "(max-width: 768px) 50vw, 25vw"
      : "(max-width: 768px) 48vw, 10rem";

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target;
    if (
      target instanceof Element &&
      target.closest("a, button, input, select, textarea, [data-card-image-swipe]")
    ) {
      return;
    }
    navigateToProduct();
  };

  const titleLink = (
    <Link
      href={ROUTES.PRODUCT(product.id)}
      dir="rtl"
      className={cn(
        "block min-w-0 text-foreground transition-colors hover:text-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        layout.title,
        !isDetailed && "text-right",
      )}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      {product.name}
    </Link>
  );

  const priceBlock = (
    <PriceText
      presentation="default"
      amount={product.price}
      compareAt={compareAt}
      compact={priceCompact}
      emphasized={false}
      amountClassName={cn(
        "font-display font-extrabold tracking-tight text-slate-950",
        priceCompact ? "text-[15px] leading-none sm:text-base" : "text-base md:text-lg",
        variant === "featured" && "text-lg",
      )}
      compareAtClassName="!text-[11px] !leading-none !text-neutral-400 md:!text-xs"
      className={cn(
        "min-w-0 !flex-col !items-start !gap-0.5 !gap-x-0",
      )}
    />
  );

  return (
    <>
      <Card
        variant="product"
        onClick={handleCardClick}
        className={cn(
          "group/card relative flex h-full min-w-0 cursor-pointer flex-col border-slate-200/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_38px_-22px_rgba(15,23,42,0.42)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none",
          isDetailed
            ? "rounded-xl border-black/[0.06]"
            : "rounded-2xl bg-white shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.04]",
          layout.card,
          className,
        )}
      >
        <div
          className={cn(
            "relative mx-auto overflow-hidden bg-white",
            isDetailed ? "rounded-t-xl" : "rounded-xl",
            layout.image,
          )}
        >
          <div ref={imageFlyRef} className="absolute inset-0 z-0">
            <ProductCardImageStack
              key={product.id}
              productId={product.id}
              activeSlide={activeSlide}
              crossfadeMs={crossfadeMs}
              prefersReducedMotion={prefersReducedMotion}
              imageSizes={imageSizes}
              imagePriority={imagePriority}
            />
          </div>
          {multiImage ? (
            <div
              data-card-image-swipe
              className="absolute inset-0 z-[1] touch-none select-none"
              aria-hidden
              onPointerEnter={onCardImagePointerEnter}
              onPointerMove={updateImageIndexFromCardPointerX}
              onPointerLeave={onCardImagePointerLeave}
              {...cardImageSwipe}
            />
          ) : (
            <Link
              href={ROUTES.PRODUCT(product.id)}
              className="absolute inset-0 z-[1]"
              onMouseEnter={handlePrefetch}
              onFocus={handlePrefetch}
              aria-label={product.name}
            />
          )}
          {!isDetailed && saleDiscount !== null ? (
            <span
              dir="ltr"
              className="pointer-events-none absolute left-2 top-2 z-[3] rounded-full bg-[#c45c5c] px-2 py-1 text-[10px] font-extrabold leading-none text-white shadow-sm sm:text-[11px]"
            >
              −{saleDiscount}%
            </span>
          ) : !isDetailed ? (
            <ProductStatusBadge
              product={product}
              className="pointer-events-none absolute left-2 top-2 z-[3] bg-white/95 px-2 py-1 text-[10px] shadow-sm ring-1 ring-white/70 backdrop-blur-sm sm:text-[10px]"
            />
          ) : saleDiscount !== null ? (
            <span
              dir="ltr"
              className="pointer-events-none absolute left-2 top-2 z-[3] rounded-full bg-[#c45c5c] px-2 py-1 text-[10px] font-extrabold leading-none text-white shadow-sm sm:text-[11px]"
            >
              −{saleDiscount}%
            </span>
          ) : isDetailed && product.featured ? (
            <span className="pointer-events-none absolute left-2 top-2 z-[3] rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold leading-none text-white shadow-sm">
              مميز
            </span>
          ) : null}
          {wishlistSlot ? (
            <div className="absolute right-2 top-2 z-[4]">
              {wishlistSlot}
            </div>
          ) : null}
          {hasProductVideo ? (
            <span
              className={cn(
                "pointer-events-none absolute z-[4] inline-flex h-7 items-center gap-1 rounded-full border border-white/70 bg-slate-950/88 px-2 text-[10px] font-extrabold leading-none text-white shadow-md shadow-slate-900/20 backdrop-blur-sm",
                isDetailed
                  ? wishlistSlot
                    ? "bottom-2 right-2"
                    : "right-2 top-2"
                  : "bottom-2 left-2",
              )}
              aria-label="هذا المنتج له فيديو"
            >
              <CirclePlay className="h-3.5 w-3.5 shrink-0 text-brand-300" aria-hidden />
              <span>فيديو</span>
            </span>
          ) : null}
          {!isDetailed && merchandising.productCardBadgeEnabled ? (
            <span className="pointer-events-none absolute bottom-2 right-2 z-[3] inline-flex max-w-[calc(100%-1rem)] items-center gap-1 rounded-full bg-white/92 px-2 py-1 text-[9px] font-extrabold leading-none text-slate-950 shadow-sm ring-1 ring-slate-200/90 backdrop-blur-sm sm:text-[10px]">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
              <span className="truncate">{merchandising.productCardBadgeText}</span>
            </span>
          ) : null}

          {PRODUCT_CARD_SHOW_QUICK_VIEW && isDetailed ? (
            <>
              {/* معاينة سريعة — ديسكتوب: يظهر مع الـ hover */}
              <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition-opacity duration-200 md:flex md:flex-col md:items-center md:justify-center md:group-hover/card:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/95 px-4 py-2 text-xs font-bold text-neutral-900 shadow-lg backdrop-blur-sm transition hover:bg-white"
                >
                  <EyeIcon />
                  <span>معاينة سريعة</span>
                </button>
              </div>

              {/* معاينة سريعة — موبايل: زر على الصورة عندما لا يوجد سلة+مفضلة في التذييل */}
              {!showCartQty ? (
                <div className="absolute bottom-2 left-2 z-[4] flex md:hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuickViewOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-900/70 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-slate-900/25 backdrop-blur-md"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span>معاينة</span>
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div
          className={cn(
            "relative flex min-w-0 flex-1 flex-col bg-white",
            layout.body,
            isDetailed ? "rounded-b-xl" : "rounded-b-2xl",
          )}
        >
          {isDetailed && !product.inStock ? (
            <span className="text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
              غير متوفر حالياً
            </span>
          ) : null}
          {titleLink}
          {!isDetailed ? (
            <div className="flex min-h-4 items-center gap-1 text-[10px] font-bold leading-none text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
              <span className="truncate">ضمان الوكيل في مصر</span>
            </div>
          ) : null}
          {!isDetailed ? (
            <ProductRatingDisplay
              rating={product.rating}
              ratingCount={product.ratingCount}
              size="xs"
              className="min-h-4 min-w-0 text-slate-600"
            />
          ) : null}
          {isDetailed ? (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <ProductRatingDisplay
                rating={product.rating}
                ratingCount={product.ratingCount}
                size="sm"
                className="min-w-0"
              />
              <ProductStatusBadge product={product} className="ms-auto shrink-0" />
            </div>
          ) : null}
          {isDetailed && salesCountLine ? (
            <p
              className={cn(
                "mt-0.5 text-[10px] font-medium text-muted-foreground",
                "sm:text-[11px]",
              )}
            >
              {salesCountLine}
            </p>
          ) : null}
          <div
            className={cn(
              "mt-auto",
              showCartQty
                ? "pt-0.5"
                : cn("flex items-end pt-1", isDetailed && "min-h-[3.25rem]"),
            )}
          >
            {showCartQty ? (
              <div
                className={cn(
                  "grid w-full min-w-0 items-center gap-1.5 sm:gap-2",
                  isDetailed ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1",
                )}
              >
                <div className="min-w-0">
                  {priceBlock}
                </div>
                <button
                  type="button"
                  disabled={!product.inStock}
                  aria-label={addButtonAriaLabel}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center gap-1 rounded bg-brand-500 font-bold leading-none text-black shadow-[0_8px_18px_-12px_rgba(132,204,22,0.9)] ring-1 ring-black/[0.06] transition-all duration-200 ease-out hover:bg-brand-400 group-hover/card:scale-105 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-45 disabled:group-hover/card:scale-100",
                    isDetailed
                      ? "h-9 px-2.5 text-[11px] sm:px-4 sm:text-xs"
                      : "h-8 w-full px-2.5 text-[10px] sm:h-8 sm:px-3 sm:text-[11px]",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                >
                  <MiniCartIcon checked={justAdded} />
                  {addButtonText}
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "min-h-0 min-w-0 flex-1",
                  "flex justify-start",
                )}
              >
                {priceBlock}
              </div>
            )}
          </div>
        </div>
      </Card>

      {PRODUCT_CARD_SHOW_QUICK_VIEW && isDetailed ? (
        <ProductQuickViewModal
          product={product}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          compareAt={compareAt}
          onAddToCart={() => {
            handleAddToCart();
          }}
          addToCartDisabled={!product.inStock}
          justAdded={justAdded}
        />
      ) : null}
    </>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4 w-4 shrink-0", className)}
      aria-hidden
    >
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function MiniCartIcon({ checked }: { checked?: boolean }) {
  if (checked) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
        <path
          fill="currentColor"
          d="M9.55 17.65l-4.1-4.1 1.4-1.45 2.7 2.7 6.75-6.75 1.45 1.45-8.2 8.15z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M4 5h2.1c.45 0 .84.3.96.74L7.5 7.4m0 0 1.05 4.05h7.6a1 1 0 0 0 .96-.72l.9-3.05a.75.75 0 0 0-.72-.96H7.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18" r="1.25" fill="currentColor" />
      <circle cx="16" cy="18" r="1.25" fill="currentColor" />
    </svg>
  );
}

/**
 * زر المفضلة على الكارت (فوق الصورة أو فوق «أضف للسلة» حسب التمرير) + منطق إطلاق قلوب طائرة (wishlist-heart-burst.tsx).
 */
export function ProductCardWishlistIconButton({
  pressed,
  onPress,
  labels = { add: "Add to favorites", remove: "Remove from favorites" },
}: {
  pressed?: boolean;
  onPress?: () => void;
  labels?: { add: string; remove: string };
}) {
  // مرجع لعنصر الزر في DOM — نحتاجه لقراءة موضعه على الشاشة بعد الضغط.
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // عداد يزيد دائماً — يضمن أن كل جزيء له key فريد حتى لو ضغط المستخدم بسرعة عدة مرات.
  const particleIdRef = useRef(0);
  // كل الجزيئات «الحية» حالياً؛ تُزال واحدة واحدة عند انتهاء أنيميشنها.
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  const spawnBurst = () => {
    if (prefersReducedMotion) return;
    const el = buttonRef.current;
    if (!el) return;
    // مستطيل الزر بالنسبة لنافذة المتصفح (إحداثيات شاشة، ليست نسبية للكارت).
    const r = el.getBoundingClientRect();
    // مركز الزر أفقياً ورأسياً — منه تبدأ كل القلوب.
    const ox = r.left + r.width / 2;
    const oy = r.top + r.height / 2;
    const next: HeartParticle[] = Array.from(
      { length: WISHLIST_HEART_BURST_COUNT },
      (_, i) => ({
        id: ++particleIdRef.current,
        originX: ox,
        originY: oy,
        // عشوائي بين تقريباً -21 و +21 بكسل — يمنع صفاً عمودياً مملاً للقلوب.
        driftX: (Math.random() - 0.5) * 42,
        // القلب i يبدأ بعد i * stagger — تسلسل زمني «ورا بعض».
        delay: i * WISHLIST_HEART_BURST_STAGGER_SEC,
      }),
    );
    // نُبقي الجزيئات القديمة لو لم تنتهِ بعد (ضغطات متلاحقة) ونضيف الدفعة الجديدة.
    setParticles((prev) => [...prev, ...next]);
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        type="button"
        variant="subtle"
        size="md"
        aria-label={pressed ? labels.remove : labels.add}
        aria-pressed={pressed}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          spawnBurst(); // أولاً التأثير البصري…
          onPress?.(); // …ثم منطق المفضلة في الأب (تبديل الحالة).
        }}
        className="shrink-0 rounded-full border border-slate-200/90 bg-white/95 shadow-md shadow-slate-900/10 ring-1 ring-slate-900/[0.05] backdrop-blur-sm hover:bg-white"
      >
        <HeartIcon filled={pressed} />
      </IconButton>
      {/* يقرأ particles ويرسم البورتال؛ onRemove يصفّر الجزيء من الحالة بعد انتهاء الأنيميشن. */}
      <WishlistHeartBurstPortal particles={particles} onRemove={removeParticle} />
    </>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      {filled ? (
        <path
          fill="currentColor"
          d="M12 21s-7-4.35-9.33-8.15A5.65 5.65 0 0112 5a5.65 5.65 0 019.33 7.85C19 16.65 12 21 12 21z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          d="M12 21s-7-4.35-9.33-8.15A5.65 5.65 0 0112 5a5.65 5.65 0 019.33 7.85C19 16.65 12 21 12 21z"
        />
      )}
    </svg>
  );
}
