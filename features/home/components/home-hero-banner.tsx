"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slides.length < 2 || autoplayMs <= 0) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const measureStep = () => {
      const first = scroller.firstElementChild as HTMLElement | null;
      const second = scroller.children[1] as HTMLElement | null;
      if (!first) return 0;
      if (second) return second.offsetLeft - first.offsetLeft;
      return first.clientWidth;
    };

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      const step = measureStep();
      if (!step) return;
      const next = (indexRef.current + 1) % slides.length;
      indexRef.current = next;
      scroller.scrollTo({ left: next * step, behavior: "smooth" });
    }, autoplayMs);

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };
    const onScroll = () => {
      const step = measureStep();
      if (!step) return;
      indexRef.current = Math.round(scroller.scrollLeft / step);
    };

    scroller.addEventListener("mouseenter", pause);
    scroller.addEventListener("mouseleave", resume);
    scroller.addEventListener("touchstart", pause, { passive: true });
    scroller.addEventListener("touchend", resume, { passive: true });
    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearInterval(timer);
      scroller.removeEventListener("mouseenter", pause);
      scroller.removeEventListener("mouseleave", resume);
      scroller.removeEventListener("touchstart", pause);
      scroller.removeEventListener("touchend", resume);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [slides.length, autoplayMs]);

  if (!slides.length) return null;

  return (
    <section className={cn("-mx-4 sm:mx-0", className)}>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[calc((100vw-330px)/2)] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
    <div className="relative h-[540px] w-[330px] shrink-0 snap-center overflow-hidden rounded-2xl bg-image-well">
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
