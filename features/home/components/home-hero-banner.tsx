"use client";

import { Link } from "next-view-transitions";
import { useCallback, useEffect, useRef } from "react";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

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
};

export function HomeHeroBanner({
  slides,
  className,
  autoplayMs = 3000,
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
        {slides.map((slide, index) => (
          <HeroImageCard
            key={`${slide.imageSrc}-${index}`}
            slide={slide}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

function HeroImageCard({
  slide,
  priority,
}: {
  slide: HomeHeroSlide;
  priority?: boolean;
}) {
  const content = (
    <div className="relative h-[min(400px,70dvh)] w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl bg-image-well shadow-sm ring-1 ring-black/[0.06]">
      <AppImage
        src={slide.imageSrc}
        alt={slide.imageAlt ?? ""}
        fill
        sizes="330px"
        className="object-cover"
        priority={priority}
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
