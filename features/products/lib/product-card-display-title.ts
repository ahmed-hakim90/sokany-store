const PRODUCT_CARD_BRAND_WORD_PATTERN =
  /(^|[\s\-–—_|:،,()[\]{}]+)(?:سوكان[ىي]|sokany)(?=$|[\s\-–—_|:،,()[\]{}]+|[\p{Number}\p{Script=Latin}])/giu;

export function getProductCardDisplayTitle(rawTitle: string) {
  const title = rawTitle.trim();
  if (!title) return rawTitle;

  const displayTitle = title
    .replace(PRODUCT_CARD_BRAND_WORD_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();

  return displayTitle || title;
}
