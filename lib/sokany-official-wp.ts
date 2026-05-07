import "server-only";

import sanitizeHtml from "sanitize-html";
import { z } from "zod";

/** WordPress REST origin for the official Sokany Egypt site (legal pages and usage posts). */
const DEFAULT_WP_ORIGIN = "https://sokany-eg.com";

/** Fails fast so prerender (e.g. `next build`) is not held up by a stuck upstream. */
const FETCH_TIMEOUT_MS = 10_000;

function wpOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_OFFICIAL_SOKANY_WP_ORIGIN?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      return DEFAULT_WP_ORIGIN;
    }
  }
  return DEFAULT_WP_ORIGIN;
}

const wpPageListSchema = z.array(
  z
    .object({
      title: z.object({ rendered: z.string() }),
      content: z.object({ rendered: z.string() }),
    })
    .passthrough(),
);

const wpPostListSchema = z.array(
  z
    .object({
      date: z.string().optional(),
      title: z.object({ rendered: z.string() }),
      content: z.object({ rendered: z.string() }),
      excerpt: z.object({ rendered: z.string() }).optional(),
    })
    .passthrough(),
);

export type SokanyWpPage = {
  title: string;
  html: string;
};

export type SokanyWpPost = {
  title: string;
  description: string;
  html: string;
  date: string | null;
  heroImage: string | null;
  productIds: number[];
  productSlugs: string[];
  wordCount: number;
};

function stripWpHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCountFromHtml(raw: string): number {
  const text = stripWpHtml(raw);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function extractFirstImageSrc(raw: string): string | null {
  const match = raw.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim() || null;
}

function extractProductIdsFromHtml(raw: string): number[] {
  const ids = new Set<number>();
  const patterns = [
    /\bdata-product_id=["'](\d+)["']/gi,
    /\bdata-product-id=["'](\d+)["']/gi,
    /[?&]product_id=(\d+)/gi,
    /[?&]add-to-cart=(\d+)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of raw.matchAll(pattern)) {
      const id = Number.parseInt(match[1] ?? "", 10);
      if (Number.isFinite(id) && id > 0) ids.add(id);
    }
  }
  return [...ids].slice(0, 12);
}

function extractProductSlugsFromHtml(raw: string): string[] {
  const slugs = new Set<string>();
  for (const match of raw.matchAll(/https?:\/\/[^"'\s<>]+\/product\/([^/"'\s<>?#]+)\/?/gi)) {
    const slug = match[1]?.trim();
    if (slug) slugs.add(slug);
  }
  for (const match of raw.matchAll(/href=["']\/product\/([^/"']+)\/?["']/gi)) {
    const slug = match[1]?.trim();
    if (slug) slugs.add(slug);
  }
  return [...slugs].slice(0, 12);
}

function localizeOfficialPostHref(href: string, internalPostBasePath?: string): string {
  if (!internalPostBasePath) return href;
  try {
    const url = new URL(href, wpOrigin());
    if (url.origin !== wpOrigin()) return href;
    const slug = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!slug || slug.includes("/")) return href;
    return `${internalPostBasePath.replace(/\/+$/g, "")}/${encodeURIComponent(slug)}`;
  } catch {
    return href;
  }
}

function sanitizeWpHtml(raw: string, options?: { internalPostBasePath?: string }): string {
  return sanitizeHtml(raw, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "svg",
      "path",
      "iframe",
      "section",
      "article",
      "main",
      "header",
      "footer",
      "figure",
      "figcaption",
      "hr",
      "br",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
      "colgroup",
      "col",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel", "title", "class", "id"],
      img: [
        "src",
        "alt",
        "title",
        "width",
        "height",
        "loading",
        "decoding",
        "class",
        "id",
        "srcset",
        "sizes",
      ],
      iframe: [
        "src",
        "title",
        "loading",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "class",
        "id",
        "aria-label",
      ],
      "*": ["class", "id", "style", "dir", "lang", "colspan", "rowspan"],
    },
    allowedIframeHostnames: [
      "www.google.com",
      "maps.google.com",
      "www.youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
    ],
    transformTags: {
      a: (tagName, attribs) => {
        const nextAttribs = { ...attribs };
        const localizedHref = attribs.href
          ? localizeOfficialPostHref(attribs.href, options?.internalPostBasePath)
          : attribs.href;
        if (localizedHref) nextAttribs.href = localizedHref;
        if (attribs.target === "_blank") nextAttribs.rel = "noopener noreferrer";
        if (localizedHref !== attribs.href) delete nextAttribs.target;
        return { tagName, attribs: nextAttribs };
      },
    },
    exclusiveFilter(frame) {
      const className = frame.attribs.class ?? "";
      return /\b(elementor-widget-wd_products|wd-products-element|wd-product|product-grid-item)\b/.test(
        className,
      );
    },
  });
}

/**
 * Fetches a published WordPress page by slug from the official site REST API.
 * Cached for one hour — legal copy changes rarely.
 * Never throws: network/timeout/parse errors return `null` so RSC prerender can fall back in UI.
 */
export async function fetchSokanyWpPage(
  slug: string,
  options?: { internalPostBasePath?: string },
): Promise<SokanyWpPage | null> {
  const origin = wpOrigin();
  const url = `${origin}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const parsed = wpPageListSchema.safeParse(json);
    if (!parsed.success || parsed.data.length === 0) return null;
    const row = parsed.data[0];
    const title = stripWpHtml(row.title.rendered) || slug;
    const html = sanitizeWpHtml(row.content.rendered, options);
    return { title, html };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[fetchSokanyWpPage] slug=${slug} failed:`, e);
    }
    return null;
  }
}

/**
 * Fetches a published WordPress post by slug from the official site REST API.
 * Cached for one hour to match the usage-list page while still picking up edits.
 */
export async function fetchSokanyWpPost(slug: string): Promise<SokanyWpPost | null> {
  const origin = wpOrigin();
  const url = `${origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const parsed = wpPostListSchema.safeParse(json);
    if (!parsed.success || parsed.data.length === 0) return null;
    const row = parsed.data[0];
    const title = stripWpHtml(row.title.rendered) || slug;
    const description = stripWpHtml(row.excerpt?.rendered ?? row.content.rendered).slice(0, 170);
    const html = sanitizeWpHtml(row.content.rendered);
    return {
      title,
      description,
      html,
      date: row.date ?? null,
      heroImage: extractFirstImageSrc(row.content.rendered),
      productIds: extractProductIdsFromHtml(row.content.rendered),
      productSlugs: extractProductSlugsFromHtml(row.content.rendered),
      wordCount: wordCountFromHtml(row.content.rendered),
    };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[fetchSokanyWpPost] slug=${slug} failed:`, e);
    }
    return null;
  }
}
