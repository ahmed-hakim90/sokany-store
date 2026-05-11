const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670]/g;
const TATWEEL = /\u0640/g;
const NON_WORD_SEPARATORS = /[^\p{L}\p{N}]+/gu;

const STOP_WORDS = new Set([
  "في",
  "من",
  "عن",
  "على",
  "الي",
  "الى",
  "او",
  "و",
  "يا",
  "ما",
  "هل",
  "هو",
  "هي",
  "ده",
  "دي",
  "دا",
  "لو",
  "انا",
  "عايز",
  "عاوزه",
  "ممكن",
  "عندكم",
  "بتاع",
  "بتاعة",
  "اللي",
  "هذا",
  "هذه",
  "the",
  "and",
  "or",
  "for",
  "with",
]);

export function normalizeArabicText(value: string): string {
  return value
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(NON_WORD_SEPARATORS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeForArabicSearch(value: string): string[] {
  return normalizeArabicText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}
