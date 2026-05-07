"use client";

import { Link } from "next-view-transitions";
import { useCallback, useEffect, useRef } from "react";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

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

export type HomeHeroBannerProps = {
  slides: HomeHeroSlide[];
  className?: string;
  /** Auto-rotate interval in ms; pass 0 to disable. */
  autoplayMs?: number;
  /** من الخادم: ‎`slug`‎ → اسم التصنيف لربط ‎`slide.href`‎ بـ ‎`/categories/:slug`‎. */
  categoryNamesBySlug?: Record<string, string>;
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
  let cleaned = raw
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

    const timer = window.setInterval(() => {
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
      window.clearInterval(timer);
      scroller.removeEventListener("mouseenter", pause);
      scroller.removeEventListener("mouseleave", resume);
      scroller.removeEventListener("touchstart", pause);
      scroller.removeEventListener("touchend", resume);
    };
  }, [slides.length, autoplayMs, measureStep]);

  if (!slides.length) return null;

  return (
    <section className={cn("-mx-4 sm:mx-0", className)} aria-label="شرائح العروض الرئيسية">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[calc((100vw-330px)/2)] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* شريحة واحدة فقط بـ priority — تقليل منافسة LCP مع البرومو والشعار */}
        {slides.map((slide, index) => (
          <HeroImageCard
            key={`${slide.imageSrc}-${index}`}
            slide={slide}
            categoryNamesBySlug={categoryNamesBySlug}
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "low"}
          />
        ))}
      </div>
    </section>
  );
}

function HeroImageCard({
  slide,
  categoryNamesBySlug,
  priority,
  fetchPriority,
}: {
  slide: HomeHeroSlide;
  categoryNamesBySlug?: Record<string, string>;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}) {
  // Hero cards use a fixed slide frame (300×400px); explicit box size limits CLS.
  const content = (
    <div className="relative h-[25rem] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl bg-image-well shadow-sm ring-1 ring-black/[0.06]">
      <AppImage
        src={slide.imageSrc}
        alt={heroSlideAlt(slide, categoryNamesBySlug)}
        fill
        sizes="330px"
        className="object-cover"
        priority={priority}
        fetchPriority={fetchPriority}
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
