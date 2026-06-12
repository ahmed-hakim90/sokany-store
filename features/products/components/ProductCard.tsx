"use client";

/**
 * بطاقة منتج — حاوية واحدة (صورة + شارة الوكيل + عنوان + سعر + سلة).
 *
 * التخطيط:
 * - موبايل (`mobileCompact`): ارتفاع صورة `clamp(170px, 48vw, 200px)`؛ شارة الوكيل تتداخل حد الصورة.
 * - ديسكتوب (`desktopCatalog*`): صورة `190–220px`؛ عرض أقصى ~280px عبر خلية الشبكة.
 * - ديسكتوب: رفع خفيف + معاينة سريعة عند الهوفر فقط.
 */
import dynamic from "next/dynamic";
import { BadgeCheck, Box, Check, CirclePlay, ShoppingCart } from "lucide-react";
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
import { QtyControl } from "@/components/ui/qty-control";
import { cn } from "@/lib/utils";
import { usePointerSwipe } from "@/hooks/usePointerSwipe";
import {
  PRODUCT_CARD_SHOW_QUICK_VIEW,
  PRODUCT_CARD_SHOW_SALES_COUNT,
  ROUTES,
} from "@/lib/constants";
import { getProductCardDisplayTitle } from "@/features/products/lib/product-card-display-title";
import { getProductCardSalesCountText } from "@/features/products/lib/product-card-sales-count";
import { getProductVideoEmbed } from "@/features/products/lib/product-merchandising";
import { playCartFlyAnimation } from "@/lib/cart-fly-animation";
import { getStaticProduct3DModelBySku } from "@/lib/product-3d-map";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { usePrefetchProduct } from "@/features/products/hooks/usePrefetchProduct";
import type { HeartParticle } from "@/features/products/components/wishlist-heart-burst";
import { ProductRatingDisplay } from "@/features/products/components/product-rating-display";
import { useProductMerchandising } from "@/features/products/components/product-merchandising-context";
import { ProductStatusBadge } from "@/features/products/components/product-status-badge";
import type { Product } from "@/features/products/types";

const ProductQuickViewModal = dynamic(
  () =>
    import("@/features/products/components/product-quick-view-modal").then(
      (m) => m.ProductQuickViewModal,
    ),
  { ssr: false, loading: () => null },
);

const WishlistHeartBurstPortal = dynamic(
  () =>
    import("@/features/products/components/wishlist-heart-burst").then(
      (m) => m.WishlistHeartBurstPortal,
    ),
  { ssr: false, loading: () => null },
);

const WISHLIST_HEART_BURST_COUNT = 10;
const WISHLIST_HEART_BURST_STAGGER_SEC = 0.072;

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
  /** Disable swipe/pointer image switching for dense home grids. @default true */
  imageInteractions?: boolean;
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

const catalogBodyClassName =
  "flex min-h-0 flex-1 flex-col gap-1 px-2.5 pb-2 pt-1.5 sm:px-3 sm:pb-2.5 sm:pt-1.5";

const catalogTitleClassName =
  "line-clamp-2 min-h-[2.25rem] text-[0.8125rem] font-semibold leading-[1.25] text-foreground sm:text-product-title sm:font-bold sm:leading-[1.22]";

const variantLayout: Record<
  ProductCardVariant,
  { card: string; body: string; title: string; image: string }
> = {
  mobileCompact: {
    card: "min-w-0 gap-0 overflow-hidden p-0",
    body: catalogBodyClassName,
    title: catalogTitleClassName,
    image:
      "relative z-[2] h-[clamp(180px,52vw,216px)] w-full shrink-0 overflow-visible",
  },
  desktopCatalog: {
    card: "min-w-0 gap-0 overflow-hidden p-0",
    body: catalogBodyClassName,
    title: catalogTitleClassName,
    image:
      "relative z-[2] h-[200px] w-full shrink-0 overflow-visible sm:h-[210px] lg:h-[220px] xl:h-[232px]",
  },
  desktopCatalogWide: {
    card: "min-w-0 gap-0 overflow-hidden p-0",
    body: catalogBodyClassName,
    title: catalogTitleClassName,
    image:
      "relative z-[2] h-[200px] w-full shrink-0 overflow-visible sm:h-[210px] lg:h-[220px] xl:h-[232px]",
  },
  featured: {
    card: "min-w-0 gap-0 overflow-hidden p-0",
    body: catalogBodyClassName,
    title: catalogTitleClassName,
    image:
      "relative z-[2] h-[200px] w-full shrink-0 overflow-visible sm:h-[214px] lg:h-[228px]",
  },
  detailed: {
    card: "min-w-0 overflow-hidden p-0",
    body: "gap-1.5 px-2 pb-1.5 pt-1.5 sm:px-3 sm:pb-2 sm:pt-2",
    title:
      "line-clamp-2 min-h-[2.5rem] text-base font-bold leading-tight text-foreground sm:text-lg",
    image: "relative z-[2] aspect-square w-full shrink-0 overflow-visible",
  },
};

type CardSlide = { key: string; src: string; alt: string };

const productCardImageClassName =
  "product-card-image transition-transform duration-200 ease-out group-hover/card:scale-[1.03] group-active/card:scale-[0.98] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100";

const productCardSaleBadgeClassName =
  "pointer-events-none absolute start-2 top-2 z-[3] rounded-full bg-promo-sale-bg/95 px-2.5 py-1 text-[11px] font-bold leading-none text-promo-sale-fg shadow-sm sm:start-2.5 sm:top-2.5 sm:text-xs";

const productCardStatusBadgeClassName =
  "pointer-events-none absolute start-2 top-2 z-[3] bg-white/92 px-2.5 py-1 text-[11px] shadow-sm ring-1 ring-amber-300/40 backdrop-blur-sm sm:start-2.5 sm:top-2.5 sm:text-xs";

const productCardAddButtonBaseClassName =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 font-bold leading-none text-brand-400 shadow-[0_8px_18px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.08] transition-all duration-200 ease-out hover:bg-zinc-800 hover:text-brand-300 group-hover/card:scale-[1.01] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:grayscale-[20%] disabled:group-hover/card:scale-100";

function ProductCardAgentTag({ text }: { text: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex translate-y-1/2 justify-center px-2"
      aria-label={text}
    >
      <span className="inline-flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold leading-none text-slate-700 shadow-sm ring-1 ring-slate-200/90 sm:text-xs">
        <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-blue-500 text-white" aria-hidden />
        <span className="truncate">{text}</span>
      </span>
    </div>
  );
}

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
  imageInteractions = true,
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
    if (!imageMotion) return 0;
    if (simpleImageMode) return 200;
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
  const hasStatic3D = useMemo(
    () => getStaticProduct3DModelBySku(product.sku) !== null,
    [product.sku],
  );
  const showCatalogQuickView = PRODUCT_CARD_SHOW_QUICK_VIEW && !isDetailed;
  const showDetailedQuickView = PRODUCT_CARD_SHOW_QUICK_VIEW && isDetailed;
  const displayTitle = useMemo(
    () => getProductCardDisplayTitle(product.name),
    [product.name],
  );
  const handlePrefetch = () => {
    void prefetchProduct(product.id);
  };
  const lineQty = getCartLineQuantity?.(product.id) ?? 0;
  const showCartQty = Boolean(onCartLineQuantityChange);
  const cartLineUpdatingKey = useCartStore((state) => state.updatingLineKey);
  const isCartLineUpdating =
    showCartQty &&
    cartLineUpdatingKey === `${product.id}:0`;
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewEverOpened, setQuickViewEverOpened] = useState(false);
  useEffect(() => {
    if (quickViewOpen) setQuickViewEverOpened(true);
  }, [quickViewOpen]);
  const addButtonText = !product.inStock
    ? "نفد المخزون"
    : isCartLineUpdating
      ? "جاري الإضافة"
      : justAdded
        ? "تم"
        : "أضف للسلة";
  const addButtonAriaLabel = !product.inStock
    ? "المنتج غير متوفر — نفد المخزون"
    : isCartLineUpdating
      ? "جاري الإضافة للسلة"
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
  const enableImageInteractions = imageInteractions && multiImage;
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
    enabled: enableImageInteractions,
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
      if (!enableImageInteractions) return;
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
    [enableImageInteractions, multiImage, cardSlides.length],
  );

  const onCardImagePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      void prefetchProduct(product.id);
      if (e.pointerType === "mouse" && enableImageInteractions) {
        updateImageIndexFromCardPointerX(e);
      }
    },
    [prefetchProduct, product.id, enableImageInteractions, updateImageIndexFromCardPointerX],
  );

  const onCardImagePointerLeave = useCallback(() => {
    if (enableImageInteractions) setImageIndex(0);
  }, [enableImageInteractions]);

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
      : variant === "mobileCompact"
        ? "(max-width: 768px) 44vw, 11rem"
        : "(max-width: 1024px) 33vw, 17rem";

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
        !isDetailed && "text-center",
      )}
      title={product.name}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      {displayTitle}
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
        "font-display font-extrabold tracking-tight text-foreground",
        priceCompact
          ? "text-product-price leading-[var(--text-product-price--line-height)] sm:text-base"
          : "text-base md:text-lg",
        variant === "featured" && "text-lg",
      )}
      compareAtClassName="!text-ui-label !leading-[var(--text-ui-label--line-height)] !text-muted-foreground md:!text-xs"
      className={cn(
        "min-w-0 !flex-col !items-center !gap-0.5 !gap-x-0 text-center",
      )}
    />
  );

  return (
    <>
      <Card
        variant="product"
        onClick={handleCardClick}
        className={cn(
          "group/card surface-product-card relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden",
          "border border-black/[0.06] shadow-[0_8px_24px_-14px_rgba(15,23,42,0.22)]",
          "transition-[transform,box-shadow] duration-200 ease-out",
          "hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-20px_rgba(15,23,42,0.38)]",
          "active:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none",
          isDetailed ? "rounded-xl" : "rounded-xl",
          layout.card,
          className,
        )}
      >
        <div className={cn("relative", layout.image)}>
          <div ref={imageFlyRef} className="absolute inset-0 z-0 overflow-hidden bg-white">
            {crossfadeMs <= 0 ? (
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
            ) : (
              <ProductCardImageStack
                key={product.id}
                productId={product.id}
                activeSlide={activeSlide}
                crossfadeMs={crossfadeMs}
                prefersReducedMotion={prefersReducedMotion}
                imageSizes={imageSizes}
                imagePriority={imagePriority}
              />
            )}
          </div>
          {enableImageInteractions ? (
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
          {!product.inStock ? (
            <div
              className="pointer-events-none absolute inset-0 z-[2] bg-slate-950/40 backdrop-blur-[1px]"
              aria-hidden
            />
          ) : null}
          {!product.inStock ? (
            <span className="pointer-events-none absolute start-2 top-2 z-[3] rounded-full bg-red-600/90 px-2.5 py-1.5 text-[11px] font-bold leading-none text-white shadow-sm sm:start-2.5 sm:top-2.5 sm:text-xs">
              نفد المخزون
            </span>
          ) : !isDetailed && saleDiscount !== null ? (
            <span
              dir="ltr"
              className={productCardSaleBadgeClassName}
            >
              −{saleDiscount}%
            </span>
          ) : !isDetailed ? (
            <ProductStatusBadge
              product={product}
              className={productCardStatusBadgeClassName}
            />
          ) : saleDiscount !== null ? (
            <span
              dir="ltr"
              className={productCardSaleBadgeClassName}
            >
              −{saleDiscount}%
            </span>
          ) : isDetailed && product.featured ? (
            <span className="pointer-events-none absolute left-2 top-2 z-[3] rounded-full bg-slate-950 px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">
              مميز
            </span>
          ) : null}
          {!isDetailed && merchandising.productCardBadgeEnabled ? (
            <ProductCardAgentTag text={merchandising.productCardBadgeText} />
          ) : null}
          {wishlistSlot ? (
            <div className="absolute end-2 top-2 z-[4] sm:end-2.5 sm:top-2.5 [&_button]:h-9 [&_button]:w-9 [&_button]:min-h-9 [&_button]:min-w-9 lg:[&_button]:h-10 lg:[&_button]:w-10 lg:[&_button]:min-h-10 lg:[&_button]:min-w-10">
              {wishlistSlot}
            </div>
          ) : null}
          {hasStatic3D ? (
            <span
              className={cn(
                "pointer-events-none absolute z-[4] inline-flex items-center gap-1 rounded-full border border-white/70 bg-slate-950/88 px-2 py-1 text-[11px] font-extrabold leading-none text-white shadow-md sm:text-xs",
                wishlistSlot ? "right-2 top-10" : "right-2 top-2",
              )}
              aria-label="عرض ثلاثي الأبعاد"
            >
              <Box className="h-3.5 w-3.5 shrink-0 text-brand-300" aria-hidden />
              <span>360°</span>
            </span>
          ) : null}
          {hasProductVideo ? (
            <span
              className={cn(
                "pointer-events-none absolute z-[4] inline-flex items-center gap-1 rounded-full border border-white/70 bg-slate-950/88 px-2 py-1 text-[11px] font-extrabold leading-none text-white shadow-md shadow-slate-900/20 backdrop-blur-sm sm:text-xs",
                isDetailed
                  ? wishlistSlot
                    ? "bottom-2 right-2"
                    : "right-2 top-2"
                  : merchandising.productCardBadgeEnabled
                    ? "bottom-[1.75rem] left-2"   /* فوق agent tag اللي بيطلع من أسفل الصورة */
                    : "bottom-2 left-2",
              )}
              aria-label="هذا المنتج له فيديو"
            >
              <CirclePlay className="h-3.5 w-3.5 shrink-0 text-brand-300" aria-hidden />
              <span>فيديو</span>
            </span>
          ) : null}
          {showCatalogQuickView || showDetailedQuickView ? (
            <>
              {/* معاينة سريعة — ديسكتوب: يظهر مع الـ hover */}
              <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition-opacity duration-200 lg:flex lg:flex-col lg:items-center lg:justify-center lg:group-hover/card:opacity-100">
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
              {showDetailedQuickView && !showCartQty ? (
                <div className="absolute bottom-2 left-2 z-[4] flex lg:hidden">
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
            "relative flex min-w-0 flex-1 flex-col",
            layout.body,
            !isDetailed && "z-[1] bg-white",
            !isDetailed &&
              merchandising.productCardBadgeEnabled &&
              "pt-3.5 sm:pt-4",
          )}
        >
          {isDetailed && !product.inStock ? (
            <span className="text-[11px] font-semibold text-red-600 sm:text-xs">
              نفد المخزون حالياً
            </span>
          ) : null}
          {titleLink}
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
                "mt-0.5 text-[11px] font-medium text-muted-foreground",
                "sm:text-xs",
              )}
            >
              {salesCountLine}
            </p>
          ) : null}
          <div
            className={cn(
              "mt-auto",
              showCartQty ? "pt-0.5" : cn("pt-0.5", isDetailed ? "min-h-[3.25rem]" : "min-h-[2.75rem]"),
            )}
          >
            {showCartQty ? (
              <div
                className={cn(
                  "grid w-full min-w-0 items-center gap-1 sm:gap-1.5 lg:gap-2",
                  isDetailed ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1",
                )}
              >
                <div className="flex min-w-0 justify-center">
                  {priceBlock}
                </div>
                {lineQty > 0 ? (
                  <QtyControl
                    value={lineQty}
                    min={0}
                    max={999}
                    compact
                    layout="segmented"
                    equalSegments
                    className={cn(
                      "w-full max-w-none justify-self-end",
                      !isDetailed && "h-8 sm:h-8",
                    )}
                    disabled={!product.inStock}
                    onChange={(next) => {
                      onCartLineQuantityChange?.(product, next);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    disabled={!product.inStock || isCartLineUpdating}
                    aria-busy={isCartLineUpdating}
                    aria-label={addButtonAriaLabel}
                    className={cn(
                      productCardAddButtonBaseClassName,
                      justAdded && "border-emerald-600/40 bg-emerald-50 text-emerald-900",
                      isDetailed
                        ? "h-8 px-2.5 text-[11px] sm:px-4 sm:text-xs"
                        : "h-8 w-full px-3 text-[11px] sm:h-8 sm:text-xs",
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                  >
                    {isCartLineUpdating ? (
                      <span
                        className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden
                      />
                    ) : (
                      <MiniCartIcon checked={justAdded} />
                    )}
                    {addButtonText}
                  </button>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "min-h-0 min-w-0 flex-1",
                  "flex justify-center",
                )}
              >
                {priceBlock}
              </div>
            )}
          </div>
        </div>
      </Card>

      {(showCatalogQuickView || showDetailedQuickView) &&
      (quickViewOpen || quickViewEverOpened) ? (
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
      <Check className="h-4 w-4 shrink-0" aria-hidden />
    );
  }

  return <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />;
}

/**
 * زر المفضلة على الكارت (فوق الصورة أو فوق «أضف للسلة» حسب التمرير) + منطق إطلاق قلوب طائرة (wishlist-heart-burst.tsx).
 */
export function ProductCardWishlistIconButton({
  pressed,
  onPress,
  labels = { add: "أضف إلى المفضلة", remove: "إزالة من المفضلة" },
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
        className={cn(
          "shrink-0 rounded-full border shadow-md ring-1 backdrop-blur-sm transition-colors",
          pressed
            ? "border-brand-500/50 bg-brand-50 text-brand-800 shadow-brand-500/15 ring-brand-500/20 hover:bg-brand-100"
            : "border-slate-200/90 bg-white/95 text-slate-700 shadow-slate-900/10 ring-slate-900/[0.05] hover:bg-white",
        )}
      >
        <HeartIcon filled={pressed} />
      </IconButton>
      {/* يقرأ particles ويرسم البورتال؛ onRemove يصفّر الجزيء من الحالة بعد انتهاء الأنيميشن. */}
      {particles.length > 0 ? (
        <WishlistHeartBurstPortal particles={particles} onRemove={removeParticle} />
      ) : null}
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
