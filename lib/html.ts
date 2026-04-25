export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strips HTML while preserving line breaks so Markdown (or structured plain text)
 * survives the WooCommerce → UI pipeline. Plain text / Markdown without tags is
 * returned with normalized newlines only.
 */
export function normalizeProductDescriptionSource(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/<[a-z!?/]/i.test(t)) {
    return stripHtmlStructured(t);
  }
  return t.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stripHtmlStructured(html: string): string {
  let t = html
    .replace(/\r\n/g, "\n")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\/\s*h[1-6]\s*>/gi, "\n\n")
    .replace(/<\/\s*div\s*>/gi, "\n\n")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "- ");
  t = t.replace(/<[^>]+>/g, "");
  t = t
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
  return t
    .split("\n")
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Roughly 120–160 chars for meta descriptions */
export function trimMetaDescription(text: string, max = 155): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}
