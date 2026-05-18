"use client";

import { Link } from "next-view-transitions";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";
import { scheduleIdleCallback } from "@/lib/schedule-idle-callback";

const DEFAULT_HERO_IMAGE_ALT = "قلاية هوائية سوكاني";
/** يطابق بداية ‎`ROUTES.CATEGORY(slug)`‎ لكل ‎`slug`‎ غير فارغ. */
const CATEGORY_HREF_PREFIX = "/categories/";

/** Horizontal scroll only on `scroller` — avoids `scrollIntoView` moving the page (RTL-safe). */
function scrollHeroSlideIntoCenter(
  scroller: HTMLElement,
  child: HTMLElement,
  behavior: ScrollBehavior,
) {
  const s = scroller.getBoundingClientRect();
  const c = child.getBoundingClientRect();
  const deltaX = c.left + c.width / 2 - (s.left + s.width / 2);
  if (Math.abs(deltaX) < 0.5) return;
  scroller.scrollBy({ left: deltaX, behavior });
}

export type HomeHeroSlide = {
  imageSrc: string;
  imageAlt?: string;
  href?: string;
};

export type HomeHeroBannerVariant = "carousel" | "featured";

export type HomeHeroBannerProps = {
  slides: HomeHeroSlide[];
  className?: string;
  /** Auto-rotate interval in ms; pass 0 to disable. */
  autoplayMs?: number;
  /** من الخادم: ‎`slug`‎ → اسم التصنيف لربط ‎`slide.href`‎ بـ ‎`/categories/:slug`‎. */
  categoryNamesBySlug?: Record<string, string>;
  /**
   * ‎`featured`‎: بانر كبير على ‎`lg`‎ + سلايدر أفقي على الموبايل (يُستخدم من ‎`HomeHeroLayout`‎).
   * @default "carousel"
   */
  variant?: HomeHeroBannerVariant;
};

function slugFromCategoryHref(href: string | undefined): string | undefined {
  const h = href?.trim();
  if (!h) return undefined;
  try {
    const path = h.startsWith("http") ? new URL(h).pathname : h;
    if (!path.startsWith(CATEGORY_HREF_PREFIX)) return undefined;
    const rest = path.slice(CATEGORY_HREF_PREFIX.length).replace(/\/$/, "");
    const segment = rest.split("/")[0];
    return segment || undefined;
  } catch {
    return undefined;
  }
}

/**
 * نص بديل قصير — بدون هاشتاجات/شرائط طويلة؛ يفضّل اسم التصنيف عند ربط الشريحة بقسم.
 */
function heroSlideAlt(
  slide: HomeHeroSlide,
  categoryNamesBySlug?: Record<string, string>,
): string {
  const slug = slugFromCategoryHref(slide.href);
  if (slug && categoryNamesBySlug) {
    const name = categoryNamesBySlug[slug]?.trim();
    if (name) return name;
  }

  const raw = slide.imageAlt?.replace(/\s+/g, " ").trim() ?? "";
  const cleaned = raw
    .replace(/#[^\s#]+/g, " ")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 6);
  let out = words.join(" ");
  const maxChars = 45;
  if (out.length > maxChars) {
    out = `${out.slice(0, maxChars - 1)}…`;
  }
  if (out) return out;
  return DEFAULT_HERO_IMAGE_ALT;
}

export function HomeHeroBanner({
  slides,
  className,
  autoplayMs = 3000,
  categoryNamesBySlug,
  variant = "carousel",
}: HomeHeroBannerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  const measureStep = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return 0;
    const first = scroller.firstElementChild as HTMLElement | null;
    const second = scroller.children[1] as HTMLElement | null;
    if (!first) return 0;
    if (second) return Math.abs(second.offsetLeft - first.offsetLeft);
    return first.clientWidth;
  }, []);

  /** Observe which slide is most visible (works in RTL without relying on scrollLeft). */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slides.length < 2) return;

    const slideEls = Array.from(scroller.children) as HTMLElement[];
    const ratios = new Array(slideEls.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = slideEls.indexOf(e.target as HTMLElement);
          if (idx >= 0) ratios[idx] = e.intersectionRatio;
        }
        let bestIdx = 0;
        let bestRatio = 0;
        ratios.forEach((r, i) => {
          if (r > bestRatio) {
            bestRatio = r;
            bestIdx = i;
          }
        });
        if (bestRatio > 0.15) {
          indexRef.current = bestIdx;
        }
      },
      { root: scroller, rootMargin: "0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of slideEls) observer.observe(el);

    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slides.length < 2 || autoplayMs <= 0) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const step = () => measureStep();

    let intervalId: number | undefined;

    const startTick = () => {
      if (intervalId !== undefined || document.hidden) return;
      intervalId = window.setInterval(() => {
        if (pausedRef.current) return;
        const s = step();
        if (!s) return;
        const next = (indexRef.current + 1) % slides.length;
        indexRef.current = next;
        const child = scroller.children[next] as HTMLElement | undefined;
        if (child) {
          scrollHeroSlideIntoCenter(scroller, child, "smooth");
        } else {
          scroller.scrollTo({ left: next * s, behavior: "smooth" });
        }
      }, autoplayMs);
    };

    const stopTick = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stopTick();
      else startTick();
    };

    const cancelIdle = scheduleIdleCallback(() => {
      if (!document.hidden) startTick();
    }, { timeout: 3500 });

    document.addEventListener("visibilitychange", onVisibility);

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };

    scroller.addEventListener("mouseenter", pause);
    scroller.addEventListener("mouseleave", resume);
    scroller.addEventListener("touchstart", pause, { passive: true });
    scroller.addEventListener("touchend", resume, { passive: true });

    return () => {
      cancelIdle();
      stopTick();
      document.removeEventListener("visibilitychange", onVisibility);
      scroller.removeEventListener("mouseenter", pause);
      scroller.removeEventListener("mouseleave", resume);
      scroller.removeEventListener("touchstart", pause);
      scroller.removeEventListener("touchend", resume);
    };
  }, [slides.length, autoplayMs, measureStep]);

  if (!slides.length) return null;

  const carousel = (
    <div
      ref={scrollerRef}
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[calc((100vw-330px)/2)] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {slides.map((slide, index) => (
        <HeroImageCard
          key={`${slide.imageSrc}-${index}`}
          slide={slide}
          categoryNamesBySlug={categoryNamesBySlug}
          priority={index === 0}
          fetchPriority={index === 0 ? "high" : "low"}
          layout="carousel"
        />
      ))}
    </div>
  );

  if (variant === "featured") {
    return (
      <section className={cn("-mx-4 sm:mx-0", className)} aria-label="شرائح العروض الرئيسية">
        <div className="lg:hidden">{carousel}</div>
        <FeaturedHeroDesktop
          slides={slides}
          categoryNamesBySlug={categoryNamesBySlug}
          autoplayMs={autoplayMs}
          className="hidden lg:block"
        />
      </section>
    );
  }

  return (
    <section className={cn("-mx-4 sm:mx-0", className)} aria-label="شرائح العروض الرئيسية">
      {carousel}
    </section>
  );
}

function FeaturedHeroDesktop({
  slides,
  categoryNamesBySlug,
  autoplayMs,
  className,
}: {
  slides: HomeHeroSlide[];
  categoryNamesBySlug?: Record<string, string>;
  autoplayMs: number;
  className?: string;
}) {
  const featuredIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || autoplayMs <= 0) return;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      const next = (featuredIndexRef.current + 1) % slides.length;
      featuredIndexRef.current = next;
      setActiveIndex(next);
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [slides.length, autoplayMs]);

  const slide = slides[activeIndex] ?? slides[0];

  return (
    <div className={cn("relative min-w-0", className)}>
      <HeroImageCard
        slide={slide}
        categoryNamesBySlug={categoryNamesBySlug}
        priority
        fetchPriority="high"
        layout="featured"
      />
      {slides.length > 1 ? (
        <div
          className="absolute bottom-3 start-1/2 z-[2] flex -translate-x-1/2 gap-1.5 rtl:translate-x-1/2"
          role="tablist"
          aria-label="شرائح العروض"
        >
          {slides.map((s, i) => (
            <button
              key={`${s.imageSrc}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`شريحة ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/55",
              )}
              onClick={() => {
                featuredIndexRef.current = i;
                setActiveIndex(i);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeroImageCard({
  slide,
  categoryNamesBySlug,
  priority,
  fetchPriority,
  layout = "carousel",
}: {
  slide: HomeHeroSlide;
  categoryNamesBySlug?: Record<string, string>;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  layout?: "carousel" | "featured";
}) {
  const frameClass =
    layout === "featured"
      ? "relative aspect-[2.35/1] min-h-[17.5rem] w-full max-h-[26rem] overflow-hidden rounded-2xl bg-image-well shadow-sm ring-1 ring-black/[0.06]"
      : "relative h-[25rem] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl bg-image-well shadow-sm ring-1 ring-black/[0.06]";

  const content = (
    <div className={frameClass}>
      <AppImage
        src={slide.imageSrc}
        alt={heroSlideAlt(slide, categoryNamesBySlug)}
        fill
        sizes={layout === "featured" ? "(min-width: 1024px) 70vw, 300px" : "300px"}
        className="object-cover"
        priority={priority}
        fetchPriority={fetchPriority}
        quality={priority ? 74 : 70}
      />
    </div>
  );

  if (!slide.href) return content;

  return (
    <Link
      href={slide.href}
      className="block transition-opacity hover:opacity-95 focus-visible:opacity-95"
    >
      {content}
    </Link>
  );
}
