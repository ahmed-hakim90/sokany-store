"use client";

import { Link } from "next-view-transitions";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  stickyAnnouncementBottomShadowWhenTopRowHiddenClass,
} from "@/components/layout/mobile-commerce-surface";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import type { CmsTopAnnouncementBar } from "@/schemas/cms";
import { copyPromoCode } from "@/features/promotions/lib/copy-promo-code";
import { cn } from "@/lib/utils";

/*
 * شريط إعلان فوق الهيدر — ضمن غلاف sticky في `SiteShell`.
 *
 * - `safe-area-inset-top` على غلاف `SiteShell` فقط (لا تكرار مع الهيدر).
 * - شريط بعرض الشاشة؛ زر إغلاق يحفظ التفضيل في localStorage حتى الجلسة التالية.
 * - موبايل: ظل سفلي خفيف عند طي صف الشعار.
 */

const DISMISS_STORAGE_KEY = "storefront-announcement-dismissed";

type TopAnnouncementBarProps = {
  config: CmsTopAnnouncementBar;
};

const announcementTextClass =
  "text-brand-950 [&_a]:text-brand-950 [&_a]:underline-offset-2 [&_a]:hover:underline";

function announcementFingerprint(config: CmsTopAnnouncementBar): string {
  return JSON.stringify({
    enabled: config.enabled,
    mode: config.mode,
    items: config.items,
  });
}

function AnnouncementChrome({
  children,
  className,
  topRowHiddenMobile,
  onDismiss,
  ...rest
}: ComponentProps<"div"> & {
  topRowHiddenMobile?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <div className="relative w-full">
      <div
        className={cn(
          "overflow-hidden border-b border-brand-200/50 bg-gradient-to-l from-brand-50/90 via-white to-brand-50/70 px-3 py-1.5",
          topRowHiddenMobile && stickyAnnouncementBottomShadowWhenTopRowHiddenClass,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute end-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white/90 text-brand-900/70 shadow-sm transition-colors hover:bg-white hover:text-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          aria-label="إغلاق الإعلان"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function ItemLine({
  text,
  href,
  copyCode,
  className,
}: {
  text: string;
  href?: string;
  copyCode?: string;
  className?: string;
}) {
  const body = (
    <span
      className={cn(
        "inline-block max-w-[min(100vw-3.5rem,42rem)] truncate px-3 text-center text-xs font-semibold sm:text-sm",
        announcementTextClass,
        className,
      )}
    >
      {text}
    </span>
  );

  const code = copyCode?.trim();
  if (code) {
    return (
      <button
        type="button"
        className="cursor-pointer border-0 bg-transparent p-0 text-inherit"
        onClick={() => void copyPromoCode(code)}
        aria-label={`نسخ كود الخصم ${code}`}
      >
        {body}
      </button>
    );
  }

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
  topRowHiddenMobile,
  onDismiss,
}: {
  items: { text: string; href?: string; copyCode?: string }[];
  topRowHiddenMobile: boolean;
  onDismiss: () => void;
}) {
  const loop = useMemo(() => [...items, ...items], [items]);
  return (
    <AnnouncementChrome
      topRowHiddenMobile={topRowHiddenMobile}
      onDismiss={onDismiss}
      className="min-h-10 py-1.5 pe-10"
    >
      <div className="w-full overflow-hidden" dir="ltr">
        <div className="inline-flex min-w-0 shrink-0 items-center gap-10 whitespace-nowrap px-3 animate-storefront-marquee">
          {loop.map((it, i) => (
            <ItemLine
              key={`${i}-${it.text}`}
              text={it.text}
              href={it.href}
              copyCode={it.copyCode}
            />
          ))}
        </div>
      </div>
    </AnnouncementChrome>
  );
}

function CarouselRow({
  items,
  intervalSec,
  topRowHiddenMobile,
  onDismiss,
}: {
  items: { text: string; href?: string; copyCode?: string }[];
  intervalSec: number;
  topRowHiddenMobile: boolean;
  onDismiss: () => void;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const ms = Math.max(3000, intervalSec * 1000);
    let id: number | undefined;
    const start = () => {
      if (id !== undefined || document.hidden) return;
      id = window.setInterval(() => {
        setI((x) => (x + 1) % items.length);
      }, ms);
    };
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [items.length, intervalSec]);

  const item = items[i] ?? items[0];
  if (!item) return null;

  return (
    <AnnouncementChrome
      topRowHiddenMobile={topRowHiddenMobile}
      onDismiss={onDismiss}
      className="flex min-h-10 items-center justify-center py-1.5 pe-10"
      aria-live="polite"
    >
      <ItemLine text={item.text} href={item.href} copyCode={item.copyCode} />
    </AnnouncementChrome>
  );
}

export function TopAnnouncementBar({ config }: TopAnnouncementBarProps) {
  const topRowHiddenMobile = useMobileChromeCollapsedStore(
    (s) => s.headerHidden,
  );
  const fingerprint = useMemo(() => announcementFingerprint(config), [config]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISS_STORAGE_KEY);
      setDismissed(stored === fingerprint);
    } catch {
      setDismissed(false);
    }
  }, [fingerprint]);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, fingerprint);
    } catch {
      /* ignore */
    }
  };

  const items = config.items;
  if (!config.enabled || items.length === 0 || dismissed) return null;

  if (items.length === 1) {
    return (
      <AnnouncementChrome
        topRowHiddenMobile={topRowHiddenMobile}
        onDismiss={dismiss}
        className="flex min-h-10 items-center justify-center py-1.5 pe-10"
      >
        <ItemLine
          text={items[0].text}
          href={items[0].href}
          copyCode={items[0].copyCode}
        />
      </AnnouncementChrome>
    );
  }

  if (config.mode === "carousel") {
    return (
      <CarouselRow
        items={items}
        intervalSec={config.carouselIntervalSec ?? 8}
        topRowHiddenMobile={topRowHiddenMobile}
        onDismiss={dismiss}
      />
    );
  }

  return (
    <MarqueeRow
      items={items}
      topRowHiddenMobile={topRowHiddenMobile}
      onDismiss={dismiss}
    />
  );
}
