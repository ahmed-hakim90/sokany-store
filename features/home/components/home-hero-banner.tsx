"use client";

import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/pagination";

export type HomeHeroSlide = {
  title: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export type HomeHeroBannerProps = {
  slides: HomeHeroSlide[];
  /** Tighter vertical rhythm on small screens (home reference). */
  compact?: boolean;
  className?: string;
};

export function HomeHeroBanner({
  slides,
  compact,
  className,
}: HomeHeroBannerProps) {
  if (!slides.length) return null;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-brand-950 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.25)]",
        className,
      )}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={slides.length > 1}
        autoplay={
          slides.length > 1
            ? { delay: 5000, disableOnInteraction: false }
            : false
        }
        pagination={{ clickable: true }}
        className={cn(
          "hero-swiper w-full",
          compact
            ? "min-h-[118px] sm:min-h-[148px] md:min-h-[190px]"
            : "min-h-[150px] sm:min-h-[170px] md:min-h-[200px]",
        )}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.primaryHref}-${index}`} className="!h-auto">
            <HeroSlideContent
              slide={slide}
              compact={compact}
              priority={index === 0}
              titleLevel={index === 0 ? "h1" : "h2"}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

function HeroSlideContent({
  slide,
  compact,
  priority,
  titleLevel,
}: {
  slide: HomeHeroSlide;
  compact?: boolean;
  priority?: boolean;
  titleLevel: "h1" | "h2";
}) {
  const imageSrc = slide.imageSrc ?? "/images/hero-banner.jpg";
  const TitleTag = titleLevel;

  return (
    <div
      className={cn(
        "relative w-full",
        compact
          ? "min-h-[118px] sm:min-h-[148px] md:min-h-[190px]"
          : "min-h-[150px] sm:min-h-[170px] md:min-h-[200px]",
      )}
    >
      <AppImage
        src={imageSrc}
        alt={slide.imageAlt ?? ""}
        fill
        sizes="100vw"
        className="object-cover opacity-90"
        priority={priority}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/78 via-black/5 to-black/20" />
      <div
        className={cn(
          "relative flex flex-col justify-center",
          compact
            ? "min-h-[118px] px-4 py-4 sm:min-h-[148px] sm:px-7 sm:py-5 md:min-h-[190px] md:px-10"
            : "min-h-[150px] px-5 py-6 sm:min-h-[170px] sm:px-8 md:min-h-[200px] md:px-10",
        )}
      >
        <TitleTag
          className={cn(
            "max-w-[16rem] font-display font-bold leading-[1.15] tracking-tight text-white sm:max-w-lg",
            compact ? "text-xl sm:text-2xl md:text-3xl" : "text-2xl sm:text-3xl md:text-4xl",
          )}
        >
          {slide.title}
        </TitleTag>
        <p
          className={cn(
            "mt-1 max-w-full text-pretty break-words text-white/88 sm:mt-2 sm:max-w-md",
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base",
          )}
        >
          {slide.subtitle}
        </p>
        <div className={cn("flex flex-wrap gap-2.5", compact ? "mt-3 sm:mt-4" : "mt-4")}>
          <Link
            href={slide.primaryHref}
            className={cn(
              "inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-semibold text-black shadow-md transition-colors hover:bg-brand-400",
              compact ? "h-9 sm:h-10 sm:px-5" : "h-10 sm:h-12 sm:px-6 sm:text-base",
            )}
          >
            {slide.primaryLabel}
          </Link>
          {slide.secondaryHref && slide.secondaryLabel ? (
            <Link
              href={slide.secondaryHref}
              className="inline-flex h-9 items-center justify-center rounded-md border border-white/40 bg-white/95 px-4 text-sm font-medium text-brand-950 transition-colors hover:bg-white sm:h-10 sm:px-5 sm:text-base"
            >
              {slide.secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
