import "server-only";

import sanitizeHtml from "sanitize-html";
import { z } from "zod";

/** WordPress REST origin for the official Sokany Egypt site (legal & static pages). */
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

export type SokanyWpPage = {
  title: string;
  html: string;
};

function sanitizeWpHtml(raw: string): string {
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
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: attribs.target === "_blank" ? "noopener noreferrer" : attribs.rel,
        },
      }),
    },
  });
}

/**
 * Fetches a published WordPress page by slug from the official site REST API.
 * Cached for one hour — legal copy changes rarely.
 * Never throws: network/timeout/parse errors return `null` so RSC prerender can fall back in UI.
 */
export async function fetchSokanyWpPage(slug: string): Promise<SokanyWpPage | null> {
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
    const title = row.title.rendered.replace(/<[^>]+>/g, "").trim() || slug;
    const html = sanitizeWpHtml(row.content.rendered);
    return { title, html };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console -- dev-only prerender / upstream diagnosis
      console.warn(`[fetchSokanyWpPage] slug=${slug} failed:`, e);
    }
    return null;
  }
}
