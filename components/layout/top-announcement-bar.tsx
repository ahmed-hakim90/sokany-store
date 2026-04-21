"use client";

import { Link } from "next-view-transitions";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  stickyAnnouncementBottomShadowWhenHeaderHiddenClass,
} from "@/components/layout/mobile-commerce-surface";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import type { CmsTopAnnouncementBar } from "@/schemas/cms";
import { cn } from "@/lib/utils";

/*
 * شريط إعلان فوق الهيدر — ضمن غلاف sticky في `SiteShell`.
 *
 * - `safe-area-inset-top` على غلاف `SiteShell` فقط (لا تكرار مع الهيدر).
 * - شريط بعرض الشاشة بدون هامش جانبي وبدون زوايا دائرية؛ فاصل سفلي خفيف عن `TopHeader`.
 */

type TopAnnouncementBarProps = {
  config: CmsTopAnnouncementBar;
};

const announcementTextClass =
  "text-slate-900 [&_a]:text-slate-900 [&_a]:underline-offset-2 [&_a]:hover:underline";

function AnnouncementChrome({
  children,
  className,
  headerCollapsedMobile,
  ...rest
}: ComponentProps<"div"> & { headerCollapsedMobile?: boolean }) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "overflow-hidden border-b border-border/60 bg-white px-3 py-1.5",
          headerCollapsedMobile && stickyAnnouncementBottomShadowWhenHeaderHiddenClass,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

function ItemLine({
  text,
  href,
  className,
}: {
  text: string;
  href?: string;
  className?: string;
}) {
  const body = (
    <span
      className={cn(
        "inline-block max-w-[min(100vw-2rem,42rem)] truncate px-3 text-center text-xs font-semibold sm:text-sm",
        announcementTextClass,
        className,
      )}
    >
      {text}
    </span>
  );
  if (!href?.trim()) return body;
  const h = href.trim();
  if (h.startsWith("http://") || h.startsWith("https://")) {
    return (
      <a href={h} className="text-inherit" target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return (
    <Link href={h} className="text-inherit">
      {body}
    </Link>
  );
}

function MarqueeRow({
  items,
  headerCollapsedMobile,
}: {
  items: { text: string; href?: string }[];
  headerCollapsedMobile: boolean;
}) {
  const loop = useMemo(() => [...items, ...items], [items]);
  return (
    <AnnouncementChrome
      headerCollapsedMobile={headerCollapsedMobile}
      className="min-h-10 py-1.5"
    >
      <div className="w-full overflow-hidden" dir="ltr">
        <div className="inline-flex min-w-0 shrink-0 items-center gap-10 whitespace-nowrap px-3 animate-storefront-marquee">
          {loop.map((it, i) => (
            <ItemLine key={`${i}-${it.text}`} text={it.text} href={it.href} />
          ))}
        </div>
      </div>
    </AnnouncementChrome>
  );
}

function CarouselRow({
  items,
  intervalSec,
  headerCollapsedMobile,
}: {
  items: { text: string; href?: string }[];
  intervalSec: number;
  headerCollapsedMobile: boolean;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = window.setInterval(() => {
      setI((x) => (x + 1) % items.length);
    }, Math.max(3000, intervalSec * 1000));
    return () => window.clearInterval(t);
  }, [items.length, intervalSec]);

  const item = items[i] ?? items[0];
  if (!item) return null;

  return (
    <AnnouncementChrome
      headerCollapsedMobile={headerCollapsedMobile}
      className="flex min-h-10 items-center justify-center py-1.5"
      aria-live="polite"
    >
      <ItemLine text={item.text} href={item.href} />
    </AnnouncementChrome>
  );
}

export function TopAnnouncementBar({ config }: TopAnnouncementBarProps) {
  const headerCollapsedMobile = useMobileChromeCollapsedStore(
    (s) => s.headerHidden,
  );
  const items = config.items;
  if (!config.enabled || items.length === 0) return null;

  if (items.length === 1) {
    return (
      <AnnouncementChrome
        headerCollapsedMobile={headerCollapsedMobile}
        className="flex min-h-10 items-center justify-center py-1.5"
      >
        <ItemLine text={items[0].text} href={items[0].href} />
      </AnnouncementChrome>
    );
  }

  if (config.mode === "carousel") {
    return (
      <CarouselRow
        items={items}
        intervalSec={config.carouselIntervalSec ?? 8}
        headerCollapsedMobile={headerCollapsedMobile}
      />
    );
  }

  return (
    <MarqueeRow items={items} headerCollapsedMobile={headerCollapsedMobile} />
  );
}
