"use client";

import { useMemo, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AssistantDataTypes,
  AssistantPageContext,
  AssistantProductCard,
  AssistantSource,
} from "@/features/assistant/types";

type AssistantMessage = UIMessage<unknown, AssistantDataTypes>;

type StorefrontAssistantChatPanelProps = {
  variant?: "floating" | "page";
  className?: string;
  onClose?: () => void;
};

function partText(part: AssistantMessage["parts"][number]): string {
  return part.type === "text" ? part.text : "";
}

function sourceParts(message: AssistantMessage): AssistantSource[] {
  for (const part of message.parts) {
    if (part.type === "data-sources" && Array.isArray(part.data)) {
      return part.data;
    }
  }
  return [];
}

function productParts(message: AssistantMessage): AssistantProductCard[] {
  for (const part of message.parts) {
    if (part.type === "data-products" && Array.isArray(part.data)) {
      return part.data;
    }
  }
  return [];
}

function quickActionParts(message: AssistantMessage): string[] {
  for (const part of message.parts) {
    if (part.type === "data-quickActions" && Array.isArray(part.data)) {
      return part.data.filter((item): item is string => typeof item === "string");
    }
  }
  return [];
}

function pageContextFromPathname(pathname: string): AssistantPageContext {
  const productMatch = pathname.match(/^\/products\/(\d+)/);
  const categoryMatch = pathname.match(/^\/categories\/([^/?#]+)/);
  if (productMatch?.[1]) {
    return {
      pathname,
      pageType: "product",
      productId: Number.parseInt(productMatch[1], 10),
    };
  }
  if (categoryMatch?.[1]) {
    return {
      pathname,
      pageType: "category",
      categorySlug: decodeURIComponent(categoryMatch[1]),
    };
  }
  if (pathname === "/cart") return { pathname, pageType: "cart" };
  if (pathname === "/checkout") return { pathname, pageType: "checkout" };
  if (pathname === "/search") return { pathname, pageType: "search" };
  if (pathname === "/branches") return { pathname, pageType: "branches" };
  if (pathname === "/retailers") return { pathname, pageType: "retailers" };
  if (["/terms", "/returns", "/privacy", "/warranty"].includes(pathname)) {
    return { pathname, pageType: "policy" };
  }
  if (pathname === "/") return { pathname, pageType: "home" };
  return { pathname, pageType: "unknown" };
}

function starterPromptsForPage(context: AssistantPageContext): string[] {
  if (context.pageType === "product") {
    return ["هل المنتج ده مناسب لي؟", "هات بديل أرخص", "منتجات مكملة"];
  }
  if (context.pageType === "category") {
    return ["رشحلي أفضل اختيار", "أرخص منتج هنا", "قارن بين اختيارين"];
  }
  if (context.pageType === "cart") {
    return ["ممكن أضيف إيه مع السلة؟", "هات منتجات مكملة", "هل في بديل أوفر؟"];
  }
  if (context.pageType === "checkout") {
    return ["اشرحلي بيانات الشحن", "إيه سياسة الاسترجاع؟", "إزاي أتتبع الطلب؟"];
  }
  if (context.pageType === "branches") {
    return ["أقرب فروع الصيانة", "عنوان فرع أكتوبر", "أرقام مراكز الخدمة"];
  }
  return [
    "رشحلي منتجات للعناية الشخصية",
    "إيه سياسة الاسترجاع؟",
    "فين عناوين فروع الصيانة؟",
  ];
}

function ProductCards({
  products,
}: {
  products: AssistantProductCard[];
}) {
  if (products.length === 0) return null;
  return (
    <div className="mt-2 space-y-2">
      {products.slice(0, 3).map((product) => (
        <a
          key={product.id}
          href={product.url}
          className="flex gap-2 rounded-xl border border-border/80 bg-surface-muted/40 p-2 transition hover:bg-brand-50/70"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
            <AppImage
              src={product.thumbnail}
              alt={product.name}
              width={56}
              height={56}
              className="h-full w-full object-contain p-1"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-brand-950">
              {product.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-brand-900">{product.price}</span>
              {product.onSale ? (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-950">
                  عرض
                </span>
              ) : null}
              {product.badge ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-600">
                  {product.badge}
                </span>
              ) : null}
            </div>
            {product.reason ? (
              <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                {product.reason}
              </p>
            ) : null}
          </div>
        </a>
      ))}
    </div>
  );
}

export function StorefrontAssistantChatPanel({
  variant = "floating",
  className,
  onClose,
}: StorefrontAssistantChatPanelProps) {
  const pathname = usePathname();
  const pageContext = useMemo(
    () => pageContextFromPathname(pathname || "/"),
    [pathname],
  );
  const starterPrompts = useMemo(
    () => starterPromptsForPage(pageContext),
    [pageContext],
  );
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport<AssistantMessage>({
        api: "/api/assistant/chat",
        body: { pageContext },
      }),
    [pageContext],
  );
  const { messages, sendMessage, status, error, stop } = useChat<AssistantMessage>({
    transport,
  });
  const isBusy = status === "submitted" || status === "streaming";
  const isPage = variant === "page";
  const inputId = isPage
    ? "storefront-assistant-page-input"
    : "storefront-assistant-input";

  function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: trimmed }] });
    setInput("");
  }

  return (
    <div
      className={cn(
        "overflow-hidden border border-border/80 bg-white shadow-2xl",
        isPage
          ? "flex min-h-0 flex-1 flex-col rounded-[1.75rem] shadow-xl lg:min-h-[38rem]"
          : "rounded-2xl",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-brand-950 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-black">
            <Bot className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold">مساعد سوكاني</h2>
            <p className="text-xs text-white/70">معلومات عامة من المتجر فقط</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={() => {
              if (isBusy) void stop();
              onClose();
            }}
            className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            aria-label="إغلاق المساعد"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "space-y-3 overflow-y-auto bg-surface-muted/30 p-3",
          isPage ? "min-h-0 flex-1" : "max-h-[min(60dvh,31rem)]",
        )}
      >
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-200 bg-white p-3 text-sm leading-6 text-muted-foreground">
            اسألني عن المنتجات، التصنيفات، الفروع، الموزعين، الضمان أو سياسة
            الاسترجاع. لا أقدر أساعد في بيانات الطلبات أو الحسابات.
            <div className="mt-3 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(prompt)}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-950 transition hover:bg-brand-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => {
          const text = message.parts.map(partText).filter(Boolean).join("");
          const sources = message.role === "assistant" ? sourceParts(message) : [];
          const products = message.role === "assistant" ? productParts(message) : [];
          const quickActions =
            message.role === "assistant" ? quickActionParts(message) : [];
          return (
            <article
              key={message.id}
              className={cn(
                "rounded-2xl px-3 py-2 text-sm leading-6",
                message.role === "user"
                  ? "me-8 bg-brand-500 text-black"
                  : "ms-8 border border-border/80 bg-white text-foreground",
              )}
            >
              <div className="whitespace-pre-wrap">{text || "..."}</div>
              <ProductCards products={products} />
              {sources.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/70 pt-2">
                  {sources.slice(0, 4).map((source) => (
                    <a
                      key={`${source.title}-${source.url}`}
                      href={source.url}
                      className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-brand-900 transition hover:bg-brand-50 hover:text-brand-950"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              ) : null}
              {quickActions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quickActions.slice(0, 3).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => submitMessage(action)}
                      disabled={isBusy}
                      className="rounded-full border border-brand-200 bg-white px-2 py-1 text-[11px] font-medium text-brand-900 transition hover:bg-brand-50 disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}

        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            حصل خطأ مؤقت. جرّب مرة أخرى بعد لحظات.
          </p>
        ) : null}
      </div>

      <form
        className={cn(
          "flex shrink-0 items-end gap-2 border-t border-border/80 bg-white p-3",
          isPage ? "pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]" : null,
        )}
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage(input);
        }}
      >
        <label className="sr-only" htmlFor={inputId}>
          اكتب سؤالك
        </label>
        <textarea
          id={inputId}
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, 600))}
          rows={2}
          placeholder="اسأل عن منتج أو سعر أو فرع..."
          className="min-h-10 flex-1 resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <Button
          type="submit"
          size="sm"
          variant="dark"
          disabled={!input.trim() || isBusy}
          className="h-10 w-10 shrink-0 rounded-full px-0"
          aria-label="إرسال"
        >
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
