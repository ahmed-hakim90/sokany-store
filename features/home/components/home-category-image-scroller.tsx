"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef } from "react";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type HomeCategoryTile = {
  imageSrc: string;
  imageAlt?: string;
  href?: string;
};

export type HomeCategoryImageScrollerProps = {
  tiles: HomeCategoryTile[];
  className?: string;
  /** Auto-rotate interval in ms; pass 0 to disable. */
  autoplayMs?: number;
};

export function HomeCategoryImageScroller({
  tiles,
  className,
  autoplayMs = 3000,
}: HomeCategoryImageScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || tiles.length < 2 || autoplayMs <= 0) return;

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
      const next = (indexRef.current + 1) % tiles.length;
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
  }, [tiles.length, autoplayMs]);

  if (!tiles.length) return null;

  return (
    <section className={cn("-mx-4 sm:mx-0", className)}>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[calc((100vw-240px)/2)] px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-0"
      >
        {tiles.map((tile, index) => (
          <CategoryImageCard
            key={`${tile.imageSrc}-${index}`}
            tile={tile}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryImageCard({ tile }: { tile: HomeCategoryTile }) {
  const content = (
    <div className="relative h-[120px] w-[240px] shrink-0 snap-center overflow-hidden rounded-xl bg-image-well shadow-sm ring-1 ring-black/[0.07]">
      <AppImage
        src={tile.imageSrc}
        alt={tile.imageAlt ?? ""}
        fill
        sizes="240px"
        className="object-cover"
      />
    </div>
  );

  if (!tile.href) return content;

  return (
    <Link
      href={tile.href}
      className="block transition-opacity hover:opacity-95 focus-visible:opacity-95"
    >
      {content}
    </Link>
  );
}
