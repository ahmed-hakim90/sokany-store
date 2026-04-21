"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { cn } from "@/lib/utils";
import { usePointerSwipe } from "@/hooks/usePointerSwipe";
import { ROUTES } from "@/lib/constants";
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
import { ProductStatusBadge } from "@/features/products/components/product-status-badge";
import type { Product } from "@/features/products/types";

export type ProductCardVariant =
  | "mobileCompact"
  | "desktopCatalog"
  | "desktopCatalogWide"
  | "featured";

export type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
  /** First visible grid cells: pass `true` for LCP-friendly image loading. */
  imagePriority?: boolean;
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
  { card: string; body: string; title: string }
> = {
  mobileCompact: {
    card: "overflow-hidden p-0",
    body: "gap-2 p-2.5 sm:p-3",
    title: "line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-snug text-neutral-950",
  },
  desktopCatalog: {
    card: "overflow-hidden p-0",
    body: "gap-2 p-3 sm:p-3.5",
    title: "line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-neutral-950",
  },
  desktopCatalogWide: {
    card: "overflow-hidden p-0",
    body: "gap-2 p-3 sm:p-3.5",
    title: "line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-neutral-950",
  },
  featured: {
    card: "overflow-hidden p-0",
    body: "gap-2 p-3 sm:gap-2 sm:p-4",
    title: "line-clamp-2 min-h-[3rem] text-sm font-bold leading-snug text-neutral-950 sm:text-base",
  },
};

export function ProductCard({
  product,
  variant = "desktopCatalog",
  imagePriority = false,
  getCartLineQuantity,
  onCartLineQuantityChange,
  wishlistSlot,
  className,
}: ProductCardProps) {
  const router = useRouter();
  const prefetchProduct = usePrefetchProduct();
  const imageFlyRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const addFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layout = variantLayout[variant];
  const compareAt =
    product.onSale && product.regularPrice > product.price
      ? product.regularPrice
      : null;
  const priceCompact = variant === "mobileCompact";
  const saleDiscount = saleDiscountPercent(product);
  const handlePrefetch = () => {
    void prefetchProduct(product.id);
  };
  const lineQty = getCartLineQuantity?.(product.id) ?? 0;
  const showCartQty = Boolean(onCartLineQuantityChange);
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const cardSlides = useMemo(() => {
    if (product.images.length > 0) {
      return product.images.map((img) => ({
        key: String(img.id),
        src: img.src,
        alt: img.alt || product.name,
      }));
    }
    return [{ key: "thumb", src: product.thumbnail, alt: product.name }];
  }, [product]);

  const [imageIndex, setImageIndex] = useState(0);
  const multiImage = cardSlides.length > 1;
  const activeSlide = cardSlides[imageIndex] ?? cardSlides[0];

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

  /** تبديل تلقائي للصور في الكارت — يُوقف مع «تقليل الحركة» وعند إخفاء التبويب. */
  useEffect(() => {
    if (!multiImage || reduceMotion) return;
    const intervalMs = 5000;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      goImgNext();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [multiImage, reduceMotion, goImgNext]);

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
      prefersReducedMotion: Boolean(reduceMotion),
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
    variant === "mobileCompact"
      ? "(max-width: 768px) 42vw, 11rem"
      : "(max-width: 768px) 50vw, 25vw";

  const titleLink = (
    <Link
      href={ROUTES.PRODUCT(product.id)}
      className={cn(
        "block text-foreground transition-colors hover:text-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        layout.title,
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
        "font-bold text-neutral-950",
        priceCompact ? "text-sm" : "text-base md:text-lg",
        variant === "featured" && !priceCompact && "text-lg md:text-xl",
      )}
      compareAtClassName="!text-xs !text-neutral-400 md:!text-xs"
      className="min-w-0 !flex-col !items-start !gap-0.5 !gap-x-0"
    />
  );

  return (
    <>
      <Card
        variant="product"
        className={cn(
          "group/card flex h-full min-w-0 flex-col rounded-xl border-black/[0.06] transition-shadow duration-300 hover:shadow-[0_14px_44px_-14px_rgba(15,23,42,0.18)] motion-reduce:transition-none",
          layout.card,
          className,
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-white">
          <div ref={imageFlyRef} className="absolute inset-0 z-0">
            {reduceMotion ? (
              <AppImage
                src={activeSlide.src}
                alt={activeSlide.alt}
                fill
                sizes={imageSizes}
                priority={imagePriority}
                className="object-contain object-center"
              />
            ) : (
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={`${product.id}-${activeSlide.key}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.32,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <AppImage
                    src={activeSlide.src}
                    alt={activeSlide.alt}
                    fill
                    sizes={imageSizes}
                    priority={imagePriority}
                    className="object-contain object-center"
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          {multiImage ? (
            <div
              className="absolute inset-0 z-[1] touch-none select-none"
              aria-hidden
              onPointerEnter={handlePrefetch}
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
          {product.featured ? (
            <span className="pointer-events-none absolute left-2 top-2 z-[3] rounded-md bg-sky-700 px-2 py-1 text-[10px] font-bold leading-none text-white shadow-sm">
              مميز
            </span>
          ) : null}
          {saleDiscount !== null ? (
            <span
              dir="ltr"
              className="pointer-events-none absolute right-2 top-2 z-[3] rounded-md bg-[#c45c5c] px-2 py-1 text-[11px] font-extrabold leading-none text-white shadow-sm sm:text-xs"
            >
              −{saleDiscount}%
            </span>
          ) : null}
          {/* المفضلة على الصورة فقط عندما لا يظهر زر السلة في أسفل الكارت */}
          {wishlistSlot && !showCartQty ? (
            <div className="absolute bottom-2 z-[4] left-auto right-2 md:left-2 md:right-auto">
              {wishlistSlot}
            </div>
          ) : null}

          {/* معاينة سريعة — ديسكتوب: يظهر مع الـ hover؛ باقي المساحة تبقى قابلة للنقر للانتقال لصفحة المنتج */}
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

          {/* معاينة سريعة — موبايل: زر صغير دائم يسار (المفضلة يمين على الموبايل لتفادي التداخل) */}
          <div className="absolute bottom-2 left-2 z-[4] flex md:hidden">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-sm"
            >
              <EyeIcon className="h-3.5 w-3.5" />
              <span>معاينة</span>
            </button>
          </div>
        </div>

        <div className={cn("relative flex flex-1 flex-col", layout.body)}>
          {!product.inStock ? (
            <span className="text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
              غير متوفر حالياً
            </span>
          ) : null}
          {titleLink}
          <ProductRatingDisplay
            rating={product.rating}
            ratingCount={product.ratingCount}
            size={variant === "mobileCompact" ? "xs" : "sm"}
            className="mt-1"
          />
          <ProductStatusBadge product={product} className="mt-1" />
          <div
            className={cn(
              "mt-auto flex pt-1",
              showCartQty
                ? cn(
                    "items-center justify-between gap-2 pe-1",
                    wishlistSlot ? "min-h-[4.75rem]" : "min-h-[3.25rem]",
                  )
                : "min-h-[3.25rem] items-end",
            )}
          >
            <div className="min-w-0 min-h-0 flex-1">{priceBlock}</div>
            {showCartQty ? (
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                {wishlistSlot ? (
                  <div className="flex w-14 justify-center">{wishlistSlot}</div>
                ) : null}
                <IconButton
                  type="button"
                  variant="accent"
                  size="md"
                  disabled={!product.inStock}
                  aria-label={justAdded ? "تمت الإضافة للسلة" : "أضف للسلة"}
                  className="h-11 min-h-[44px] min-w-14 w-14 shrink-0 rounded-lg shadow-sm [&_svg]:h-6 [&_svg]:w-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                >
                  <CartGlyph added={justAdded} />
                </IconButton>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

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

function CartGlyph({ added }: { added?: boolean }) {
  const iconClass = "h-6 w-6 shrink-0";
  if (added) {
    return (
      <svg viewBox="0 0 24 24" className={iconClass} aria-hidden>
        <path
          fill="currentColor"
          d="M9.55 17.65l-4.1-4.1 1.4-1.45 2.7 2.7 6.75-6.75 1.45 1.45-8.2 8.15z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path
        d="M3 4h2.2c.5 0 .93.33 1.06.81l.54 2.02m0 0L8 12h9.5a1 1 0 00.97-.76l1.2-4.8a.75.75 0 00-.73-.94H6.8z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18.2" r="1.35" fill="currentColor" />
      <circle cx="17" cy="18.2" r="1.35" fill="currentColor" />
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
  // من Framer: true إذا المستخدم يفضّل تقليل الحركة — لا نطلق جزيئات حتى لا نزعجه.
  const reduceMotion = useReducedMotion();
  // عداد يزيد دائماً — يضمن أن كل جزيء له key فريد حتى لو ضغط المستخدم بسرعة عدة مرات.
  const particleIdRef = useRef(0);
  // كل الجزيئات «الحية» حالياً؛ تُزال واحدة واحدة عند انتهاء أنيميشنها.
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  const spawnBurst = () => {
    if (reduceMotion) return;
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
        size="sm"
        aria-label={pressed ? labels.remove : labels.add}
        aria-pressed={pressed}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          spawnBurst(); // أولاً التأثير البصري…
          onPress?.(); // …ثم منطق المفضلة في الأب (تبديل الحالة).
        }}
        className="rounded-xl border border-white/60 bg-white/95 shadow-sm backdrop-blur-sm hover:bg-white"
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
