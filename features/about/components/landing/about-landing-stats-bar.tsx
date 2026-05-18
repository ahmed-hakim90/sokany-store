"use client";

import { Headphones, MapPin, Package, Store, Tags } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aboutLandingStats } from "@/features/about/content/about-landing-content";
import { cn } from "@/lib/utils";

const statIcons = [Package, Tags, MapPin, Store, Headphones] as const;

/*
 * شريط الأرقام — يتحرك العد عند الظهور؛ صف واحد scroll على الجوال.
 */
export function AboutLandingStatsBar() {
  return (
    <section
      className="rounded-2xl border-2 border-brand-500/60 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 px-4 py-6 text-white shadow-[0_16px_40px_-20px_rgba(10,10,10,0.55)] sm:px-6"
      aria-label="أرقام سوكاني مصر"
    >
      <ul className="flex gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {aboutLandingStats.map((stat, index) => {
          const Icon = statIcons[index] ?? Package;
          return (
            <li
              key={stat.label}
              className="flex min-w-[7.5rem] shrink-0 flex-col items-center gap-2 text-center sm:min-w-0"
            >
              <Icon className="h-5 w-5 text-brand-500" aria-hidden />
              <StatValue
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                isHotline={"isHotline" in stat && stat.isHotline}
              />
              <span className="text-xs text-white/90 sm:text-sm">{stat.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatValue({
  value,
  prefix,
  suffix,
  isHotline,
}: {
  value: number;
  prefix: string;
  suffix: string;
  isHotline?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(isHotline ? String(value) : `${prefix}0${suffix}`);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isHotline) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setDisplay(`${prefix}${value}${suffix}`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHotline, prefix, suffix, value]);

  useEffect(() => {
    if (!started || isHotline) return;

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const current = Math.round(value * eased);
      setDisplay(`${prefix}${current}${suffix}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, isHotline, prefix, suffix, value]);

  return (
    <span
      ref={ref}
      className={cn(
        "font-display font-black tabular-nums text-brand-300",
        isHotline ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
      )}
    >
      {display}
    </span>
  );
}
