"use client";

import { Link } from "next-view-transitions";
import { useEffect, useMemo, useState } from "react";
import type { CmsTopAnnouncementBar } from "@/schemas/cms";
import { cn } from "@/lib/utils";

/*
 * شريط إعلان فوق الهيدر — ضمن غلاف sticky في `SiteShell`؛
 * sm/md/lg: سطر واحد؛ مارquee أفقي أو كاروسيل نصي حسب `mode`.
 */

type TopAnnouncementBarProps = {
  config: CmsTopAnnouncementBar;
};

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
        href && "underline-offset-2 hover:underline",
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

function MarqueeRow({ items }: { items: { text: string; href?: string }[] }) {
  const loop = useMemo(() => [...items, ...items], [items]);
  return (
    <div
      className="w-full overflow-hidden border-b border-brand-700/25 bg-brand-800 py-2 text-brand-50"
      dir="ltr"
    >
      <div className="inline-flex min-w-0 shrink-0 items-center gap-10 whitespace-nowrap px-3 animate-storefront-marquee">
        {loop.map((it, i) => (
          <ItemLine key={`${i}-${it.text}`} text={it.text} href={it.href} />
        ))}
      </div>
    </div>
  );
}

function CarouselRow({
  items,
  intervalSec,
}: {
  items: { text: string; href?: string }[];
  intervalSec: number;
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
    <div
      className="flex w-full justify-center border-b border-brand-700/25 bg-brand-800 py-2 text-brand-50"
      aria-live="polite"
    >
      <ItemLine text={item.text} href={item.href} />
    </div>
  );
}

export function TopAnnouncementBar({ config }: TopAnnouncementBarProps) {
  const items = config.items;
  if (!config.enabled || items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="flex w-full justify-center border-b border-brand-700/25 bg-brand-800 py-2 text-brand-50">
        <ItemLine text={items[0].text} href={items[0].href} />
      </div>
    );
  }

  if (config.mode === "carousel") {
    return (
      <CarouselRow items={items} intervalSec={config.carouselIntervalSec ?? 8} />
    );
  }

  return <MarqueeRow items={items} />;
}
