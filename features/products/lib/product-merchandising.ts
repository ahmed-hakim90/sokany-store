import type { Product } from "@/features/products/types";

const URL_RE = /https?:\/\/[^\s<>"')]+/gi;
const SOCIAL_VIDEO_RE = /(facebook\.com|fb\.watch|instagram\.com|youtu\.be|youtube\.com)/i;

function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getProductPlainText(product: Product): string {
  return stripHtml(product.shortDescription || product.description || "");
}

export function extractProductUrls(product: Product): string[] {
  const text = `${product.shortDescription}\n${product.description}`;
  return Array.from(text.matchAll(URL_RE), (m) => m[0].replace(/[.,،؛]+$/g, ""));
}

export function getProductVideoUrl(product: Product): string | null {
  return extractProductUrls(product).find((url) => SOCIAL_VIDEO_RE.test(url)) ?? null;
}

export function removeRawUrls(input: string): string {
  return input.replace(URL_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function getProductBenefitBullets(product: Product, max = 4): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (value: string) => {
    const cleaned = value.replace(/\s+/g, " ").trim();
    if (cleaned.length < 3 || seen.has(cleaned)) return;
    seen.add(cleaned);
    out.push(cleaned);
  };

  for (const attr of product.attributes) {
    if (!attr.visible) continue;
    const name = attr.name.replace(/^pa_/i, "").replace(/[_-]+/g, " ").trim();
    const value = attr.options.filter(Boolean).join("، ");
    if (!value) continue;
    if (/ضمان|warranty/i.test(name)) add(`ضمان ${value}`);
    else if (/قدرة|وات|power|watt/i.test(name)) add(`قدرة ${value} لأداء أقوى`);
    else if (/سرعة|speed/i.test(name)) add(`${value} للتحكم في التشغيل`);
    else if (/سعة|لتر|capacity/i.test(name)) add(`سعة ${value} مناسبة للاستخدام اليومي`);
    else add(`${name}: ${value}`);
    if (out.length >= max) return out;
  }

  const plain = getProductPlainText(product);
  for (const line of plain.split(/\n+/)) {
    const cleaned = line.replace(URL_RE, "").replace(/^[-•*\d.\s]+/, "").trim();
    if (!cleaned || cleaned.length > 90) continue;
    if (/^(النوع|القدرة|الاستخدامات|المميزات|الضمان|السعة|السرعات)/i.test(cleaned)) {
      continue;
    }
    add(cleaned);
    if (out.length >= max) return out;
  }

  if (product.inStock) add("متوفر للطلب من سوكاني EG");
  add("ضمان ضد عيوب الصناعة لمدة عام");
  return out.slice(0, max);
}

