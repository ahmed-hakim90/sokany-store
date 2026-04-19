import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";

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

export function ProductDetailDescriptionBlocks({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const body = product.description.trim() || product.shortDescription.trim();

  if (!body) return null;

  return (
    <div className={cn(className)}>
      <section
        className="rounded-2xl border border-border bg-white/95 p-5 text-start shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]"
        dir="auto"
      >
        <h2 className="font-display text-lg font-bold text-brand-950">عن المنتج</h2>
        <div className="product-markdown mt-3 [&_>*:first-child]:mt-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {body}
          </ReactMarkdown>
        </div>
      </section>
    </div>
  );
}
