import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";
import {
  getProductVideoEmbed,
  removeRawUrls,
} from "@/features/products/lib/product-merchandising";

type DetailRow = { label: string; value: string };

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mt-3 text-sm leading-relaxed text-zinc-700 first:mt-0">{children}</p>
  ),
  h1: ({ children }) => (
    <h3 className="mt-4 font-display text-base font-bold text-brand-950 first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-4 font-display text-base font-bold text-brand-950 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 font-display text-base font-bold text-brand-950 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 font-display text-sm font-bold text-brand-950">{children}</h4>
  ),
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-relaxed text-zinc-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm leading-relaxed text-zinc-700">{children}</ol>
  ),
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-zinc-800">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-brand-800 underline underline-offset-2 hover:text-brand-950"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code
          className={cn("font-mono text-xs text-zinc-800", className)}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.85em] text-zinc-800"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-border/80 bg-surface-muted/80 p-3 text-start font-mono text-xs leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-r-4 border-brand-200 pr-3 text-sm text-zinc-600">{children}</blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border/80">
      <table className="w-full min-w-[16rem] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-muted/80">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border/70 px-3 py-2 text-start font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-border/60 px-3 py-2 text-zinc-700">{children}</td>
  ),
};

function parseSimpleDetailRows(body: string): { rows: DetailRow[]; rest: string } {
  const lines = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const rows: DetailRow[] = [];
  const consumed = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (consumed.has(i)) continue;
    const line = lines[i]!;
    const colon = line.match(/^([^:：]{2,40})[:：]\s*(.+)$/);
    if (colon?.[1] && colon[2]) {
      rows.push({ label: colon[1].trim(), value: colon[2].trim() });
      consumed.add(i);
      continue;
    }
    const next = lines[i + 1];
    if (
      next &&
      line.length <= 40 &&
      !/[.!؟?]$/.test(line) &&
      !/https?:\/\//i.test(line)
    ) {
      rows.push({ label: line, value: next });
      consumed.add(i);
      consumed.add(i + 1);
      i++;
    }
  }

  const rest = lines.filter((_, i) => !consumed.has(i)).join("\n\n");
  return { rows, rest };
}

export function ProductDetailDescriptionBlocks({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const rawBody = product.description.trim() || product.shortDescription.trim();
  const body = removeRawUrls(rawBody);
  const video = getProductVideoEmbed(product);
  const parsed = parseSimpleDetailRows(body);

  if (!body && !video) return null;

  return (
    <div className={cn(className)}>
      <section
        className="rounded-2xl border border-border bg-white/95 p-5 text-start shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]"
        dir="auto"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-brand-950">عن المنتج</h2>
          {video ? (
            <a
              href={video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-3 text-xs font-bold text-brand-950 transition-colors hover:bg-brand-100"
            >
              فتح الفيديو
            </a>
          ) : null}
        </div>
        {video ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-[0_12px_34px_-22px_rgba(15,23,42,0.45)]">
            {video.kind === "video" ? (
              <video
                className="aspect-video h-auto w-full bg-black"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                aria-label="فيديو المنتج"
              >
                <source src={video.embedUrl} />
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            ) : (
              <iframe
                className="aspect-video w-full bg-black"
                src={video.embedUrl}
                title={video.title}
                loading="eager"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                allowFullScreen
              />
            )}
          </div>
        ) : null}
        {parsed.rows.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/80 bg-white">
            <dl className="divide-y divide-border/70">
              {parsed.rows.map((row) => (
                <div
                  key={`${row.label}-${row.value}`}
                  className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="font-bold text-slate-950">{row.label}</dt>
                  <dd className="break-words leading-relaxed text-slate-700">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
        {parsed.rest ? (
          <div className="product-markdown mt-3 [&_>*:first-child]:mt-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {parsed.rest}
            </ReactMarkdown>
          </div>
        ) : null}
      </section>
    </div>
  );
}
