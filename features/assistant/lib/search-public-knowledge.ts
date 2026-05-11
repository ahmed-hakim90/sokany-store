import type { AssistantSource, PublicKnowledgeChunk } from "@/features/assistant/types";
import { normalizeArabicText, tokenizeForArabicSearch } from "./arabic-normalize";

export const MAX_RETRIEVED_CHUNKS = 6;

export type PublicKnowledgeIntent =
  | "branches"
  | "retailers"
  | "policy"
  | "product"
  | "category"
  | "general";

type ScoredChunk = {
  chunk: PublicKnowledgeChunk;
  score: number;
};

const KIND_WEIGHTS: Record<PublicKnowledgeChunk["kind"], number> = {
  product: 4,
  category: 3,
  cms: 2,
  branch: 4,
  retailer: 4,
  policy: 5,
  page: 2,
};

export function detectPublicKnowledgeIntent(query: string): PublicKnowledgeIntent {
  const normalized = normalizeArabicText(query);
  if (/\b(فروع|فرع|صيان|صيانه|مركز|مراكز|خدمه|عنوان|عناوين|فين|مكان|اماكن)\b/.test(normalized)) {
    return "branches";
  }
  if (/\b(موزع|موزعين|معرض|معارض|نقطه بيع|نقاط بيع|اشتري منين)\b/.test(normalized)) {
    return "retailers";
  }
  if (/\b(ضمان|استرجاع|استبدال|ارجاع|خصوصيه|شروط|احكام|سياسه)\b/.test(normalized)) {
    return "policy";
  }
  if (/\b(تصنيف|تصنيفات|قسم|اقسام|كاتيجوري)\b/.test(normalized)) {
    return "category";
  }
  if (/\b(منتج|منتجات|موديل|سعر|اسعار|ارخص|اقل)\b/.test(normalized)) {
    return "product";
  }
  return "general";
}

function intentBoost(intent: PublicKnowledgeIntent, chunk: PublicKnowledgeChunk): number {
  if (intent === "branches") {
    if (chunk.kind === "branch") return 70;
    if (chunk.kind === "policy" || chunk.id === "page-about") return -35;
  }
  if (intent === "retailers") {
    if (chunk.kind === "retailer") return 70;
    if (chunk.kind === "branch" || chunk.id === "page-about") return -20;
  }
  if (intent === "policy") {
    if (chunk.kind === "policy") return 45;
    if (chunk.kind === "page") return -10;
  }
  if (intent === "product") {
    if (chunk.kind === "product") return 35;
    if (chunk.kind === "page") return -12;
  }
  if (intent === "category") {
    if (chunk.kind === "category") return 35;
  }
  return 0;
}

function scoreChunk(
  query: string,
  queryTokens: string[],
  chunk: PublicKnowledgeChunk,
  intent: PublicKnowledgeIntent,
): number {
  const title = normalizeArabicText(chunk.title);
  const text = normalizeArabicText(chunk.text);
  const haystack = `${title} ${text}`;
  let score = 0;

  if (query && haystack.includes(query)) score += 24;
  if (query && title.includes(query)) score += 12;

  for (const token of queryTokens) {
    if (title.includes(token)) score += 8;
    if (text.includes(token)) score += 3;
  }

  if (score > 0) score += KIND_WEIGHTS[chunk.kind] + intentBoost(intent, chunk);
  return score;
}

export function searchPublicKnowledge(
  query: string,
  chunks: PublicKnowledgeChunk[],
  limit = MAX_RETRIEVED_CHUNKS,
): PublicKnowledgeChunk[] {
  const normalizedQuery = normalizeArabicText(query);
  const queryTokens = tokenizeForArabicSearch(query);
  const intent = detectPublicKnowledgeIntent(query);
  if (!normalizedQuery || queryTokens.length === 0) return [];

  return chunks
    .map<ScoredChunk>((chunk) => ({
      chunk,
      score: scoreChunk(normalizedQuery, queryTokens, chunk, intent),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.chunk);
}

export function chunksToSources(chunks: PublicKnowledgeChunk[]): AssistantSource[] {
  const seen = new Set<string>();
  const sources: AssistantSource[] = [];
  for (const chunk of chunks) {
    const key = `${chunk.title}|${chunk.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      title: chunk.title,
      url: chunk.url,
      kind: chunk.kind,
    });
  }
  return sources;
}

export function chunksToPromptContext(chunks: PublicKnowledgeChunk[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] العنوان: ${chunk.title}\nالنوع: ${chunk.kind}\nالرابط: ${chunk.url}\nالمحتوى: ${chunk.text}`,
    )
    .join("\n\n");
}
