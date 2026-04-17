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
  /** Substring of `title` to wrap with a lime highlight (desktop-style). */
  titleHighlight?: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** When true, secondary CTA opens `secondaryHref` in a new tab (e.g. external video). */
  secondaryOpenInNewTab?: boolean;
};

export type HomeHeroBannerProps = {
  slides: HomeHeroSlide[];
  /** Tighter vertical rhythm on small screens (home reference). */
  compact?: boolean;
  className?: string;
};

function TitleWithHighlight({
  text,
  highlight,
  className,
}: {
  text: string;
  highlight?: string;
  className?: string;
}) {
  if (!highlight || !text.includes(highlight)) {
    return <span className={className}>{text}</span>;
  }
  const [before, ...rest] = text.split(highlight);
  const after = rest.join(highlight);
  return (
    <span className={className}>
      {before}
      <span className="box-decoration-clone rounded-md bg-brand-500 px-1.5 py-0.5 text-black">
        {highlight}
      </span>
      {after}
    </span>
  );
}

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
            ? {
                delay: 9000,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={{ clickable: true }}
        className={cn(
          "hero-swiper ",
          compact
            ? "min-h-[330px] sm:min-h-[330px] md:min-h-[330px] lg:min-h-[330px]"
            : "min-h-[160px] sm:min-h-[190px] md:min-h-[240px] lg:min-h-[280px]",
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
        "relative ",
        compact
          ? "min-h-[132px] sm:min-h-[168px] md:min-h-[220px] lg:min-h-[260px]"
          : "min-h-[160px] sm:min-h-[190px] md:min-h-[240px] lg:min-h-[280px]",
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
          "relative flex flex-col justify-center text-center md:text-start",
          compact
            ? "min-h-[132px] px-4 py-4 sm:min-h-[168px] sm:px-7 sm:py-5 md:min-h-[220px] md:px-10 lg:min-h-[260px]"
            : "min-h-[160px] px-5 py-6 sm:min-h-[190px] sm:px-8 md:min-h-[240px] md:px-10 lg:min-h-[280px]",
        )}
      >
        <TitleTag
          className={cn(
            "mx-auto max-w-[18rem] font-display font-bold leading-[1.15] tracking-tight text-white sm:max-w-xl md:mx-0",
            compact ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl" : "text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem]",
          )}
        >
          <TitleWithHighlight
            text={slide.title}
            highlight={slide.titleHighlight}
            className="text-pretty"
          />
        </TitleTag>
        <p
          className={cn(
            "mx-auto mt-1 max- text-pretty break-words text-white/88 sm:mt-2 sm:max-w-lg md:mx-0",
            compact ? "text-xs sm:text-sm md:text-base" : "text-sm sm:text-base md:text-lg",
          )}
        >
          {slide.subtitle}
        </p>
        <div
          className={cn(
            "mx-auto flex flex-wrap items-center justify-center gap-2.5 md:mx-0 md:justify-start",
            compact ? "mt-3 sm:mt-4" : "mt-4 sm:mt-5",
          )}
        >
          <Link
            href={slide.primaryHref}
            className={cn(
              "inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-black shadow-md transition-colors hover:bg-brand-400",
              compact ? "h-9 sm:h-10 sm:px-5" : "h-10 sm:h-12 sm:px-6 sm:text-base",
            )}
          >
            {slide.primaryLabel}
          </Link>
          {slide.secondaryHref && slide.secondaryLabel ? (
            slide.secondaryOpenInNewTab ? (
              <a
                href={slide.secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center rounded-xl border border-white/55 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-[2px] transition-colors hover:bg-white/18",
                  compact ? "h-9 sm:h-10 sm:px-5" : "h-10 sm:h-12 sm:px-6 sm:text-base",
                )}
              >
                {slide.secondaryLabel}
              </a>
            ) : (
              <Link
                href={slide.secondaryHref}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl border border-white/55 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-[2px] transition-colors hover:bg-white/18",
                  compact ? "h-9 sm:h-10 sm:px-5" : "h-10 sm:h-12 sm:px-6 sm:text-base",
                )}
              >
                {slide.secondaryLabel}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
