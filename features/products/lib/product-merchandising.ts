import type { Product } from "@/features/products/types";

const URL_RE = /https?:\/\/[^\s<>"')]+/gi;
const DIRECT_VIDEO_RE = /\.(mp4|webm|ogv|ogg|mov)(?:[?#].*)?$/i;

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

function collectStringValues(value: unknown, out: string[], depth = 0): void {
  if (depth > 3 || value == null) return;
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, out, depth + 1);
  }
}

function cleanUrl(value: string): string {
  return value
    .replace(/[.,،؛]+$/g, "")
    .replace(/&amp;/gi, "&")
    .trim();
}

function unwrapRedirectUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const nested = url.searchParams.get("u") ?? url.searchParams.get("url");
    if (nested && /^https?:\/\//i.test(nested)) return nested;
  } catch {
    return rawUrl;
  }
  return rawUrl;
}

export function extractProductUrls(product: Product): string[] {
  const metaStrings: string[] = [];
  collectStringValues(product.metaData, metaStrings);
  const text = `${product.shortDescription}\n${product.description}\n${metaStrings.join("\n")}`;
  const urls = Array.from(text.matchAll(URL_RE), (m) =>
    unwrapRedirectUrl(cleanUrl(m[0])),
  );
  return Array.from(new Set(urls));
}

export function getProductVideoUrl(product: Product): string | null {
  return getProductVideoEmbed(product)?.sourceUrl ?? null;
}

export type ProductVideoEmbed =
  | { kind: "video"; sourceUrl: string; embedUrl: string }
  | { kind: "iframe"; sourceUrl: string; embedUrl: string; title: string };

function withYouTubeAutoplayParams(embedUrl: string): string {
  const url = new URL(embedUrl);
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("mute", "1");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  return url.toString();
}

function getYouTubeVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (!/(^|\.)youtube\.com$/i.test(host)) return null;
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (["embed", "shorts", "live"].includes(parts[0] ?? "")) return parts[1] ?? null;
  } catch {
    return null;
  }
  return null;
}

function getTikTokVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (!/(^|\.)tiktok\.com$/i.test(url.hostname)) return null;
    return url.pathname.match(/\/video\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

function getInstagramEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return null;
    const match = url.pathname.match(/^\/(p|reel|tv)\/([^/]+)/i);
    if (!match) return null;
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;
  } catch {
    return null;
  }
}

function getFacebookEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "fb.watch") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&autoplay=true&mute=true&show_text=false`;
    }
    if (!/(^|\.)facebook\.com$/i.test(host)) return null;
    if (!/(\/videos\/|\/watch\/?|[?&]v=)/i.test(`${url.pathname}${url.search}`)) {
      return null;
    }
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&autoplay=true&mute=true&show_text=false`;
  } catch {
    return null;
  }
}

function getProductVideoEmbedFromUrl(sourceUrl: string): ProductVideoEmbed | null {
  if (DIRECT_VIDEO_RE.test(sourceUrl)) {
    return { kind: "video", sourceUrl, embedUrl: sourceUrl };
  }

  const youtubeId = getYouTubeVideoId(sourceUrl);
  if (youtubeId) {
    return {
      kind: "iframe",
      sourceUrl,
      embedUrl: withYouTubeAutoplayParams(
        `https://www.youtube.com/embed/${youtubeId}`,
      ),
      title: "فيديو المنتج على يوتيوب",
    };
  }

  const tiktokId = getTikTokVideoId(sourceUrl);
  if (tiktokId) {
    return {
      kind: "iframe",
      sourceUrl,
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokId}`,
      title: "فيديو المنتج على تيك توك",
    };
  }

  const instagramEmbedUrl = getInstagramEmbedUrl(sourceUrl);
  if (instagramEmbedUrl) {
    return {
      kind: "iframe",
      sourceUrl,
      embedUrl: instagramEmbedUrl,
      title: "فيديو المنتج على إنستجرام",
    };
  }

  const facebookEmbedUrl = getFacebookEmbedUrl(sourceUrl);
  if (facebookEmbedUrl) {
    return {
      kind: "iframe",
      sourceUrl,
      embedUrl: facebookEmbedUrl,
      title: "فيديو المنتج على فيسبوك",
    };
  }

  return null;
}

export function getProductVideoEmbed(product: Product): ProductVideoEmbed | null {
  for (const url of extractProductUrls(product)) {
    const embed = getProductVideoEmbedFromUrl(url);
    if (embed) return embed;
  }
  return null;
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
