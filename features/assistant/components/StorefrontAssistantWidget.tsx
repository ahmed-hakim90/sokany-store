"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssistantDataTypes, AssistantSource } from "@/features/assistant/types";

type AssistantMessage = UIMessage<unknown, AssistantDataTypes>;

const starterPrompts = [
  "رشحلي منتجات للعناية الشخصية",
  "إيه سياسة الاسترجاع؟",
  "فين عناوين فروع الصيانة؟",
];

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

export function StorefrontAssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport<AssistantMessage>({ api: "/api/assistant/chat" }),
    [],
  );
  const { messages, sendMessage, status, error, stop } = useChat<AssistantMessage>({
    transport,
  });
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open || isBusy) {
      setShowIntro(false);
      return;
    }
    setShowIntro(true);
    const timer = window.setTimeout(() => setShowIntro(false), 6500);
    return () => window.clearTimeout(timer);
  }, [pathname, open, isBusy]);

  function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: trimmed }] });
    setInput("");
  }

  return (
    <section
      dir="rtl"
      aria-label="مساعد سوكاني"
      className="fixed start-4 z-[54] bottom-mobile-floating-actions lg:bottom-8"
    >
      {open ? (
        <div className="absolute bottom-14 start-0 w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-brand-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-black">
                <Bot className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold">مساعد سوكاني</h2>
                <p className="text-xs text-white/70">معلومات عامة من المتجر فقط</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isBusy) void stop();
                setOpen(false);
              }}
              className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              aria-label="إغلاق المساعد"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="max-h-[min(60dvh,31rem)] space-y-3 overflow-y-auto bg-surface-muted/30 p-3">
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
            className="flex items-end gap-2 border-t border-border/80 bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage(input);
            }}
          >
            <label className="sr-only" htmlFor="storefront-assistant-input">
              اكتب سؤالك
            </label>
            <textarea
              id="storefront-assistant-input"
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
      ) : null}

      {showIntro && !open && !isBusy ? (
        <div className="absolute bottom-14 start-0 w-[min(calc(100vw-2rem),20rem)] animate-fade-in rounded-2xl border border-brand-200 bg-white p-3 text-start shadow-xl motion-reduce:animate-none">
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="absolute left-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            aria-label="إخفاء رسالة مساعد سوكاني"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          <div className="flex items-start gap-2 pe-5">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg animate-bounce motion-reduce:animate-none"
              aria-hidden
            >
              💬
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-950">مساعد سوكاني جاهز</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                اسألني عن المنتجات، افضل سعر، الفروع، الضمان والعروض.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setShowIntro(false);
          setOpen((value) => !value);
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-950 text-white shadow-lg transition hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        aria-label={open ? "إغلاق مساعد سوكاني" : "فتح مساعد سوكاني"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
      </button>
    </section>
  );
}
