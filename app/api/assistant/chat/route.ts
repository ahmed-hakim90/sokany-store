import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  stepCountIs,
  type ModelMessage,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { detectAssistantIntent, intentLabel } from "@/features/assistant/lib/assistant-intents";
import { collectPublicKnowledge } from "@/features/assistant/lib/public-knowledge";
import {
  chunksToPromptContext,
  chunksToSources,
  detectPublicKnowledgeIntent,
  searchPublicKnowledge,
} from "@/features/assistant/lib/search-public-knowledge";
import {
  normalizeArabicText,
  tokenizeForArabicSearch,
} from "@/features/assistant/lib/arabic-normalize";
import {
  ABUSE_REFUSAL,
  PRIVATE_REFUSAL,
  isAbusiveQuestion,
  isPrivateOrRestrictedQuestion,
} from "@/features/assistant/lib/safety";
import {
  findLowestPricedPublicProduct,
  isLowestPriceQuestion,
} from "@/features/assistant/lib/lowest-price";
import { buildProductSalesContextChunks } from "@/features/assistant/lib/product-sales-context";
import { productToAssistantCard, productsToAssistantCards } from "@/features/assistant/lib/product-cards";
import { recommendPublicProducts } from "@/features/assistant/lib/product-recommendations";
import { comparePublicProducts } from "@/features/assistant/lib/product-compare";
import type {
  AssistantDataTypes,
  AssistantPageContext,
  AssistantProductCard,
  AssistantSource,
  PublicKnowledgeChunk,
} from "@/features/assistant/types";
import { ROUTES } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 600;
const MAX_HISTORY_LENGTH = 8;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

type AssistantUIMessage = UIMessage<unknown, AssistantDataTypes>;

const messagePartSchema = z.object({ type: z.string() }).passthrough();
const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            id: z.string().optional(),
            role: z.enum(["user", "assistant"]),
            parts: z.array(messagePartSchema).max(40),
          })
          .passthrough(),
      )
      .min(1)
      .max(MAX_HISTORY_LENGTH + 4),
    pageContext: z
      .object({
        pathname: z.string().max(300),
        pageType: z.enum([
          "home",
          "product",
          "category",
          "cart",
          "checkout",
          "search",
          "policy",
          "branches",
          "retailers",
          "unknown",
        ]),
        productId: z.number().int().positive().optional(),
        categorySlug: z.string().max(120).optional(),
      })
      .optional(),
  })
  .passthrough();

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

function getRateLimitStore(): Map<string, RateLimitEntry> {
  const globalWithStore = globalThis as typeof globalThis & {
    __sokanyAssistantRateLimits?: Map<string, RateLimitEntry>;
  };
  globalWithStore.__sokanyAssistantRateLimits ??= new Map();
  return globalWithStore.__sokanyAssistantRateLimits;
}

function rateLimit(request: NextRequest): NextResponse | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  const now = Date.now();
  const store = getRateLimitStore();
  const current = store.get(ip);
  if (!current || current.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      { error: "طلبات كثيرة. جرّب مرة أخرى بعد دقيقة." },
      { status: 429 },
    );
  }
  current.count += 1;
  return null;
}

function partText(part: z.infer<typeof messagePartSchema>): string {
  if (part.type !== "text") return "";
  const maybeText = (part as { text?: unknown }).text;
  return typeof maybeText === "string" ? maybeText : "";
}

function messageText(message: z.infer<typeof chatRequestSchema>["messages"][number]): string {
  return message.parts.map(partText).join(" ").replace(/\s+/g, " ").trim();
}

function latestUserQuestion(
  messages: z.infer<typeof chatRequestSchema>["messages"],
): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "user") continue;
    const text = messageText(message);
    if (text) return text;
  }
  return null;
}

function toAssistantSources(sources: AssistantSource[]) {
  return {
    type: "data-sources" as const,
    data: sources,
  };
}

function toAssistantProducts(products: AssistantProductCard[]) {
  return {
    type: "data-products" as const,
    data: products,
  };
}

function toQuickActions(actions: string[]) {
  return {
    type: "data-quickActions" as const,
    data: actions,
  };
}

function textOnlyStreamResponse(
  text: string,
  sources: AssistantSource[] = [],
  products: AssistantProductCard[] = [],
  quickActions: string[] = [],
): Response {
  const stream = createUIMessageStream<AssistantUIMessage>({
    execute({ writer }) {
      writer.write(toAssistantSources(sources));
      if (products.length > 0) writer.write(toAssistantProducts(products));
      if (quickActions.length > 0) writer.write(toQuickActions(quickActions));
      const id = `text-${crypto.randomUUID()}`;
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function logAssistantIntent(
  intent: string,
  pageContext: AssistantPageContext | undefined,
  details: { results?: number; cards?: number; startedAt: number },
) {
  if (process.env.NODE_ENV !== "development") return;
  console.info(
    "[assistant]",
    JSON.stringify({
      intent,
      pageType: pageContext?.pageType ?? "unknown",
      results: details.results ?? 0,
      cards: details.cards ?? 0,
      ms: Date.now() - details.startedAt,
    }),
  );
}

function publicFallbackSource(question: string): AssistantSource {
  const encoded = new URLSearchParams({ q: question.slice(0, 80) }).toString();
  return {
    title: "البحث في المتجر",
    url: `${ROUTES.SEARCH}?${encoded}`,
    kind: "page",
  };
}

const BRANCH_QUERY_TERMS = new Set([
  "فرع",
  "فروع",
  "صيان",
  "صيانه",
  "مركز",
  "مراكز",
  "خدمه",
  "خدمات",
  "عنوان",
  "عناوين",
  "فين",
  "مكان",
  "اماكن",
]);

function branchAnswerFromChunks(
  question: string,
  chunks: PublicKnowledgeChunk[],
): string | null {
  const branchChunks = chunks.filter((chunk) => chunk.kind === "branch");
  if (branchChunks.length === 0) return null;

  const queryTerms = tokenizeForArabicSearch(question)
    .map((term) => term.replace(/^ال/, ""))
    .filter((term) => term.length >= 3 && !BRANCH_QUERY_TERMS.has(term));
  const allLines = branchChunks
    .flatMap((chunk) => chunk.text.split("|"))
    .map((line) => line.trim())
    .filter(Boolean);
  const uniqueLines = [...new Set(allLines)];
  const matchedLines =
    queryTerms.length > 0
      ? uniqueLines.filter((line) => {
          const normalizedLine = normalizeArabicText(line);
          return queryTerms.some((term) => normalizedLine.includes(term));
        })
      : [];
  const lines = (matchedLines.length > 0 ? matchedLines : uniqueLines).slice(0, 7);
  if (lines.length === 0) return null;

  return [
    "عناوين الفروع ومراكز الصيانة:",
    ...lines.map((line) => `- ${line}`),
  ].join("\n");
}

function chunksFromPageContext(
  pageContext: AssistantPageContext | undefined,
  chunks: PublicKnowledgeChunk[],
): PublicKnowledgeChunk[] {
  if (!pageContext) return [];
  if (pageContext.pageType === "product" && pageContext.productId) {
    return chunks.filter((chunk) => chunk.id === `product-${pageContext.productId}`);
  }
  if (pageContext.pageType === "category" && pageContext.categorySlug) {
    return chunks.filter(
      (chunk) =>
        chunk.kind === "category" &&
        (chunk.url.endsWith(`/${pageContext.categorySlug}`) ||
          chunk.url.includes(`/${pageContext.categorySlug}?`)),
    );
  }
  return [];
}

async function modelMessagesFromUi(
  messages: z.infer<typeof chatRequestSchema>["messages"],
): Promise<ModelMessage[]> {
  const recent = messages.slice(-MAX_HISTORY_LENGTH).map((message) => ({
    role: message.role,
    parts: message.parts,
  })) as Array<Omit<AssistantUIMessage, "id">>;
  return convertToModelMessages(recent, {
    ignoreIncompleteToolCalls: true,
    convertDataPart: () => undefined,
  });
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const limited = rateLimit(request);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const question = latestUserQuestion(parsed.data.messages);
  const pageContext = parsed.data.pageContext;
  if (!question) {
    return textOnlyStreamResponse("اكتب سؤالك عن منتجات سوكاني أو الفروع أو السياسات.");
  }
  if (question.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `الرسالة طويلة. الحد الأقصى ${MAX_MESSAGE_LENGTH} حرف.` },
      { status: 400 },
    );
  }
  if (isPrivateOrRestrictedQuestion(question)) {
    return textOnlyStreamResponse(PRIVATE_REFUSAL, [
      { title: "تتبع الطلب", url: ROUTES.ORDER_TRACKING, kind: "page" },
      { title: "حسابي", url: ROUTES.ACCOUNT, kind: "page" },
    ]);
  }
  if (isAbusiveQuestion(question)) {
    return textOnlyStreamResponse(ABUSE_REFUSAL);
  }

  const assistantIntent = detectAssistantIntent(question, pageContext);

  if (assistantIntent === "lowestPrice" || isLowestPriceQuestion(question)) {
    const lowest = await findLowestPricedPublicProduct(question);
    if (lowest) {
      const cards = [productToAssistantCard(lowest.product, { badge: "أقل سعر متاح" })];
      logAssistantIntent("lowestPrice", pageContext, {
        results: 1,
        cards: cards.length,
        startedAt,
      });
      return textOnlyStreamResponse(
        [
          `أقل سعر متاح لـ ${lowest.queryLabel}:`,
          `${lowest.product.name}`,
          `السعر: ${lowest.formattedPrice}`,
          `الرابط: ${lowest.url}`,
        ].join("\n"),
        [{ title: lowest.product.name, url: lowest.url, kind: "product" }],
        cards,
        ["قارنه بمنتج تاني", "هات منتجات مكملة"],
      );
    }
    return textOnlyStreamResponse(
      "مش لاقي منتج متاح بالسعر داخل الكتالوج العام للسؤال ده. جرّب اسم المنتج بشكل أوضح، أو افتح صفحة البحث.",
      [publicFallbackSource(question)],
    );
  }

  if (assistantIntent === "productRecommendation") {
    const recommendation = await recommendPublicProducts(question, pageContext);
    if (recommendation) {
      const cards = productsToAssistantCards(
        recommendation.products,
        (product, index) =>
          index === 0
            ? "أفضل اختيار كبداية حسب السؤال"
            : product.onSale
              ? "اختيار عليه عرض"
              : "بديل مناسب من نفس البحث",
      );
      logAssistantIntent("productRecommendation", pageContext, {
        results: recommendation.products.length,
        cards: cards.length,
        startedAt,
      });
      return textOnlyStreamResponse(
        [
          recommendation.title,
          ...recommendation.products.map(
            (product, index) =>
              `${index + 1}. ${product.name} - ${cards[index]?.price} - ${cards[index]?.url}`,
          ),
        ].join("\n"),
        cards.map((card) => ({ title: card.name, url: card.url, kind: "product" })),
        cards,
        ["قارن أول اتنين", "هات أرخص بديل"],
      );
    }
  }

  if (assistantIntent === "productCompare") {
    const comparison = await comparePublicProducts(question);
    if (comparison) {
      const cards = productsToAssistantCards(comparison.products);
      logAssistantIntent("productCompare", pageContext, {
        results: comparison.products.length,
        cards: cards.length,
        startedAt,
      });
      return textOnlyStreamResponse(
        comparison.text,
        cards.map((card) => ({ title: card.name, url: card.url, kind: "product" })),
        cards,
        ["هات الأرخص", "رشحلي الأفضل"],
      );
    }
  }

  const allChunks = await collectPublicKnowledge();
  const intent = detectPublicKnowledgeIntent(question);
  const pageChunks = chunksFromPageContext(pageContext, allChunks);
  const retrieved = [
    ...pageChunks,
    ...searchPublicKnowledge(question, allChunks).filter(
      (chunk) => !pageChunks.some((pageChunk) => pageChunk.id === chunk.id),
    ),
  ];

  if (intent === "branches") {
    const branchAnswer = branchAnswerFromChunks(question, retrieved);
    if (branchAnswer) {
      logAssistantIntent("branches", pageContext, {
        results: retrieved.length,
        startedAt,
      });
      return textOnlyStreamResponse(branchAnswer, chunksToSources(retrieved));
    }
  }

  const productSalesChunks =
    intent === "product" ||
    assistantIntent === "productDetails" ||
    pageContext?.pageType === "product"
      ? await buildProductSalesContextChunks(retrieved)
      : [];
  const productSalesCards = productSalesChunks
    .filter((chunk) => chunk.kind === "product" && chunk.id.startsWith("product-card:"))
    .map((chunk) => {
      try {
        return JSON.parse(chunk.text) as AssistantProductCard;
      } catch {
        return null;
      }
    })
    .filter((card): card is AssistantProductCard => card != null);
  const modelContextChunks = [...productSalesChunks, ...retrieved];
  const sources =
    modelContextChunks.length > 0
      ? chunksToSources(modelContextChunks)
      : [publicFallbackSource(question)];

  if (modelContextChunks.length === 0) {
    return textOnlyStreamResponse(
      "مش لاقي معلومة كافية في محتوى المتجر العام عن السؤال ده. جرّب البحث في المتجر أو اسألني باسم منتج/تصنيف أو سياسة محددة.",
      sources,
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter is not configured on the server." },
      { status: 503 },
    );
  }

  const openrouter = createOpenRouter({
    apiKey,
    appName: "Sokany Store Assistant",
    appUrl: getSiteUrl(),
  });
  const model = openrouter.chat(
    process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto",
  );
  const modelMessages = await modelMessagesFromUi(parsed.data.messages);
  const context = chunksToPromptContext(modelContextChunks);

  const result = streamText({
    model,
    system: [
      "أنت مساعد متجر Sokany Store العام. أجب بالعربية المصرية/العربية الواضحة وبأسلوب قصير وودود جداً.",
      "اجعل الرد 3 سطور كحد أقصى، أو 4 نقاط قصيرة عند وجود قائمة.",
      "ممنوع كتابة ملاحظات إنجليزية مثل Note، وممنوع الكلام العام إذا كانت المعلومة المباشرة موجودة.",
      "نبرة البيع: اقنع العميل بهدوء وبمعلومة مفيدة، بدون وعود مبالغ فيها أو ادعاءات غير موجودة في السياق.",
      "لو السؤال عن الفروع أو العناوين: اذكر العناوين مباشرة فقط، بدون مقدمة عن المتجر.",
      "استخدم فقط السياق العام المسترجع أدناه. لا تستخدم معرفة خارجية ولا تخترع أسعاراً أو مخزوناً أو ضماناً أو سياسات.",
      "لو السؤال عن السعر، لا تخمن. استخدم فقط السعر الموجود في السياق، أو قل إن السعر غير كافٍ وافتح رابط المنتج.",
      "لو السؤال عن منتج: ابدأ بفائدة شراء واضحة من السياق، ثم السعر/الرابط إن وجدا، ثم اقترح منتجاً مكملاً واحداً أو اثنين فقط من Cross-sell الموجود في السياق.",
      "لا تقترح أي cross-sell غير موجود في السياق، ولا تذكر منتجاً بلا رابط.",
      "لو السياق لا يكفي، قل ذلك بوضوح ووجّه المستخدم للرابط الأنسب من المصادر.",
      "ممنوع طلب أو كشف بيانات طلبات أو حسابات أو عملاء أو لوحة تحكم أو مفاتيح Woo/OpenRouter أو أي أسرار.",
      "أسئلة الطلبات والحسابات: وجّه المستخدم إلى صفحة تتبع الطلب أو صفحة الحساب فقط.",
      "لا تقل إنك نفذت عملية شراء أو تعديل طلب أو حجز. أنت تقدم معلومات عامة فقط.",
      `السياق العام:\n${context}`,
    ].join("\n\n"),
    messages: modelMessages,
    stopWhen: stepCountIs(1),
    temperature: 0.2,
  });

  const stream = createUIMessageStream<AssistantUIMessage>({
    execute({ writer }) {
      writer.write(toAssistantSources(sources));
      if (productSalesCards.length > 0) writer.write(toAssistantProducts(productSalesCards));
      writer.write(toQuickActions(["هات أرخص بديل", "قارن منتجين", "منتجات مكملة"]));
      writer.merge(result.toUIMessageStream<AssistantUIMessage>());
    },
    onError() {
      return "حصل خطأ مؤقت في المساعد. جرّب مرة أخرى بعد لحظات.";
    },
  });

  logAssistantIntent(intentLabel(assistantIntent), pageContext, {
    results: modelContextChunks.length,
    cards: productSalesCards.length,
    startedAt,
  });

  return createUIMessageStreamResponse({ stream });
}
